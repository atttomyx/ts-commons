export interface StorageFacade {
    clear: (key: string) => void;
    getStr: (key: string) => string | null;
    setStr: (key: string, str: string | null) => void;
    getObj: <T>(key: string) => T | null;
    setObj: (key: string, obj: any | null) => void;
}

class StorageUtils {

    private static NAMESPACE: string | null = null;

    public static setNamespace = (namespace: string | null): void => {
        StorageUtils.NAMESPACE = namespace;
    }

    public static getSession = (): StorageFacade => {
        const storage: Storage = window.sessionStorage;
        return StorageUtils.getFacade(storage);
    }

    public static getLocal = (): StorageFacade => {
        const storage: Storage = window.localStorage;
        return StorageUtils.getFacade(storage);
    }

    private static getFacade = (storage: Storage): StorageFacade => {
        const facade: StorageFacade = {
            clear: (key) => {
                StorageUtils.clear(storage, key);
            },
            getStr: (key) => {
                return StorageUtils.getStr(storage, key);
            },
            setStr: (key, str) => {
                StorageUtils.setStr(storage, key, str);
            },
            getObj: <T>(key: string): T | null => {
                return StorageUtils.getObj(storage, key) as T | null;
            },
            setObj: (key, obj) => {
                StorageUtils.setObj(storage, key, obj);
            },
        };

        return facade;
    }

    private static sanitizeKey = (key: string): string => {
        return StorageUtils.NAMESPACE ? `${StorageUtils.NAMESPACE}_${key}` : key;
    }

    private static clear = (storage: Storage, key: string): void => {
        const sanitized: string = StorageUtils.sanitizeKey(key);

        if (storage.getItem(sanitized) !== null) {
            storage.removeItem(sanitized);
        }
    }

    private static getStr = (storage: Storage, key: string): string | null => {
        const sanitized: string = StorageUtils.sanitizeKey(key);
        return storage.getItem(sanitized);
    }

    private static setStr = (storage: Storage, key: string, str: string | null): void => {
        const sanitized: string = StorageUtils.sanitizeKey(key);

        if (str) {
            storage.setItem(sanitized, str);
        } else {
            StorageUtils.clear(storage, key);
        }
    }

    private static getObj = (storage: Storage, key: string): any | null => {
        const sanitized: string = StorageUtils.sanitizeKey(key);
        const json: string | null = storage.getItem(sanitized);

        return json ? JSON.parse(json) : null;
    }

    private static setObj = (storage: Storage, key: string, obj: any | null): void => {
        const sanitized: string = StorageUtils.sanitizeKey(key);

        if (obj) {
            storage.setItem(sanitized, JSON.stringify(obj));
        } else {
            StorageUtils.clear(storage, key);
        }
    }
}

export const storageUtils = StorageUtils;
