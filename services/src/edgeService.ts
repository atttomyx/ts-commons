import {type AxiosError, type AxiosInstance} from "axios";
import type {Edge, EdgeList} from "./types";
import {authService} from "./authService";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error | string) => void;

class EdgeService {

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
            failure("EdgeService not initialized");
        }
    }

    public listEdges = (
        cursor: string | null,
        limit: number,
        success: SuccessCallback<EdgeList>,
        failure: FailureCallback
    ): void => {
        let url = `/api/v${this.version}/edge/list?limit=${limit}`;

        if (cursor) {
            url += `&cursor=${cursor}`;
        }

        this.failIfNotInitialized(failure);
        this.axiosInstance!.get<EdgeList>(url)
        .then(response => {
            const json: EdgeList = response.data;

            success(json);
        })
        .catch(failure);
    }

    public createEdge = (
        edge: Partial<Edge>,
        success: SuccessCallback<Edge>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/edge/`;

        this.failIfNotInitialized(failure);
        this.axiosInstance!.post<Edge>(url, {
            sourceNodeId: edge.sourceNodeId,
            targetNodeId: edge.targetNodeId,
            category: edge.category,
            label: edge.label,
            metadata: edge.metadata,
        })
        .then(response => {
            const json: Edge = response.data;

            success(json);
        })
        .catch(failure);
    }

    public saveEdge = (
        edgeId: string,
        edge: Partial<Edge>,
        success: SuccessCallback<Edge>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/edge/${edgeId}/`;

        this.failIfNotInitialized(failure);
        this.axiosInstance!.put<Edge>(url, {
            sourceNodeId: edge.sourceNodeId,
            targetNodeId: edge.targetNodeId,
            category: edge.category,
            label: edge.label,
            metadata: edge.metadata,
        })
        .then(response => {
            const json: Edge = response.data;

            success(json);
        })
        .catch(failure);
    }

    public deleteEdge = (
        edgeId: string,
        success: SuccessCallback<string>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v${this.version}/edge/${edgeId}/`;

        this.failIfNotInitialized(failure);
        this.axiosInstance!.delete(url)
        .then(() => {
            success(edgeId);
        })
        .catch(failure);
    }
}

export const edgeService = new EdgeService();
