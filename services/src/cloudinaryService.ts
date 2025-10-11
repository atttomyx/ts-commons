import {type AxiosError, type AxiosInstance,} from "axios";
import {authService} from "./authService";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error) => void;

class CloudinaryService {

    private axiosInstance: AxiosInstance | null;

    constructor() {
        this.axiosInstance = null;
    }

    public init = ({cloudinaryId, timeout, retries}: {
        cloudinaryId: string,
        timeout?: number,
        retries?: number,
    }): void => {
        const baseUrl = `https://api.cloudinary.com/v1_1/${cloudinaryId}`;
        this.axiosInstance = authService.createConfiguredAxiosInstance(baseUrl, timeout, retries, false);
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
