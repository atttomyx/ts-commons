import {type AxiosError, type AxiosInstance} from "axios";
import {authService} from "./authService";
import type {OauthIntegrationList, OptionalOauthTokens} from "./types";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error) => void;

class OAuthService {

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

    public listIntegrations = (
        cursor: string | null,
        limit: number,
        success: SuccessCallback<OauthIntegrationList>,
        failure: FailureCallback
    ): void => {
        let url = `/api/v${this.version}/oauth/integration/list?limit=${limit}`;

        if (cursor) {
            url += `&cursor=${cursor}`;
        }

        this.axiosInstance!.get<OauthIntegrationList>(url)
        .then(response => {
            const json: OauthIntegrationList = response.data;

            success(json);
        })
        .catch(failure);
    }

    public loadTokens = (
        integrationId: string,
        success: SuccessCallback<OptionalOauthTokens>,
        failure: FailureCallback
    ) => {
        const url = `/api/v${this.version}/oauth/tokens/${integrationId}/`;

        this.axiosInstance!.get(url)
        .then(response => {
            const json = response.data;

            success(json);
        })
        .catch(failure);
    }

    public saveTokens = (
        integrationId: string,
        code: string,
        metadata: Record<string, any> | null,
        success: SuccessCallback<any>,
        failure: FailureCallback
    ) => {
        const url = `/api/v${this.version}/oauth/tokens`;

        this.axiosInstance!.post(url, {
            integrationId: integrationId,
            code: code,
            metadata: metadata,
        })
        .then(response => {
            const json = response.data;

            success(json);
        })
        .catch(failure);
    }

    public saveSettings = (
        integrationId: string,
        metadata: Record<string, any> | null,
        success: SuccessCallback<any>,
        failure: FailureCallback
    ) => {
        const url = `/api/v${this.version}/oauth/tokens`;

        this.axiosInstance!.put(url, {
            integrationId: integrationId,
            metadata: metadata,
        })
        .then(response => {
            const json = response.data;

            success(json);
        })
        .catch(failure);
    }

    public deleteTokens = (
        integrationId: string,
        success: SuccessCallback<string>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/oauth/tokens/${integrationId}/`;

        this.axiosInstance!.delete(url)
        .then(() => {
            success(integrationId);
        })
        .catch(failure);
    }
}

export const oauthService = new OAuthService();
