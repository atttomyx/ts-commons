import {type AxiosError, type AxiosInstance} from "axios";
import type {Account, AccountUser, AccountUtils, Join, UserUtils} from "./types";
import {authService} from "./authService";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error) => void;

class AccountService {

    private version: number;
    private axiosInstance1: AxiosInstance | null;
    private axiosInstance2: AxiosInstance | null;
    private accountUtils: AccountUtils | null;
    private userUtils: UserUtils | null;

    constructor() {
        this.version = 1;
        this.axiosInstance1 = null;
        this.axiosInstance2 = null;
        this.accountUtils = null;
        this.userUtils = null;
    }

    public init = ({version, baseUrl, timeout, retries, accountUtils, userUtils}: {
        version: number,
        baseUrl: string,
        timeout?: number,
        retries?: number,
        accountUtils: AccountUtils,
        userUtils: UserUtils,
    }): void => {
        this.version = version;
        this.axiosInstance1 = authService.createConfiguredAxiosInstance(baseUrl, timeout, retries, true);
        this.axiosInstance2 = authService.createConfiguredAxiosInstance(baseUrl, timeout, retries, false);
        this.accountUtils = accountUtils;
        this.userUtils = userUtils;
    }

    public loadAccount = (success: SuccessCallback<Account>, failure: FailureCallback) => {
        const url = `/api/v${this.version}/account/`;

        this.axiosInstance1!.get(url)
        .then(response => {
            const account = response.data;

            this.accountUtils!.sanitizeAccount(account);
            success(account);
        })
        .catch(failure);
    }

    public saveAccount = (account: Partial<Account>, success: SuccessCallback<Account>, failure: FailureCallback) => {
        const url = `/api/v${this.version}/account/`;

        this.axiosInstance1!.put(url, {
            name: account.name,
            website: account.website,
            branding: account.branding,
            allowJoin: account.allowJoin,
            settings: account.settings,
        })
        .then(response => {
            const account = response.data;

            this.accountUtils!.sanitizeAccount(account);
            success(account);
        })
        .catch(failure);
    }

    public joinAccount = (join: Join, success: SuccessCallback<AccountUser>, failure: FailureCallback) => {
        const url = `/api/v${this.version}/account/join`;

        this.axiosInstance2!.post(url, {
            user: join.user ? {
                firstName: join.user.firstName,
                lastName: join.user.lastName,
                email: join.user.email,
                phone: join.user.phone,
                password: join.user.password,
            } : undefined,
            google: join.google,
            code: join.code,
        })
        .then(response => {
            const json = response.data;

            this.accountUtils!.sanitizeAccount(json.account);
            this.userUtils!.sanitizeUser(json.user);

            success(json);
        })
        .catch(failure);
    };

    public joinAdditionalAccount = (code: string, success: SuccessCallback<AccountUser>, failure: FailureCallback) => {
        const url = `/api/v${this.version}/account/joinAdditional`;

        this.axiosInstance1!.put(url, {
            code: code,
        })
        .then(response => {
            const json = response.data;

            this.accountUtils!.sanitizeAccount(json.account);
            this.userUtils!.sanitizeUser(json.user);

            success(json);
        })
        .catch(failure);
    };
}

export const accountService = new AccountService();
