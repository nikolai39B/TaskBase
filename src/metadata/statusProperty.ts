import { ComplexPropertyValue } from './metadataTypes';

export class Status {
    constructor
}

export StatusPropertyValue: ComplexPropertyValue<string, string> = {
    name: string;
    display: string;
    isResolved?: boolean;
}

export const DateTimePropertyValue: ComplexPropertyValue<Date, string> = {
    serialize:    (date) => date.toISOString(), // "2024-03-15T10:30:00.000Z"
    deserialize:  (raw) => {
        const date = new Date(raw);
        if (isNaN(date.getTime())) {
            return undefined;
        }
        return date;// as DateTime;
    },
};