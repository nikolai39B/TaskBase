//-- PRIMITIVES
export type PrimitivePropertyValue =
    | boolean
    | string
    | string[]
    | number
    | null;

export interface ComplexPropertyValue<TValue, TSerialized extends PrimitivePropertyValue> {
    serialize:   () => TSerialized;
    deserialize: () => TValue | undefined;
}

export type PropertyValue =
    | PrimitivePropertyValue
    | ComplexPropertyValue<unknown, PrimitivePropertyValue>;



// Property value type
//export type PropertyValue = boolean | DateOnly | DateTime | string | string[] | number;

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
