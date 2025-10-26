import {objectUtils, stringUtils} from "@milesoft/typescript-utils";
import {type AxiosError, type AxiosInstance} from "axios";
import type {DeliveryType, NotificationList, NotificationType, Preferences, TopicType} from "./types";
import {authService} from "./authService";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error) => void;

class NotificationService {

    private version: number;
    private axiosInstance: AxiosInstance | null;
    private notificationTypes?: Record<string, NotificationType>;
    private topicTypes?: Record<string, TopicType>;

    constructor() {
        this.version = 1;
        this.axiosInstance = null;
        this.notificationTypes = undefined;
        this.topicTypes = undefined;
    }

    public init = ({version, baseUrl, timeout, retries, notificationTypes, topicTypes}: {
        version: number,
        baseUrl: string,
        timeout?: number,
        retries?: number,
        notificationTypes?: Record<string, NotificationType>,
        topicTypes?: Record<string, TopicType>,
    }): void => {
        this.version = version;
        this.axiosInstance = authService.createConfiguredAxiosInstance(baseUrl, timeout, retries, true);
        this.notificationTypes = notificationTypes;
        this.topicTypes = topicTypes;
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
        const sanitized = {} as Record<string, DeliveryType>;

        if (deliveries && this.notificationTypes) {
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
        const sanitized = {} as Record<string, boolean>;

        if (topics && this.topicTypes) {
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
