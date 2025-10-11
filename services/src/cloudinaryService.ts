import axios, {type AxiosError, type AxiosInstance, type AxiosRequestConfig,} from "axios";
import axiosRetry from "axios-retry";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error) => void;

class CloudinaryService {

    private axiosInstance: AxiosInstance | null;

    constructor() {
        this.axiosInstance = null;
    }

    public init = ({cloudinaryId, timeout = 60 * 1000, retries = 3}: {
        cloudinaryId: string,
        timeout?: number,
        retries?: number,
    }): void => {
        const instance = axios.create({
            baseURL: `https://api.cloudinary.com/v1_1/${cloudinaryId}`,
            timeout: timeout,
        } as AxiosRequestConfig);

        axiosRetry(instance, {
            retries: retries,
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: axiosRetry.isSafeRequestError,
        });

        this.axiosInstance = instance;
    }

    public uploadAccountImage = (accountId: string, image: Blob | File, success: SuccessCallback<string>, failure: FailureCallback) => {
        const data = new FormData();
        data.append("upload_preset", "account_image");
        data.append("file", image, "account." + this.getFileExtension(image));
        data.append("tags", accountId);

        this.axiosInstance!.post("/upload", data, {
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        })
        .then(response => {
            success(response.data.secure_url);
        })
        .catch(failure);
    }

    public uploadUserImage = (userId: string, image: Blob | File, success: SuccessCallback<string>, failure: FailureCallback) => {
        const data = new FormData();
        data.append("upload_preset", "user_image");
        data.append("file", image, "user." + this.getFileExtension(image));
        data.append("tags", userId);

        this.axiosInstance!.post("/upload", data, {
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        })
        .then(response => {
            success(response.data.secure_url);
        })
        .catch(failure);
    }

    private getFileExtension = (image: Blob | File): string => {
        const mimeType = image.type;
        const parts = mimeType.split('/');

        return parts.length > 1 ? parts[1] : 'jpeg';
    }
}

export const cloudinaryService = new CloudinaryService();
