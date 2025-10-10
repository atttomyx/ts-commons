class ArrayUtils {

    public contains = (array: any[], item: any): boolean => {
        return array && array.indexOf(item) > -1;
    }

    public addTo = (array: any[], item: any) => {
        array.push(item);

        return array;
    }

    public removeFrom = (array: any[], item: any) => {
        const index: number = array.indexOf(item);
        let ret: any[] = array;

        if (index > -1) {
            ret = array.splice(index, 1);
        }

        return ret;
    }

    public clear = (array: any[]): void => {
        array.length = 0;
    }

    public getIdToEntity = (array: any[]): {} => {
        const idToEntity = {};

        // @ts-ignore
        array.map(entity => idToEntity[entity.id] = entity);

        return idToEntity;
    }

    public getIdToField = (array: any[], field: string): {} => {
        const idToField = {};

        // @ts-ignore
        array.map(entity => idToField[entity.id] = entity[field]);

        return idToField;
    }

    public syncSavedEntities = (array1: any[], array2: any[], sorter: any | null): any[] => {
        let synced: any[] = array1;

        array2.forEach((entity) => {
            synced = this.syncSavedEntity(synced, entity, null);
        });

        if (sorter) {
            synced.sort(sorter);
        }

        return synced;
    }

    public syncSavedEntity = (array: any[], entity: any, sorter: any | null): any[] => {
        return this.syncSavedEntityPreserveFields(array, entity, [], sorter);
    }

    public syncSavedEntityPreserveFields = (array: any[], entity: any, fields: string[], sorter: any | null): any[] => {
        let entities: any[] = [];

        if (array) {
            let found = false;

            array.forEach((existing) => {
                if (existing.id === entity.id) {
                    fields.forEach((field) => {
                        if (existing[field] && !entity[field]) {
                            entity[field] = existing[field];
                        }
                    });

                    this.addTo(entities, entity);
                    found = true;

                } else {
                    this.addTo(entities, existing);
                }
            });

            if (!found) {
                this.addTo(entities, entity);
            }

            if (sorter) {
                entities.sort(sorter);
            }
        }

        return entities;
    }

    public syncDeletedEntity = (array: any[], entityId: string): any[] => {
        let entities: any[] = [];

        if (array) {
            array.forEach((existing) => {
                if (existing.id !== entityId) {
                    this.addTo(entities, existing);
                }
            });
        }

        return entities;
    }
}

export const arrayUtils = new ArrayUtils();
