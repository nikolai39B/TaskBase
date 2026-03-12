// Branded date types
export type DateOnly = Date & { readonly _brand: 'DateOnly' };
export type DateTime = Date & { readonly _brand: 'DateTime' };

// Helper functions to create branded dates
export function toDateOnly(date: Date): DateOnly {
    return date as DateOnly;
}

export function toDateTime(date: Date): DateTime {
    return date as DateTime;
}

// Property value type
export type PropertyValue = boolean | DateOnly | DateTime | string | string[] | number;

// Edit behavior enum
export enum EditBehavior {
    Manual = 'manual',                    // user enters value; plugin never auto populates
    AutoWithOverride = 'auto-with-override', // plugin auto populates; user can override
    AutoOnly = 'auto-only',               // plugin auto populates; user should not edit
}

export interface Property {
    name: string;
    display: string;
    editBehavior?: EditBehavior;          // defaults to EditBehavior.Manual
}

export interface PropertyValuePair {
    property: Property;
    value: PropertyValue;
}

export interface Status {
    name: string;
    display: string;
    isResolved?: boolean;
}

export interface ExternalID {
    name: string;
    isIdOfType: (id: string) => boolean;
    getLink: (id: string) => string;
}