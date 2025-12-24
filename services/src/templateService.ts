import {type AxiosError, type AxiosInstance} from "axios";
import {authService} from "./authService";
import {Template, TemplateList} from "./types";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error | string) => void;

class TemplateService {

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

    public listTemplates = (
        cursor: string | null,
        limit: number,
        success: SuccessCallback<TemplateList>,
        failure: FailureCallback
    ): void => {
        let url = `/api/v${this.version}/template/list?limit=${limit}`;

        if (cursor) {
            url += `&cursor=${cursor}`;
        }

        this.axiosInstance!.get<TemplateList>(url)
            .then(response => {
                const json: TemplateList = response.data;
                success(json);
            })
            .catch(failure);
    };

    public createTemplate = (
        template: Partial<Template>,
        success: SuccessCallback<Template>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/template/`;

        this.axiosInstance!.post<Template>(url, {
            name: template.name,
            content: template.content,
            extra: template.extra,
            order: template.order,
            metadata: template.metadata,
        })
            .then(response => {
                const json: Template = response.data;
                success(json);
            })
            .catch(failure);
    };

    public updateTemplate = (
        templateId: string,
        template: Partial<Template>,
        success: SuccessCallback<Template>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/template/${templateId}/`;

        this.axiosInstance!.put<Template>(url, {
            name: template.name,
            content: template.content,
            extra: template.extra,
            order: template.order,
            metadata: template.metadata,
        })
            .then(response => {
                const json: Template = response.data;
                success(json);
            })
            .catch(failure);
    };

    public cloneTemplate = (
        templateId: string,
        success: SuccessCallback<Template>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/template/${templateId}/`;

        this.axiosInstance!.post<Template>(url)
            .then(response => {
                const json: Template = response.data;
                success(json);
            })
            .catch(failure);
    };

    public deleteTemplate = (
        templateId: string,
        success: SuccessCallback<string>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/template/${templateId}/`;

        this.axiosInstance!.delete(url)
            .then(() => {
                success(templateId);
            })
            .catch(failure);
    };
}

export const templateService = new TemplateService();
