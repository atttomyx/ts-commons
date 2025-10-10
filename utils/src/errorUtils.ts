class ErrorUtils {

    public sanitizeMessage = (msg: any): string => {
        let sanitized: string = "error";

        if (typeof msg === "string") {
            sanitized = msg;

        } else if (msg) {
            if (msg.message) {
                sanitized = this.sanitizeMessage(msg.message);

            } else {
                sanitized = JSON.stringify(msg);
            }
        }

        return sanitized;
    }

    public getStatusCode = (err: any): number => {
        let status: number = 0;

        if (err) {
            status = err.status || (err.response ? err.response.status : 0);
        }

        return status;
    }

    public isStatusCode = (err: any, code: any): boolean => this.getStatusCode(err) === code;

    public log = (err: any): void => console.log(this.sanitizeMessage(err));
}

export const errorUtils = new ErrorUtils();
