import {type AxiosError, type AxiosInstance,} from "axios";
import type {Profile, User, UserList, UserUtils} from "./types";
import {authService} from "./authService";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error) => void;

class UserService {

    private axiosInstance: AxiosInstance | null;
    private userUtils: UserUtils | null;

    constructor() {
        this.axiosInstance = null;
        this.userUtils = null;
    }

    public init = ({baseUrl, timeout, retries, userUtils}: {
        baseUrl: string,
        timeout?: number,
        retries?: number,
        userUtils: UserUtils
    }): void => {
        this.axiosInstance = authService.createConfiguredAxiosInstance(baseUrl, timeout, retries, true);
        this.userUtils = userUtils;
    }

    public loadProfile = (success: SuccessCallback<Profile>, failure: FailureCallback) => {
        this.axiosInstance!.get("/api/v1/profile/")
        .then(response => {
            const profile = response.data;

            this.userUtils!.sanitizeProfile(profile);
            success(profile);
        })
        .catch(failure);
    }

    public saveProfile = (profile: Profile, success: SuccessCallback<Profile>, failure: FailureCallback) => {
        this.axiosInstance!.put("/api/v1/profile/", {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            phone: profile.phone,
            imageUrl: profile.imageUrl,
            settings: profile.settings,
        })
        .then(response => {
            const saved = response.data;

            this.userUtils!.sanitizeProfile(saved);
            success(saved);
        })
        .catch(failure);
    }

    public listUsers = (
        cursor: string | null,
        limit: number,
        success: SuccessCallback<UserList>,
        failure: FailureCallback
    ): void => {
        let url = `/api/v1/user/list?limit=${limit}`;

        if (cursor) {
            url += `&cursor=${cursor}`;
        }

        this.axiosInstance!.get<UserList>(url)
        .then(response => {
            const json: UserList = response.data;

            json.users.forEach(user => this.userUtils!.sanitizeUser(user));

            success(json);
        })
        .catch(failure);
    }

    public listRemovedUsers = (
        cursor: string | null,
        limit: number,
        success: SuccessCallback<UserList>,
        failure: FailureCallback
    ) => {
        let url = "/api/v1/user/removed?limit=" + limit;

        if (cursor) {
            url += "&cursor=" + cursor;
        }

        this.axiosInstance!.get<UserList>(url)
        .then(response => {
            const json = response.data;

            json.users.forEach(user => this.userUtils!.sanitizeUser(user));

            success(json);
        })
        .catch(failure);
    }

    public createUser = (
        user: Partial<User>,
        success: SuccessCallback<User>,
        failure: FailureCallback
    ): void => {
        const url = "/api/v1/user/";

        this.axiosInstance!.post<User>(url, {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            typeId: user.typeId,
            roles: user.roles,
            settings: user.settings,
        })
        .then(response => {
            const created: User = response.data;

            this.userUtils!.sanitizeUser(created);
            success(created);
        })
        .catch(failure);
    }

    public saveUser = (
        userId: string,
        user: Partial<User>,
        success: SuccessCallback<User>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v1/user/${userId}/`;

        this.axiosInstance!.put<User>(url, {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            imageUrl: user.imageUrl,
            typeId: user.typeId,
            roles: user.roles,
            settings: user.settings,
        })
        .then(response => {
            const saved: User = response.data;

            this.userUtils!.sanitizeUser(saved);
            success(saved);
        })
        .catch(failure);
    }

    public deleteUser = (
        userId: string,
        success: SuccessCallback<string>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v1/user/${userId}/`;

        this.axiosInstance!.delete(url)
        .then(() => {
            success(userId);
        })
        .catch(failure);
    }
}

export const userService = new UserService();
