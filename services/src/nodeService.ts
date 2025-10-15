import {type AxiosError, type AxiosInstance} from "axios";
import type {LabeledAddress, LabeledString, Node, NodeList} from "./types";
import {authService} from "./authService";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error) => void;

class NodeService {

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

    public listNodes = (
        cursor: string | null,
        limit: number,
        success: SuccessCallback<NodeList>,
        failure: FailureCallback
    ): void => {
        let url = `/api/v1/node/list?limit=${limit}`;

        if (cursor) {
            url += `&cursor=${cursor}`;
        }

        this.axiosInstance!.get<NodeList>(url)
        .then(response => {
            const json: NodeList = response.data;

            success(json);
        })
        .catch(failure);
    }

    public createNode = (
        node: Partial<Node>,
        success: SuccessCallback<Node>,
        failure: FailureCallback
    ): void => {
        const url = "/api/v1/node/";

        this.axiosInstance!.post<Node>(url, {
            imageUrl: node.imageUrl,
            firstName: node.firstName,
            lastName: node.lastName,
            phones: this.sanitizeLabeledStrings(node.phones),
            emails: this.sanitizeLabeledStrings(node.emails),
            urls: this.sanitizeLabeledStrings(node.urls),
            addresses: this.sanitizeLabeledAddresses(node.addresses),
            dates: this.sanitizeLabeledStrings(node.dates),
            others: this.sanitizeLabeledStrings(node.others),
            tags: node.tags,
            metadata: node.metadata,
        })
        .then(response => {
            const json: Node = response.data;

            success(json);
        })
        .catch(failure);
    }

    public saveNode = (
        nodeId: string,
        node: Partial<Node>,
        success: SuccessCallback<Node>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v1/node/${nodeId}/`;

        this.axiosInstance!.put<Node>(url, {
            imageUrl: node.imageUrl,
            firstName: node.firstName,
            lastName: node.lastName,
            phones: this.sanitizeLabeledStrings(node.phones),
            emails: this.sanitizeLabeledStrings(node.emails),
            urls: this.sanitizeLabeledStrings(node.urls),
            addresses: this.sanitizeLabeledAddresses(node.addresses),
            dates: this.sanitizeLabeledStrings(node.dates),
            others: this.sanitizeLabeledStrings(node.others),
            tags: node.tags,
            metadata: node.metadata,
        })
        .then(response => {
            const json: Node = response.data;

            success(json);
        })
        .catch(failure);
    }

    public deleteNode = (
        nodeId: string,
        success: SuccessCallback<string>,
        failure: FailureCallback
    ): void => {
        const url = `/api/v1/node/${nodeId}/`;

        this.axiosInstance!.delete(url)
        .then(() => {
            success(nodeId);
        })
        .catch(failure);
    }

    private sanitizeLabeledStrings = (labeledStrings?: LabeledString[]) => {
        return labeledStrings ? labeledStrings.map(this.sanitizeLabeledString) : [];
    }

    private sanitizeLabeledString = (labeledString: LabeledString) => {
        return {
            label: labeledString.label,
            value: labeledString.value,
        }
    }

    private sanitizeLabeledAddresses = (labeledAddresses?: LabeledAddress[]) => {
        return labeledAddresses ? labeledAddresses.map(this.sanitizeLabeledAddress) : [];
    }

    private sanitizeLabeledAddress = (labeledAddress: LabeledAddress) => {
        return {
            label: labeledAddress.label,
            line1: labeledAddress.line1,
            line2: labeledAddress.line2,
            locality: labeledAddress.locality,
            region: labeledAddress.region,
            postalCode: labeledAddress.postalCode,
            country: labeledAddress.country,
        }
    }
}

export const nodeService = new NodeService();
