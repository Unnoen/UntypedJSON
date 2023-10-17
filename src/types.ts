/* eslint-disable @typescript-eslint/no-shadow */
import {
    type JsonConverter,
} from './converters';

/**
 * Represents the options for deserializing an object.
 * @property {boolean} [passUnknownProperties=false] - Determines whether unknown properties should be passed or ignored during deserialization from JSON.
 */
export type DeserializeOptions = {
    passUnknownProperties?: boolean,
};

/**
 * Options for serializing objects.
 * @property {boolean} [passUnknownProperties=false] - Determines whether unknown properties should be passed or ignored during serialization to JSON.
 */
export type SerializeOptions = {
    passUnknownProperties?: boolean,
};

/**
 * The type the JSON property is deserialized to.
 * This can be a primitive type using JsonType, a class, an array of either, or a custom JsonConverter.
 */
export type DeserializeType = Array<JsonConverter<any>> | Array<new() => any> | JsonConverter<any> | JsonType | JsonType[] | (new() => any);

/**
 * The type of the constructor.
 */
export type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * The metadata for a JSON property.
 * @property {PropertyNullability} nullabilityMode - The nullability mode of the property.
 * @property {boolean} array - Whether the property is an array.
 * @property {Function} classType - The type of the property if it is a class.
 * @property {string} jsonProperty - The name of the property in the JSON.
 * @property {boolean} nested - Whether the property is a nested object.
 * @property {Array<new() => any> | JsonType | JsonType[] | (new() => any)} type - The type of the property.
 */
export type IJsonPropertyMetadata = {
    array: boolean,
    classType: new() => any,
    jsonProperty: string,
    nested: boolean,
    nullabilityMode: PropertyNullability,
    type?: DeserializeType,
};

/**
 * The metadata for a JSON class.
 * This is used to store the properties and mixins of a class.
 * @property {Array<new() => any>} mixins - The mixins of the class.
 * @property {Map<string, IJsonPropertyMetadata>} properties - The properties of the class.
 */
export type IJsonClassMetadata = {
    mixins: Array<new() => any>,
    properties: Map<string, IJsonPropertyMetadata>,
};

/**
 * The nullability mode of a property.
 * @enum {number}
 * @property {number} MAP - Attempt to map null values.
 * @property {number} IGNORE - Ignore null values.
 * @property {number} PASS - Pass null values.
 */
export enum PropertyNullability {
    MAP = 0,
    IGNORE = 1,
    PASS = 2
}

/**
 * The type of property that should be serialized. This is for JSON primitives.
 * @enum {string}
 * @property {string} STRING - A string.
 * @property {string} NUMBER - A number.
 * @property {string} BOOLEAN - A boolean.
 * @property {string} OBJECT - An object.
 * @property {string} ANY - Any type.
 */
export enum JsonType {
    ANY = 'any',
    BOOLEAN = 'boolean',
    NUMBER = 'number',
    OBJECT = 'object',
    STRING = 'string'
}

// We export these as constants if users want to import them directly.

// A JSON string.
export const STRING = JsonType.STRING;
// A JSON number.
export const NUMBER = JsonType.NUMBER;
// A JSON boolean.
export const BOOLEAN = JsonType.BOOLEAN;
// A JSON object.
export const OBJECT = JsonType.OBJECT;
// Any JSON type.
export const ANY = JsonType.ANY;
