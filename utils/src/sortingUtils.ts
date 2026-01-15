import {stringUtils} from "./stringUtils";

class SortingUtils {

    public sortByName = (a: any, b: any): number => {
        return this.sortByField(a, b, "name");
    };

    public sortByNameDesc = (a: any, b: any): number => {
        return this.sortByFieldDesc(a, b, "name");
    };

    public sortByTitle = (a: any, b: any): number => {
        return this.sortByField(a, b, "title");
    };

    public sortByTitleDesc = (a: any, b: any): number => {
        return this.sortByFieldDesc(a, b, "title");
    };

    public sortByCreated = (a: any, b: any): number => {
        return this.sortByField(a, b, "created");
    };

    public sortByCreatedDesc = (a: any, b: any): number => {
        return this.sortByFieldDesc(a, b, "created");
    };

    public sortByUpdated = (a: any, b: any): number => {
        return this.sortByField(a, b, "updated");
    };

    public sortByUpdatedDesc = (a: any, b: any): number => {
        return this.sortByFieldDesc(a, b, "updated");
    };

    public sortByOrder = (a: any, b: any): number => {
        return this.sortByField(a, b, "order");
    };

    public sortByOrderDesc = (a: any, b: any): number => {
        return this.sortByFieldDesc(a, b, "order");
    };

    public sortByLastNameAndFirstName = (a: any, b: any): number => {
        return this.sortByFields(a, b, "lastName", "firstName");
    };

    public sortByLastNameAndFirstNameDesc = (a: any, b: any): number => {
        return this.sortByFieldsDesc(a, b, "lastName", "firstName");
    };

    public alphabetize = (a: any, b: any): number => {
        return this.sortByField(a, b, null);
    };

    public alphabetizeDesc = (a: any, b: any): number => {
        return this.sortByFieldDesc(a, b, null);
    };

    public sortByField = (a: any, b: any, field: string | null): number => {
        const fieldA = this.sanitizeFieldVal(a, field);
        const fieldB = this.sanitizeFieldVal(b, field);

        return this.doSortByField(fieldA, fieldB);
    };

    public sortByFieldDesc = (a: any, b: any, field: string | null): number => {
        const fieldA = this.sanitizeFieldVal(a, field);
        const fieldB = this.sanitizeFieldVal(b, field);

        return this.doSortByFieldDesc(fieldA, fieldB);
    };

    public sortByFields = (a: any, b: any, field1: string, field2: string): number => {
        const fieldA1 = this.sanitizeFieldVal(a, field1);
        const fieldA2 = this.sanitizeFieldVal(a, field2);
        const fieldB1 = this.sanitizeFieldVal(b, field1);
        const fieldB2 = this.sanitizeFieldVal(b, field2);

        return this.doSortByFields(fieldA1, fieldA2, fieldB1, fieldB2);
    };

    public sortByFieldsDesc = (a: any, b: any, field1: string, field2: string): number => {
        const fieldA1 = this.sanitizeFieldVal(a, field1);
        const fieldA2 = this.sanitizeFieldVal(a, field2);
        const fieldB1 = this.sanitizeFieldVal(b, field1);
        const fieldB2 = this.sanitizeFieldVal(b, field2);

        return this.doSortByFieldsDesc(fieldA1, fieldA2, fieldB1, fieldB2);
    };

    public getSortByIndex = (mapOrArray: any[] | object): (a: any, b: any) => number => {
        return (a: any, b: any): number => {
            const master = Array.isArray(mapOrArray) ? mapOrArray : Object.keys(mapOrArray);
            const indexA = master.indexOf(a);
            const indexB = master.indexOf(b);

            return this.doSortByField(indexA, indexB);
        };
    };

    public getSortByIndexDesc = (mapOrArray: any[] | object): (a: any, b: any) => number => {
        return (a: any, b: any): number => {
            const master = Array.isArray(mapOrArray) ? mapOrArray : Object.keys(mapOrArray);
            const indexA = master.indexOf(a);
            const indexB = master.indexOf(b);

            return this.doSortByFieldDesc(indexA, indexB);
        };
    };

    public getSortByIndexByField = (mapOrArray: any[] | object, field: string | null): (a: any, b: any) => number => {
        return (a: any, b: any): number => {
            const master = Array.isArray(mapOrArray) ? mapOrArray : Object.keys(mapOrArray);
            const indexA = master.indexOf(field ? a[field] : a);
            const indexB = master.indexOf(field ? b[field] : b);

            return this.doSortByField(indexA, indexB);
        };
    };

    public getSortByIndexByFieldDesc = (mapOrArray: any[] | object, field: string | null): (a: any, b: any) => number => {
        return (a: any, b: any): number => {
            const master = Array.isArray(mapOrArray) ? mapOrArray : Object.keys(mapOrArray);
            const indexA = master.indexOf(field ? a[field] : a);
            const indexB = master.indexOf(field ? b[field] : b);

            return this.doSortByFieldDesc(indexA, indexB);
        };
    };

    public getCompositeSorter = (sorters: ((a: any, b: any) => number)[]): (a: any, b: any) => number => {
        return (a: any, b: any): number => {
            let sorted = 0;
            let index = 0;

            while (sorted === 0 && index < sorters.length) {
                const sorter = sorters[index++];
                sorted = sorter(a, b);
            }

            return sorted;
        };
    };

    private sanitizeVal = (value: any): string | number => {
        return typeof value === "number"
            ? value
            : stringUtils.sanitizeStr(value).toLowerCase();
    };

    private sanitizeFieldVal = (obj: any, field: string | null): string | number => {
        return obj && field
            ? this.sanitizeVal(obj[field])
            : this.sanitizeVal(obj);
    };

    private doSortByField = (fieldA: any, fieldB: any): number => {
        let ret = 0;

        if (fieldA > fieldB) {
            ret = 1;

        } else if (fieldA < fieldB) {
            ret = -1;
        }

        return ret;
    };

    private doSortByFieldDesc = (fieldA: any, fieldB: any): number => {
        let ret = 0;

        if (fieldA > fieldB) {
            ret = -1;

        } else if (fieldA < fieldB) {
            ret = 1;
        }

        return ret;
    };

    private doSortByFields = (fieldA1: any, fieldA2: any, fieldB1: any, fieldB2: any): number => {
        let ret = 0;

        if (fieldA1 > fieldB1) {
            ret = 1;

        } else if (fieldA1 < fieldB1) {
            ret = -1;

        } else if (fieldA2 > fieldB2) {
            ret = 1;

        } else if (fieldA2 < fieldB2) {
            ret = -1;
        }

        return ret;
    };

    private doSortByFieldsDesc = (fieldA1: any, fieldA2: any, fieldB1: any, fieldB2: any): number => {
        let ret = 0;

        if (fieldA1 > fieldB1) {
            ret = -1;

        } else if (fieldA1 < fieldB1) {
            ret = 1;

        } else if (fieldA2 > fieldB2) {
            ret = -1;

        } else if (fieldA2 < fieldB2) {
            ret = 1;
        }

        return ret;
    };
}

export const sortingUtils = new SortingUtils();
