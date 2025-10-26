import {isAndroid} from "react-device-detect";
import {type StorageFacade, storageUtils} from "./storageUtils";
import {stringUtils} from "./stringUtils";
import {objectUtils} from "./objectUtils";
import {keys, time} from "@milesoft/typescript-constants";

class MobileUtils {

    private appName?: string;
    private local: StorageFacade;

    private appStateObservers?: { [x: string]: (appState: string) => void; };
    private appVersionObservers?: { [x: string]: (appVersion: string) => void; };
    private idForVendorObservers?: { [x: string]: (idForVendor: string) => void; };
    private messagingTokenObservers?: { [x: string]: (messagingToken: string) => void; };
    private notificationObservers?: { [x: string]: (type: string, body: string, payload: any) => void; };
    private deepLinkObservers?: { [x: string]: (deepLink: string) => void; };

    constructor() {
        this.appName = undefined;
        this.local = storageUtils.getLocal();

        this.appStateObservers = undefined;
        this.appVersionObservers = undefined;
        this.idForVendorObservers = undefined;
        this.messagingTokenObservers = undefined;
        this.notificationObservers = undefined;
        this.deepLinkObservers = undefined;
    }

    public init = ({appName}: {
        appName: string,
    }): void => {
        this.appName = appName;

        this.appStateObservers = {};
        this.appVersionObservers = {};
        this.idForVendorObservers = {};
        this.messagingTokenObservers = {};
        this.notificationObservers = {};
        this.deepLinkObservers = {};

        if (isAndroid) {
            document.addEventListener("message", this.handleMessage);

        } else {
            window.addEventListener("message", this.handleMessage);
        }
    }

    public destroy = (): void => {
        this.appName = undefined;

        this.appStateObservers = undefined;
        this.appVersionObservers = undefined;
        this.idForVendorObservers = undefined;
        this.messagingTokenObservers = undefined;
        this.notificationObservers = undefined;
        this.deepLinkObservers = undefined;

        if (isAndroid) {
            document.removeEventListener("message", this.handleMessage);

        } else {
            window.removeEventListener("message", this.handleMessage);
        }
    }

    public addAppStateObserver = (key: string, observer: (appState: string) => void): void => {
        if (this.appStateObservers) {
            this.appStateObservers[key] = observer;
        }
    }

    public removeAppStateObserver = (key: string): void => {
        if (this.appStateObservers) {
            delete this.appStateObservers[key];
        }
    }

    public addAppVersionObserver = (key: string, observer: (appVersion: string) => void): void => {
        if (this.appVersionObservers) {
            this.appVersionObservers[key] = observer;
        }
    }

    public removeAppVersionObserver = (key: string): void => {
        if (this.appVersionObservers) {
            delete this.appVersionObservers[key];
        }
    }

    public addIdForVendorObserver = (key: string, observer: (idForVendor: string) => void): void => {
        if (this.idForVendorObservers) {
            this.idForVendorObservers[key] = observer;
        }
    }

    public removeIdForVendorObserver = (key: string): void => {
        if (this.idForVendorObservers) {
            delete this.idForVendorObservers[key];
        }
    }

    public addMessagingTokenObserver = (key: string, observer: (messagingToken: string) => void): void => {
        if (this.messagingTokenObservers) {
            this.messagingTokenObservers[key] = observer;
        }
    }

    public removeMessagingTokenObserver = (key: string): void => {
        if (this.messagingTokenObservers) {
            delete this.messagingTokenObservers[key];
        }
    }

    public addNotificationObserver = (key: string, observer: (type: string, body: string, payload: any) => void): void => {
        if (this.notificationObservers) {
            this.notificationObservers[key] = observer;
        }
    }

    public removeNotificationObserver = (key: string): void => {
        if (this.notificationObservers) {
            delete this.notificationObservers[key];
        }
    }

    public addDeepLinkObserver = (key: string, observer: (deepLink: string) => void): void => {
        if (this.deepLinkObservers) {
            this.deepLinkObservers[key] = observer;
        }
    }

    public removeDeepLinkObserver = (key: string): void => {
        if (this.deepLinkObservers) {
            delete this.deepLinkObservers[key];
        }
    }

    public sendMessage = (data: any): boolean => {
        let sent = false;

        if (window.ReactNativeWebView && data) {
            data.appName = this.appName;
            const message: string = JSON.stringify(data);

            window.ReactNativeWebView.postMessage(message);
            sent = true;

        } else if (data) {
            console.log(data);
        }

        return sent;
    };

    private handleMessage = (event: any) => {
        const data = event.data;

        if (stringUtils.contains(data, this.appName)) {
            const json = JSON.parse(data);

            if (json.appState && this.appStateObservers) {
                Object.keys(this.appStateObservers).forEach(key => this.appStateObservers![key](json.appState));

            } else if (json.appVersion && this.appVersionObservers) {
                const version: string = json.appVersion;

                Object.keys(this.appVersionObservers).forEach(key => this.appVersionObservers![key](version));

            } else if (json.idForVendor && this.idForVendorObservers) {
                const idForVendor: string = json.idForVendor;

                Object.keys(this.idForVendorObservers).forEach(key => this.idForVendorObservers![key](idForVendor));

            } else if (json.messagingToken && this.messagingTokenObservers) {
                const messagingToken: string = json.messagingToken;

                Object.keys(this.messagingTokenObservers).forEach(key => this.messagingTokenObservers![key](messagingToken));

            } else if (json.notification && this.notificationObservers) {
                const type: string = json.notification.type;
                const body: string = json.notification.body;
                const payload: any = json.notification.payload || {};

                if (type) {
                    Object.keys(this.notificationObservers).forEach(key => this.notificationObservers![key](type, body, payload));
                }

            } else if (json.deepLink && this.deepLinkObservers) {
                const deepLink: string = json.deepLink;

                Object.keys(this.deepLinkObservers).forEach(key => this.deepLinkObservers![key](deepLink));
            }
        }
    }

    public isMobile = (): boolean => {
        return objectUtils.notNullOrUndefined(window.ReactNativeWebView);
    }

    public isLocalhost = (): boolean => {
        return window.location.hostname === "localhost";
    }

    public syncProgress = (percent: number, loading: boolean): void => {
        this.sendMessage({
            progress: {
                percent: percent,
                loading: loading,
            }
        });
    }

    public syncLifecycle = (loaded: boolean, loggedIn: boolean): void => {
        this.sendMessage({
            lifecycle: {
                loaded: loaded || loggedIn,
                loggedIn: loggedIn,
            },
        });
    }

    public popReview = (override: boolean): void => {
        const timestamp: number = Date.now();

        if (override || this.mayRequestReview(timestamp)) {
            this.setRequestedReviewAt(timestamp);

            this.sendMessage({
                review: true,
            });
        }
    }

    private mayRequestReview = (timestamp: number): boolean => {
        const previous: number = Number(this.local.getStr(keys.requestedReviewAt));
        let allowed: boolean = true;

        if (previous) {
            const elapsed = timestamp - previous;
            const seconds = elapsed / time.millisecondsInSecond;
            const minutes = seconds / time.secondsInMinute;
            const hours = minutes / time.minutesInHour;
            const days = hours / time.hoursInDay;

            console.log(`requested review ${days} days ago`);

            allowed = days >= time.daysInWeek;
        }

        return allowed;
    }

    private setRequestedReviewAt = (timestamp: number): void => {
        this.local.setStr(keys.requestedReviewAt, timestamp.toString());
    }

    public popShare = (title: string, message: string, url: string): void => {
        this.sendMessage({
            share: {
                title: title,
                message: message,
                url: url,
            },
        });
    }

    public parseDeepLinkRelativeUrl = (pathDeepLink: string, url: string): string | null => {
        const index: number = url ? url.indexOf(pathDeepLink) : -1;

        return index > -1 ? url.substring(index + pathDeepLink.length) : null;
    }

    public isDeepLink = (pathDeepLink: string, relativeUrl: string): boolean => {
        const index: number = relativeUrl ? relativeUrl.indexOf(pathDeepLink) : -1;

        return index > -1;
    }

    public openInBrowser = (url: string): void => {
        this.sendMessage({
            url: url,
        });
    }
}

export const mobileUtils = new MobileUtils();
