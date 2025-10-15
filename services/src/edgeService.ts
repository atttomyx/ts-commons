import {type AxiosError, type AxiosInstance} from "axios";
import type {Edge, EdgeList} from "./types";
import {authService} from "./authService";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error) => void;

class EdgeService {

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

    public listEdges = (
        cursor: string | null,
        limit: number,
        success: SuccessCallback<EdgeList>,
        failure: FailureCallback
    ): void => {
        let url = `/api/v1/edge/list?limit=${limit}`;

        if (cursor) {
            url += `&cursor=${cursor}`;
        }

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
        const url = "/api/v1/edge/";

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
        const url = `/api/v1/edge/${edgeId}/`;

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
        const url = `/api/v1/edge/${edgeId}/`;

        this.axiosInstance!.delete(url)
        .then(() => {
            success(edgeId);
        })
        .catch(failure);
    }
}

export const edgeService = new EdgeService();
