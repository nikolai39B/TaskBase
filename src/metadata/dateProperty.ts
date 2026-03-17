import { ComplexPropertyValue } from './metadataTypes';

// Branded date types
//export type DateOnly = Date & { readonly _brand: 'DateOnly' };
//export type DateTime = Date & { readonly _brand: 'DateTime' };

export class DatePropertyValue implements ComplexPropertyValue<Date, string> {
    private readonly _date: Date;

    constructor(value: Date | string) {
        this._date = typeof value === 'string' ? new Date(value) : value;
    }

    serialize: () => this._date.toISOString().split('T')[0] ?? '', // "2024-03-15"
    deserialize: () => this._date;
};

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