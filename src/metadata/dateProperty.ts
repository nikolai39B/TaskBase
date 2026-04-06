import { ComplexPropertyValue } from './metadataTypes';

// Branded date types
//export type DateOnly = Date & { readonly _brand: 'DateOnly' };
//export type DateTime = Date & { readonly _brand: 'DateTime' };

export class DatePropertyValue implements ComplexPropertyValue<Date, string> {
    private readonly _date: Date;

    constructor(value: Date | string) {
        this._date = typeof value === 'string' ? new Date(value) : value;
    }

    serialize(): string {
        return this._date.toISOString().split('T')[0] ?? ''; // "2024-03-15"
    }

    deserialize(): Date {
        return this._date;
    }
}

export class DateTimePropertyValue implements ComplexPropertyValue<Date, string> {
    private readonly _date: Date;

    constructor(value: Date | string) {
        this._date = typeof value === 'string' ? new Date(value) : value;
    }

    serialize(): string {
        return this._date.toISOString(); // "2024-03-15T10:30:00.000Z"
    }

    deserialize(): Date | undefined {
        if (isNaN(this._date.getTime())) {
            return undefined;
        }
        return this._date;
    }
}