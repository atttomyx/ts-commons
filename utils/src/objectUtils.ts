class ObjectUtils {

    public nullOrUndefined = (obj: any): boolean => obj === null || obj === undefined;

    public notNullOrUndefined = (obj: any): boolean => obj !== null && obj !== undefined;

    public defaultIfNullOrUndefined = (val: any, def: any): any => {
        return this.notNullOrUndefined(val) ? val : def;
    }

    public deepCopy = (obj: any) => {
        return JSON.parse(JSON.stringify(obj));
    }
}

export const objectUtils = new ObjectUtils();
