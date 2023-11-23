import {
    type IJsonClassMetadata,
} from './types';

/**
 * A unique symbol representing the key for accessing metadata in an object.
 */
export const MetadataKey = Symbol('UntypedJSONMetadata');

/**
 * Retrieves or creates metadata for a class.
 * @param {Function} constructor - The class constructor.
 * @returns {IJsonClassMetadata} - The class metadata.
 */
export const GetOrCreateClassMetaData = (constructor: Function): IJsonClassMetadata => {
    return constructor.hasOwnProperty(MetadataKey) ? constructor[MetadataKey] : Object.create({
        mixins: [],
        options: {},
        properties: Object.create(null),
    });
};

/**
 * Check if a given type is a built-in type (String, Number, Boolean).
 * @param {any} type - The type to check.
 * @returns {boolean} - True if the given type is a built-in type, false otherwise.
 */
export const isBuiltInType = (type: any): boolean => {
    return type === String || type === Number || type === Boolean;
};
