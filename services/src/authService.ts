import axios, {
    type AxiosError,
    type AxiosInstance,
    type AxiosPromise,
    type AxiosRequestConfig,
    type AxiosResponse,
    type CancelTokenSource,
    type InternalAxiosRequestConfig
} from "axios";
import axiosRetry from "axios-retry";
import {type Account} from "./accountService";
import {type StorageFacade, storageUtils, stringUtils} from "@milesoft/typescript-utils";
import {keys} from "@milesoft/typescript-constants";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error) => void;

export interface AuthUser {
    appId: string;
    accountId: string;
    userId: string;
    email: string;
    roles: string[];
}

export interface LoginResponse {
    accounts: Account[] | null;
    cursor: string;
}

export interface RecoverResponse {
    password: string;
}

export interface Login {
    userId: string;
    created: string;
    updated: string;
}

export interface LoginList {
    users: Login[];
    cursor: string | null;
}

class AuthService {

    private local: StorageFacade;
    private session: StorageFacade;
    private source: CancelTokenSource;
    private axiosInstance1: AxiosInstance | null;   // includes auth header
    private axiosInstance2: AxiosInstance | null;   // excludes auth header
    private onRequestSuccess: ((config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>) | null;
    private onResponseSuccess: ((response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>) | null;
    private onResponseError: ((error: AxiosError) => Promise<AxiosResponse | AxiosError>) | null;

    constructor() {
        this.local = storageUtils.getLocal();
        this.session = storageUtils.getSession();
        this.source = axios.CancelToken.source();
        this.axiosInstance1 = null;
        this.axiosInstance2 = null;
        this.onRequestSuccess = null;
        this.onResponseSuccess = null;
        this.onResponseError = null;
    }

    public init = ({baseUrl, timeout = 60 * 1000, retries = 3, onUnauthenticated}: {
        baseUrl: string,
        timeout: number,
        retries: number,
        onUnauthenticated: () => void | null,
    }): void => {
        this.onRequestSuccess = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
            const token: string | null = this.local.getStr(keys.authToken);

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            config.cancelToken = this.source.token;

            return config;
        };

        this.onResponseSuccess = (response: AxiosResponse): AxiosResponse => response;

        this.onResponseError = (err: AxiosError): AxiosPromise => {
            const status: number = err.response ? err.response.status : 0;

            if ((status === 403 || status === 401) && onUnauthenticated) {
                onUnauthenticated();
            }

            return Promise.reject(err);
        };

        this.axiosInstance1 = this.createConfiguredAxiosInstance(baseUrl, timeout, retries, true);
        this.axiosInstance2 = this.createConfiguredAxiosInstance(baseUrl, timeout, retries, false);
    }

    public createConfiguredAxiosInstance = (baseUrl: string, timeout: number = 60 * 1000, retries: number = 3, interceptors: boolean = true): AxiosInstance => {
        const instance = axios.create({
            baseURL: baseUrl,
            timeout: timeout,
        } as AxiosRequestConfig);

        axiosRetry(instance, {
            retries: retries,
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: axiosRetry.isSafeRequestError,
        });

        if (interceptors) {
            instance.interceptors.request.use(this.onRequestSuccess!);
            instance.interceptors.response.use(this.onResponseSuccess!, this.onResponseError!);
        }

        return instance;
    }

    public cancelAllRequests = (reason: string): void => {
        this.source.cancel(reason);
        this.source = axios.CancelToken.source();
    };

    public loggedIn = (): boolean => {
        const jwt: string | null = this.local.getStr(keys.authToken);
        return stringUtils.isNotBlank(jwt);
    }

    public storeAuthToken = (jwt: string): void => {
        this.local.setStr(keys.authToken, jwt);
    }

    public clearAuthToken = (): void => {
        this.local.clear(keys.authToken);
    }

    public getTemporaryPassword = (): string | null => {
        return this.session.getStr(keys.tempPassword);
    }

    public storeTemporaryPassword = (temporaryPassword: string): void => {
        this.session.setStr(keys.tempPassword, temporaryPassword);
    }

    public clearTemporaryPassword = (): void => {
        this.session.clear(keys.tempPassword);
    }

    private recordLogin = (): void => {
        const timestamp: string = Date.now().toString();
        this.local.setStr(keys.loginAt, timestamp);
    }

    public recordLoginIfNecessary = (failure: FailureCallback): void => {
        const previous: string | null = this.local.getStr(keys.loginAt);

        if (previous) {
            const previousTimestamp: number = parseInt(previous, 10);
            const elapsed: number = Date.now() - previousTimestamp;
            const hours: number = elapsed / (1000 * 60 * 60);

            console.log(`login ${hours.toFixed(2)} hours ago`);

            if (!isNaN(hours) && hours >= 24) {
                this.axiosInstance1!.post("/api/v1/auth/recordLogin", {})
                .then(this.recordLogin)
                .catch(failure);
            }
        } else {
            this.recordLogin();
        }
    }

    public listLogins = (
        cursor: string | null,
        limit: number,
        success: SuccessCallback<LoginList>,
        failure: FailureCallback
    ) => {
        let url = "/api/v1/auth/listLogins?limit=" + limit;

        if (cursor) {
            url += "&cursor=" + cursor;
        }

        this.axiosInstance1!.get(url)
        .then(response => {
            const json = response.data;

            success(json);
        })
        .catch(failure);
    }

    public getLoggedInUser = (success: SuccessCallback<AuthUser>, failure: FailureCallback): void => {
        this.axiosInstance1!.get<AuthUser>("/api/v1/auth/user")
        .then(response => {
            success(response.data);
        })
        .catch(failure);
    }

    public findAccounts = (success: SuccessCallback<Account[]>, failure: FailureCallback): void => {
        this.axiosInstance1!.get("/api/v1/auth/accounts")
        .then(response => {
            const json = response.data;

            success(json.accounts);
        })
        .catch(failure);
    }

    public login = (
        email: string,
        password: string,
        accountId: string | null,
        success: SuccessCallback<LoginResponse>,
        failure: FailureCallback
    ): void => {
        this.axiosInstance1!.post<LoginResponse>("/api/v1/auth/login", {
            email: email,
            password: password,
            rememberMe: true,
            accountId: accountId,
        })
        .then(response => {
            const bearerToken: string | undefined = response.headers.authorization;

            if (bearerToken && bearerToken.slice(0, 7) === 'Bearer ') {
                const jwt: string = bearerToken.slice(7, bearerToken.length);

                this.storeAuthToken(jwt);
            }

            success(response.data);
        })
        .catch(failure);
    }

    public changePassword = (
        existing: string,
        password: string,
        success: SuccessCallback<void>,
        failure: FailureCallback
    ): void => {
        this.axiosInstance1!.put("/api/v1/auth/password", {
            existing: existing,
            password: password,
        })
        .then(() => {
            success();
        })
        .catch(failure);
    }

    public forgotPassword = (
        email: string,
        method: string,
        success: SuccessCallback<void>,
        failure: FailureCallback
    ): void => {
        this.axiosInstance1!.post("/api/v1/auth/forgot", {
            email: email,
            method: method,
        })
        .then(() => {
            success();
        })
        .catch(failure);
    }

    public recoverPassword = (
        email: string,
        code: string,
        success: SuccessCallback<string>,
        failure: FailureCallback
    ): void => {
        this.axiosInstance2!.put<RecoverResponse>("/api/v1/auth/recover", {
            email: email,
            code: code,
        })
        .then(response => {
            success(response.data.password);
        })
        .catch(failure);
    }
}

export const authService = new AuthService();
