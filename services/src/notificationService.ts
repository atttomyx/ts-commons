import {authService} from "@milesoft/typescript-services";
import {objectUtils, stringUtils} from "@milesoft/typescript-utils";
import {type AxiosError, type AxiosInstance} from "axios";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error) => void;

export interface Notification {
    id: string;
    type: string;
    mail: boolean;
    state: NotificationState;
    title: string;
    description?: string;
    gotoUrl?: string;
    metadata?: Record<string, any>;
    created: string;
    updated: string;
}

export interface NotificationList {
    notifications: Notification[];
    cursor?: string;
}

export type DeliveryType =
    | "None"
    | "Mobile"
    | "App"
    | "Email";

export type NotificationState =
    | "New"
    | "Read";

export interface NotificationType {
    role: string | null;
    description: string;
    delivery: DeliveryType;
}

export interface TopicType {
    role: string | null;
    description: string;
    subscribed: boolean;
}

export interface Preferences {
    messagingToken: string | null;
    deliveries: Record<string, DeliveryType>;
    topics: Record<string, boolean>;
}

class NotificationService {

    private version: number;
    private axiosInstance: AxiosInstance | null;
    private notificationTypes: Record<string, NotificationType> | null;
    private topicTypes: Record<string, TopicType> | null;

    constructor() {
        this.version = 1;
        this.axiosInstance = null;
        this.notificationTypes = null;
        this.topicTypes = null;
    }

    public init = ({version, baseUrl, timeout, retries, notificationTypes, topics}: {
        version: number,
        baseUrl: string,
        timeout?: number,
        retries?: number,
        notificationTypes?: Record<string, NotificationType>,
        topics?: Record<string, TopicType>,
    }): void => {
        this.version = version;
        this.axiosInstance = authService.createConfiguredAxiosInstance(baseUrl, timeout, retries, true);
        this.notificationTypes = notificationTypes;
        this.topicTypes = topics;
    }

    public listNotifications = (
        cursor: string | null,
        limit: number,
        success: SuccessCallback<NotificationList>,
        failure: FailureCallback
    ): void => {
        let url = `/api/v${this.version}/type/list?limit=${limit}`;

        if (cursor) {
            url += `&cursor=${cursor}`;
        }

        this.axiosInstance!.get<NotificationList>(url)
        .then(response => {
            const json: NotificationList = response.data;

            success(json);
        })
        .catch(failure);
    }

    public markAsRead = (
        notificationIds: string[],
        success: SuccessCallback<string[]>,
        failure: FailureCallback
    ) => {
        const url = `/api/v${this.version}/notification/markAsRead`;

        this.axiosInstance!.post(url, {
            ids: notificationIds,
        })
        .then(() => {
            success(notificationIds);
        })
        .catch(failure);
    }

    public deleteNotifications = (
        notificationIds: string[],
        success: SuccessCallback<string[]>,
        failure: FailureCallback
    ) => {
        const url = `/api/v${this.version}/notification/bulkDelete`;

        this.axiosInstance!.post(url, {
            ids: notificationIds,
        })
        .then(() => {
            success(notificationIds);
        })
        .catch(failure);
    }

    public loadPreferences = (
        success: SuccessCallback<Preferences>,
        failure: FailureCallback
    ) => {
        const url = `/api/v${this.version}/notification/preferences`;

        this.axiosInstance!.get(url)
        .then(response => {
            const json = response.data;

            json.deliveries = this.sanitizeDeliveries(json.deliveries);
            json.topics = this.sanitizeTopics(json.topics);

            success(json);
        })
        .catch(failure);
    }

    public savePreferences = (
        preferences: Preferences,
        success: SuccessCallback<any>,
        failure: FailureCallback
    ) => {
        const url = `/api/v${this.version}/notification/preferences`;

        this.axiosInstance!.put(url, {
            messagingToken: preferences.messagingToken,
            deliveries: this.sanitizeDeliveries(preferences.deliveries),
            topics: this.sanitizeTopics(preferences.topics),
        })
        .then(response => {
            const json = response.data;

            json.deliveries = this.sanitizeDeliveries(json.deliveries);
            json.topics = this.sanitizeTopics(json.topics);

            success(json);
        })
        .catch(failure);
    }

    private sanitizeDeliveries = (deliveries: Record<string, DeliveryType>): Record<string, DeliveryType> => {
        const sanitized = {};

        if (deliveries) {
            Object.keys(this.notificationTypes).forEach(type => {
                const delivery: DeliveryType = deliveries[type];

                if (stringUtils.isNotBlank(delivery)) {
                    sanitized[type] = delivery;
                }
            });
        }

        return sanitized;
    }

    private sanitizeTopics = (topics: Record<string, boolean>): Record<string, boolean> => {
        const sanitized = {};

        if (topics) {
            Object.keys(this.topicTypes).forEach(type => {
                const subscribed: boolean = topics[type];

                if (objectUtils.notNullOrUndefined(subscribed)) {
                    sanitized[type] = subscribed;
                }
            });
        }

        return sanitized;
    }
}

export const notificationService = new NotificationService();
