import {type AxiosError, type AxiosInstance,} from "axios";
import {authService} from "./authService";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error) => void;

export interface Type {
    id: string;
    title: string;
    description: string | null;
    roles: string[];
    created: string;
    updated: string;
}

export interface TypeList {
    users: Type[];
    cursor: string | null;
}

class TypeService {

    private axiosInstance: AxiosInstance | null;

    constructor() {
        this.axiosInstance = null;
    }

    public init = ({baseUrl, timeout, retries}: {
        baseUrl: string,
        timeout?: number,
        retries?: number,
    }): void => {
        this.axiosInstance = authService.createConfiguredAxiosInstance(baseUrl, timeout, retries, true);
    }

    public listTypes = (
        cursor: string | null,
        limit: number,
        success: SuccessCallback<TypeList>,
        failure: FailureCallback
    ): void => {
        let url = `/api/v1/type/list?limit=${limit}`;

        if (cursor) {
            url += `&cursor=${cursor}`;
        }

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
        const url = "/api/v1/type/";

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
        const url = `/api/v1/type/${typeId}/`;

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
        const url = `/api/v1/type/${typeId}/`;

        this.axiosInstance!.delete(url)
        .then(() => {
            success(typeId);
        })
        .catch(failure);
    }
}

export const typeService = new TypeService();
