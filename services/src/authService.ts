import axios, {
    type AxiosError,
    type AxiosInstance,
    type AxiosPromise,
    type AxiosRequestConfig,
    type AxiosResponse, AxiosResponseHeaders,
    type CancelTokenSource,
    type InternalAxiosRequestConfig, RawAxiosResponseHeaders
} from "axios";
import axiosRetry from "axios-retry";
import type {Account, AuthUser, LoginList, LoginResponse, Profile} from "./types";
import {type StorageFacade, storageUtils, stringUtils} from "@milesoft/typescript-utils";
import {keys} from "@milesoft/typescript-constants";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error) => void;

class AuthService {

    private local: StorageFacade;
    private source: CancelTokenSource;
    private version: number;
    private axiosInstance1: AxiosInstance | null;   // includes auth header
    private axiosInstance2: AxiosInstance | null;   // excludes auth header
    private onRequestSuccess: ((config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>) | null;
    private onResponseSuccess: ((response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>) | null;
    private onResponseError: ((error: AxiosError) => Promise<AxiosResponse | AxiosError>) | null;

    constructor() {
        this.local = storageUtils.getLocal();
        this.source = axios.CancelToken.source();
        this.version = 1;
        this.axiosInstance1 = null;
        this.axiosInstance2 = null;
        this.onRequestSuccess = null;
        this.onResponseSuccess = null;
        this.onResponseError = null;
    }

    public init = ({version, baseUrl, timeout = 60 * 1000, retries = 3, onUnauthenticated}: {
        version: number,
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

            if (status === 401 || status === 403) {
                this.clearAuthToken();

                if (onUnauthenticated) {
                    onUnauthenticated();
                }
            }

            return Promise.reject(err);
        };

        this.version = version;
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
                const url = `/api/v${this.version}/auth/recordLogin`;

                this.axiosInstance1!.post(url, {})
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
        let url = `/api/v${this.version}/auth/listLogins?limit=${limit}`;

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
        const url = `/api/v${this.version}/auth/user`;

        this.axiosInstance1!.get<AuthUser>(url)
        .then(response => {
            success(response.data);
        })
        .catch(failure);
    }

    public findAccounts = (success: SuccessCallback<Account[]>, failure: FailureCallback): void => {
        const url = `/api/v${this.version}/auth/accounts`;

        this.axiosInstance1!.get(url)
        .then(response => {
            const json = response.data;

            success(json.accounts);
        })
        .catch(failure);
    }

    public welcomeLogin = (
        nonce: string,
        success: SuccessCallback<void>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/auth/welcome`;

        this.axiosInstance2!.post<void>(url, {
            nonce: nonce,
        })
        .then(response => {
            this.extractAuthHeader(response.headers);
            success();
        })
        .catch(failure);
    }

    public userLogin = (
        email: string,
        password: string,
        accountId: string | null,
        success: SuccessCallback<LoginResponse>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/auth/login`;

        this.axiosInstance2!.post<LoginResponse>(url, {
            email: email,
            password: password,
            accountId: accountId,
        })
        .then(response => {
            this.extractAuthHeader(response.headers);
            success(response.data);
        })
        .catch(failure);
    }

    public googleLogin = (
        token: string,
        accountId: string | null,
        success: SuccessCallback<LoginResponse>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/auth/google`;

        this.axiosInstance2!.post<LoginResponse>(url, {
            token: token,
            accountId: accountId,
        })
        .then(response => {
            this.extractAuthHeader(response.headers);
            success(response.data);
        })
        .catch(failure);
    }

    public linkGoogle = (
        token: string,
        success: SuccessCallback<Profile>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/auth/linkGoogle`;

        this.axiosInstance1!.post(url, {
            token: token,
        })
        .then((response) => {
            success(response.data);
        })
        .catch(failure);
    }

    public changePassword = (
        existing: string | null,
        password: string,
        success: SuccessCallback<Profile>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/auth/password`;

        this.axiosInstance1!.put(url, {
            existing: existing,
            password: password,
        })
        .then((response) => {
            success(response.data);
        })
        .catch(failure);
    }

    public forgotPassword = (
        email: string | null,
        phone: string | null,
        method: string,
        success: SuccessCallback<void>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/auth/forgot`;

        this.axiosInstance2!.post(url, {
            email: email,
            phone: phone,
            method: method,
        })
        .then(() => {
            success();
        })
        .catch(failure);
    }

    public recoverPassword = (
        email: string | null,
        phone: string | null,
        code: string,
        success: SuccessCallback<LoginResponse>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/auth/recover`;

        this.axiosInstance2!.put<LoginResponse>(url, {
            email: email,
            phone: phone,
            code: code,
        })
        .then(response => {
            this.extractAuthHeader(response.headers);
            success(response.data);
        })
        .catch(failure);
    }

    public switchAccounts = (
        accountId: string,
        success: SuccessCallback<void>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/auth/switch`;

        this.axiosInstance1!.put<void>(url, {
            accountId: accountId,
        })
        .then(response => {
            this.extractAuthHeader(response.headers);
            success();
        })
        .catch(failure);
    }

    private extractAuthHeader = (headers: RawAxiosResponseHeaders | AxiosResponseHeaders): void => {
        const bearerToken: string | undefined = headers.authorization;

        if (bearerToken && bearerToken.slice(0, 7) === 'Bearer ') {
            const jwt: string = bearerToken.slice(7, bearerToken.length);

            this.storeAuthToken(jwt);
        }
    }
}

export const authService = new AuthService();
