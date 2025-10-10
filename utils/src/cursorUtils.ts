import {stringUtils} from "./stringUtils";

class CursorUtils {

    public loadAll = (loader: any, key: string, limit: number, success: any, failure: any): void => {
        this.loadSome(loader, key, limit, null, [], success, failure);
    }

    private loadSome = (loader: any, key: string, limit: number, cursor: any, items: any, success: any, failure: any): void => {
        loader(cursor, limit, (response: any) => {
            const list = response ? response[key] || [] : [];
            const all = items.concat(list);

            if (list.length === limit) {
                const nextCursor = response.cursor;

                if (stringUtils.isNotBlank(nextCursor) && stringUtils.differ(cursor, nextCursor)) {
                    this.loadSome(loader, key, limit, nextCursor, all, success, failure);

                } else {
                    success(all);
                }
            } else {
                success(all);
            }
        }, (err: any) => {
            failure(err);
        });
    }
}

export const cursorUtils = new CursorUtils();
