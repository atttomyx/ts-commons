import {type AxiosError, type AxiosInstance} from "axios";
import type {Type, TypeList} from "./types";
import {authService} from "./authService";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error | string) => void;

class TypeService {

    private version: number;
    private axiosInstance: AxiosInstance | null;

    constructor() {
        this.version = 1;
        this.axiosInstance = null;
    }

    public init = ({version, baseUrl, timeout, retries}: {
        version: number,
        baseUrl: string,
        timeout?: number,
        retries?: number,
    }): void => {
        this.version = version;
        this.axiosInstance = authService.createConfiguredAxiosInstance(baseUrl, timeout, retries, true);
    }

    private failIfNotInitialized = (failure: FailureCallback): void => {
        if (!this.axiosInstance) {
            failure("TypeService not initialized");
        }
    }

    public listTypes = (
        cursor: string | null,
        limit: number,
        success: SuccessCallback<TypeList>,
        failure: FailureCallback
    ): void => {
        let url = `/api/v${this.version}/type/list?limit=${limit}`;

        if (cursor) {
            url += `&cursor=${cursor}`;
        }

        this.failIfNotInitialized(failure);
        this.axiosInstance!.get<TypeList>(url)
        .then(response => {
            const json: TypeList = response.data;

            success(json);
        })
        .catch(failure);
    }

    public createType = (
        type: Partial<Type>,
        success: SuccessCallback<Type>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/type/`;

        this.failIfNotInitialized(failure);
        this.axiosInstance!.post<Type>(url, {
            title: type.title,
            description: type.description,
            roles: type.roles,
        })
        .then(response => {
            const json: Type = response.data;

            success(json);
        })
        .catch(failure);
    }

    public saveType = (
        typeId: string,
        type: Partial<Type>,
        success: SuccessCallback<Type>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/type/${typeId}/`;

        this.failIfNotInitialized(failure);
        this.axiosInstance!.put<Type>(url, {
            title: type.title,
            description: type.description,
            roles: type.roles,
        })
        .then(response => {
            const json: Type = response.data;

            success(json);
        })
        .catch(failure);
    }

    public deleteType = (
        typeId: string,
        success: SuccessCallback<string>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/type/${typeId}/`;

        this.failIfNotInitialized(failure);
        this.axiosInstance!.delete(url)
        .then(() => {
            success(typeId);
        })
        .catch(failure);
    }
}

export const typeService = new TypeService();
