import {type AxiosError, type AxiosInstance} from "axios";
import {ImageType} from "./types";
import {authService} from "./authService";

type SuccessCallback<T> = (data: T) => void;
type FailureCallback = (error: AxiosError | Error | string) => void;

const IMAGE_TYPE_ACCOUNT = "account_image";
const IMAGE_TYPE_USER = "user_image";
const IMAGE_TYPE_CONTACT = "node_image";

class CloudinaryService {

    private axiosInstance: AxiosInstance | null;
    private imageTypes: Record<string, ImageType> = {};

    constructor() {
        this.axiosInstance = null;
    }

    public init = ({cloudinaryId, timeout, retries, imageTypes}: {
        cloudinaryId: string,
        timeout?: number,
        retries?: number,
        imageTypes?: ImageType[],
    }): void => {
        const baseUrl = `https://api.cloudinary.com/v1_1/${cloudinaryId}`;
        this.axiosInstance = authService.createConfiguredAxiosInstance(baseUrl, timeout, retries, false);

        this.imageTypes = {
            [IMAGE_TYPE_ACCOUNT]: {
                preset: IMAGE_TYPE_ACCOUNT,
                prefix: "account"
            },
            [IMAGE_TYPE_USER]: {
                preset: IMAGE_TYPE_USER,
                prefix: "user"
            },
            [IMAGE_TYPE_CONTACT]: {
                preset: IMAGE_TYPE_CONTACT,
                prefix: "contact"
            },
        };

        if (imageTypes) {
            imageTypes.forEach(type => {
                this.imageTypes[type.prefix] = type;
            })
        }
    }

    public uploadAccountImage = (accountId: string, image: Blob | File, success: SuccessCallback<string>, failure: FailureCallback) => {
        this.uploadImage(IMAGE_TYPE_ACCOUNT, accountId, image, success, failure);
    }

    public uploadUserImage = (userId: string, image: Blob | File, success: SuccessCallback<string>, failure: FailureCallback) => {
        this.uploadImage(IMAGE_TYPE_USER, userId, image, success, failure);
    }

    public uploadContactImage = (contactId: string, image: Blob | File, success: SuccessCallback<string>, failure: FailureCallback) => {
        this.uploadImage(IMAGE_TYPE_CONTACT, contactId, image, success, failure);
    }

    public uploadImage = (
        type: string,
        parentId: string,
        image: Blob | File,
        success: SuccessCallback<string>,
        failure: FailureCallback
    ) => {
        const imageType = this.imageTypes[type];

        if (!imageType) {
            failure("Unknown image type: " + type);

        } else if (!parentId) {
            failure("parentId is required");

        } else {
            const data = new FormData();
            data.append("upload_preset", imageType.preset);
            data.append("file", image, `${imageType.prefix}${Date.now()}.${this.getFileExtension(image)}`);
            data.append("tags", parentId);

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
    }

    private getFileExtension = (image: Blob | File): string => {
        const mimeType = image.type;
        const parts = mimeType.split('/');

        return parts.length > 1 ? parts[1] : 'jpeg';
    }
}

export const cloudinaryService = new CloudinaryService();
