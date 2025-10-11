import {type AxiosError, type AxiosInstance,} from "axios";
import {type User, type UserUtils} from "./userService";
import {authService} from "./authService";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error) => void;

export interface Branding {
    logoUrl: string | null;
    logoContainsName: boolean;
    primaryColor: string;
    secondaryColor: string;
}

export interface Account {
    id: string;
    name: string;
    website: string | null;
    branding: Branding;
    allowJoin: boolean;
    code: string | null;
    created: string;
    modified: string;
    settings: Record<string, string | number | boolean | null>;
    decorations: Record<string, string | number | boolean | null>;
}

export interface Join {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    password: string;
    code: string;
}

export interface AccountUser {
    account: Account;
    user: User;
}

export interface AccountUtils {
    sanitizeAccount: (account: Account) => void;
}

class AccountService {

    private axiosInstance1: AxiosInstance | null;
    private axiosInstance2: AxiosInstance | null;
    private accountUtils: AccountUtils | null;
    private userUtils: UserUtils | null;

    constructor() {
        this.axiosInstance1 = null;
        this.axiosInstance2 = null;
        this.accountUtils = null;
        this.userUtils = null;
    }

    public init = ({baseUrl, timeout, retries, accountUtils, userUtils}: {
        baseUrl: string,
        timeout?: number,
        retries?: number,
        accountUtils: AccountUtils,
        userUtils: UserUtils,
    }): void => {
        this.axiosInstance1 = authService.createConfiguredAxiosInstance(baseUrl, timeout, retries, true);
        this.axiosInstance2 = authService.createConfiguredAxiosInstance(baseUrl, timeout, retries, false);
        this.accountUtils = accountUtils;
        this.userUtils = userUtils;
    }

    public loadAccount = (success: SuccessCallback<Account>, failure: FailureCallback) => {
        this.axiosInstance1!.get("/api/v1/account/")
        .then(response => {
            const account = response.data;

            this.accountUtils!.sanitizeAccount(account);
            success(account);
        })
        .catch(failure);
    }

    public saveAccount = (account: Partial<Account>, success: SuccessCallback<Account>, failure: FailureCallback) => {
        this.axiosInstance1!.put("/api/v1/account/", {
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

    public joinAccount = (user: Join, success: SuccessCallback<AccountUser>, failure: FailureCallback) => {
        this.axiosInstance2!.post("/api/v1/account/join", {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            password: user.password,
            code: user.code,
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
        this.axiosInstance1!.put("/api/v1/account/joinAdditional", {
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
