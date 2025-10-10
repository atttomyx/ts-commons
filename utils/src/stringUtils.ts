class StringUtils {

    public sanitizeStr = (value: any): string => {
        let sanitized: string;

        if (typeof value === "string") {
            sanitized = value;

        } else if (value === null || value === undefined) {
            sanitized = "";

        } else {
            sanitized = "" + value;
        }

        return sanitized;
    }

    public isNotBlank = (value: any): boolean => {
        return this.sanitizeStr(value) !== "";
    }

    public isBlank = (value: any): boolean => {
        return this.sanitizeStr(value) === "";
    }

    public differ = (original: any, current: any): boolean => {
        const o = this.sanitizeStr(original);
        const c = this.sanitizeStr(current);

        return o !== c;
    }

    public contains = (str: any, phrase: any) => {
        return typeof str === 'string' && str.indexOf(phrase) > -1;
    }

    public containsIgnoreCase = (str: any, phrase: any) => {
        let ret = false;

        if (this.isNotBlank(str) && this.isNotBlank(phrase)) {
            const lowerStr = str.toLowerCase();
            const lowerPhrase = phrase.toLowerCase();

            ret = this.contains(lowerStr, lowerPhrase);
        }

        return ret;
    }
}

export const stringUtils = new StringUtils();
