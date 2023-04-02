import {
    type IJsonPropertyMetadata,
    JsonType,
    PropertyNullability,
} from './types';

export const metadataKey = Symbol('UntypedJSONMetadata');

/**
 * Verifies that the JSON object has all the required properties.
 *
 * @param {string} propertyKey The property key.
 * @param {IJsonPropertyMetadata} properties The property metadata.
 * @param {object} json The JSON object.
 */
const verifyNullability = (propertyKey: string, properties: IJsonPropertyMetadata, json: object): void => {
    const {
        nullabilityMode,
        jsonProperty,
    } = properties;

    if (nullabilityMode === PropertyNullability.IGNORE && (json[jsonProperty] === null || json[jsonProperty] === undefined)) {
        return;
    }

    if (nullabilityMode === PropertyNullability.PASS && (json[jsonProperty] === null || json[jsonProperty] === undefined)) {
        return;
    }

    if (nullabilityMode === PropertyNullability.MAP && json[jsonProperty] === null) {
        throw new TypeError(`Property ${propertyKey} is not a ${properties.type}. It is a null.`);
    }

    if (!json.hasOwnProperty(jsonProperty)) {
        throw new ReferenceError(`Property ${propertyKey} is not defined in the JSON.`);
    }
};

/**
 * Verifies that the type of the property is correct.
 *
 * @param {string} propertyKey The property key.
 * @param {IJsonPropertyMetadata} properties The property metadata.
 * @param {object} json The JSON object.
 * @returns {void}
 * @throws {TypeError} If the type is incorrect or the property is an array of multiple types.
 */
const verifyType = (propertyKey: string, properties: IJsonPropertyMetadata, json: object): void => {
    const {
        jsonProperty,
        nullabilityMode,
        type,
    } = properties;

    if (Array.isArray(type)) {
        if (!Array.isArray(json[jsonProperty])) {
            throw new TypeError(`Property ${propertyKey} is not an array. It is a ${typeof json[jsonProperty]}.`);
        }

        if (type.length !== 1) {
            throw new TypeError(`Property ${propertyKey} is an array of multiple types. This is not supported.`);
        }

        const arrayType = type[0];
        if (arrayType === JsonType.ANY) {
            return;
        }

        for (const item of json[jsonProperty]) {
            if (typeof item !== arrayType && typeof arrayType !== 'function') {
                throw new TypeError(`Property ${propertyKey} is not an array of ${arrayType}. It is an array of ${typeof item}.`);
            } else if (typeof arrayType === 'function' && typeof item !== 'object') {
                throw new TypeError(`Property ${propertyKey} is not an array of ${arrayType}. It is an array of ${typeof item}.`);
            }
        }

        return;
    }

    if (typeof type === 'function' && Object.getPrototypeOf(type.prototype).constructor.name === 'JsonConverter') {
        if (typeof type.prototype.Deserialize !== 'function') {
            throw new TypeError(`Property ${propertyKey} is a JsonConverter without a Deserialize method.`);
        }

        if (typeof type.prototype.Serialize !== 'function') {
            throw new TypeError(`Property ${propertyKey} is a JsonConverter without a Serialize method.`);
        }

        return;
    }

    if (typeof type === 'function' && typeof json[jsonProperty] !== 'object') {
        throw new TypeError(`Property ${propertyKey} is not an object. It is a ${typeof json[jsonProperty]}.`);
    } else if (typeof type === 'function' && typeof json[jsonProperty] === 'object') {
        return;
    }

    if (typeof json[jsonProperty] === 'undefined' && nullabilityMode === (PropertyNullability.IGNORE || PropertyNullability.PASS)) {
        return;
    }

    if (type !== typeof json[jsonProperty] && type !== JsonType.ANY) {
        throw new TypeError(`Property ${propertyKey} is not a ${type}. It is a ${typeof json[jsonProperty]}.`);
    }
};

/**
 * Maps a property from one object to another. This is used for serialization and deserialization.
 *
 * @param {string} propertyKey The property key.
 * @param {IJsonPropertyMetadata} properties The property metadata.
 * @param {any} fromObject The object to map from.
 * @param {any} toObject The object to map to.
 * @param {boolean} serialize Whether to serialize or deserialize.
 * @returns {void}
 */
const mapObjectProperty = (propertyKey: string, properties: IJsonPropertyMetadata, fromObject: any, toObject: any, serialize = false): void => {
    const {
        jsonProperty,
        array,
        nested,
        classType,
        type,
        nullabilityMode,
    } = properties;

    const fromKey = serialize ? propertyKey : jsonProperty;
    const toKey = serialize ? jsonProperty : propertyKey;

    if (typeof type === 'function' && typeof type.prototype.Deserialize === 'function') {
        toObject[toKey] = type.prototype.Deserialize(fromObject[fromKey]);
        return;
    } else if (typeof type === 'function' && typeof type.prototype.Serialize === 'function') {
        fromObject[toKey] = type.prototype.Serialize(fromObject[fromKey]);
        return;
    }

    if (nested) {
        toObject[toKey] = serialize ? SerializeObject(fromObject[fromKey]) : DeserializeObject(fromObject[fromKey], classType);
    } else if (array) {
        if (classType === undefined) {
            toObject[toKey] = fromObject[fromKey];
            return;
        }

        toObject[toKey] = fromObject[fromKey].map((item: any) => {
            return serialize ? SerializeObject(item) : DeserializeObject(item, classType);
        });
    } else {
        if (nullabilityMode === PropertyNullability.IGNORE && (fromObject[fromKey] === null || fromObject[fromKey] === undefined)) {
            return;
        }

        toObject[toKey] = fromObject[fromKey];
    }
};

/**
 * Deserializes a JSON object into an instance of a class.
 *
 * @template T
 * @param {object | string} json The JSON object to deserialize. Can be a string or an object.
 * @param {T} classReference The class reference to deserialize the JSON object into.
 * @returns {T} The deserialized instance of the class.
 */
export const DeserializeObject = <T>(json: object | string, classReference: new() => T): T => {
    const jsonObject: object = typeof json === 'string' ? JSON.parse(json) : json;

    if (typeof jsonObject !== 'object') {
        throw new TypeError('json is not an object or string.');
    }

    const instance = new classReference();

    let classConstructor = classReference;

    while (classConstructor !== null && classConstructor?.prototype !== Object.prototype) {
        const propertiesMetadata = classConstructor.hasOwnProperty(metadataKey) ?
            classConstructor[metadataKey] :
            Object.create(null);

        const propertyKeys = Object.keys(propertiesMetadata);

        for (const propertyKey of propertyKeys) {
            verifyNullability(propertyKey, propertiesMetadata[propertyKey], jsonObject);
            verifyType(propertyKey, propertiesMetadata[propertyKey], jsonObject);
            mapObjectProperty(propertyKey, propertiesMetadata[propertyKey], jsonObject, instance);
        }

        classConstructor = Object.getPrototypeOf(classConstructor);
    }

    return instance;
};

/**
 * Serializes an instance of a class into a JSON object.
 *
 * @template T
 * @param {T} instance The instance of the class to serialize.
 * @returns {object} The serialized JSON object.
 */
export const SerializeObject = <T>(instance: T): object => {
    const json: any = {};

    let classConstructor = instance.constructor;

    while (classConstructor !== null && classConstructor?.prototype !== Object.prototype) {
        const propertiesMetadata = classConstructor.hasOwnProperty(metadataKey) ?
            classConstructor[metadataKey] :
            Object.create(null);

        const propertyKeys = Object.keys(propertiesMetadata);

        for (const propertyKey of propertyKeys) {
            mapObjectProperty(propertyKey, propertiesMetadata[propertyKey], instance, json, true);
        }

        classConstructor = Object.getPrototypeOf(classConstructor);
    }

    return json;
};
