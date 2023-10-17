import {
    type DeserializeOptions,
    type IJsonClassMetadata,
    type IJsonPropertyMetadata,
    JsonType,
    PropertyNullability,
    type SerializeOptions,
} from './types';

export const metadataKey = Symbol('UntypedJSONMetadata');

/**
 * Verifies that the JSON object has all the required properties.
 * @param {string} propertyKey The property key.
 * @param {IJsonPropertyMetadata} properties The property metadata.
 * @param {object} json The JSON object.
 * @returns {void}
 * @throws {ReferenceError} If the property is not defined in the JSON.
 * @throws {TypeError} If the property is null and nullability mode is MAP.
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
        throw new TypeError(`Property ${jsonProperty} is not a ${properties.type}. It is null.`);
    }

    if (!json.hasOwnProperty(jsonProperty)) {
        throw new ReferenceError(`Property ${jsonProperty} is not defined in the JSON.\r\n${JSON.stringify(json, null, 4)}`);
    }
};

/**
 * Verifies that the type of the property is correct.
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

    if ((typeof json[jsonProperty] === 'undefined' || json[jsonProperty] === null) && nullabilityMode === (PropertyNullability.IGNORE || PropertyNullability.PASS)) {
        return;
    }

    if (Array.isArray(type)) {
        if (!Array.isArray(json[jsonProperty])) {
            throw new TypeError(`Property ${jsonProperty} is not an array. It is a ${typeof json[jsonProperty]}.`);
        }

        if (type.length !== 1) {
            throw new TypeError(`Property ${jsonProperty} is an array of multiple types. This is not supported.`);
        }

        const arrayType = type[0];
        if (arrayType === JsonType.ANY) {
            return;
        }

        for (const item of json[jsonProperty]) {
            if (typeof item !== arrayType && typeof arrayType !== 'function' || typeof arrayType === 'function' && typeof item !== 'object') {
                throw new TypeError(`Property ${jsonProperty} is not an array of ${arrayType}. It is an array of ${typeof item}.`);
            }
        }

        return;
    }

    if (typeof type === 'function' && Object.getPrototypeOf(type.prototype).constructor.name === 'JsonConverter') {
        if (typeof type.prototype.Deserialize !== 'function' || typeof type.prototype.Serialize !== 'function') {
            throw new TypeError(`Property ${propertyKey} is a JsonConverter without a Serialize and/or Deserialize method.`);
        }

        return;
    }

    if (typeof type === 'function' && typeof json[jsonProperty] !== 'object') {
        throw new TypeError(`Property ${jsonProperty} is not an object. It is a ${typeof json[jsonProperty]}.`);
    } else if (typeof type === 'function' && typeof json[jsonProperty] === 'object') {
        return;
    }

    if (type !== typeof json[jsonProperty] && type !== JsonType.ANY) {
        throw new TypeError(`Property ${jsonProperty} is not a ${type}. It is a ${typeof json[jsonProperty]}.`);
    }
};

/**
 * Maps a property from one object to another. This is used for serialization and deserialization.
 * @param {string} propertyKey The property key.
 * @param {IJsonPropertyMetadata} properties The property metadata.
 * @param {any} fromObject The object to map from.
 * @param {any} toObject The object to map to.
 * @param {boolean} serialize Whether to serialize or deserialize.
 * @param {DeserializeOptions | SerializeOptions} options The options for deserialization or serialization.
 * @returns {void}
 */
const mapObjectProperty = (propertyKey: string, properties: IJsonPropertyMetadata, fromObject: any, toObject: any, serialize: boolean = false, options?: DeserializeOptions | SerializeOptions): void => {
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
        if (array) {
            toObject[toKey] = fromObject[fromKey].map((item: any) => {
                return serialize ? SerializeObject(item, options) : DeserializeObject(item, classType, options);
            });
        } else {
            toObject[toKey] = serialize ? SerializeObject(fromObject[fromKey], options) : DeserializeObject(fromObject[fromKey], classType, options);
        }
    } else if (array) {
        if (classType === undefined) {
            if (nullabilityMode === PropertyNullability.IGNORE && (fromObject[fromKey] === null || fromObject[fromKey] === undefined)) {
                return;
            }

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
 * @template T
 * @param {object | string} json The JSON object to deserialize. Can be a string or an object.
 * @param {T} classReference The class reference to deserialize the JSON object into.
 * @param {DeserializeOptions} options The options for deserialization.
 * @returns {T} The deserialized instance of the class.
 * @throws {TypeError} If the JSON object is not an object or string.
 * @throws {ReferenceError} If the property is not defined in the JSON.
 */
export const DeserializeObject = <T>(json: object | string, classReference: new() => T, options?: DeserializeOptions): T => {
    const jsonObject: object = typeof json === 'string' ? JSON.parse(json) : json;

    if (typeof jsonObject !== 'object') {
        throw new TypeError('json is not an object or string.');
    }

    const instance = new classReference();

    let classConstructor = classReference;

    while (classConstructor !== null && classConstructor?.prototype !== Object.prototype) {
        const classMetadata: IJsonClassMetadata = classConstructor.hasOwnProperty(metadataKey) ?
            classConstructor[metadataKey] :
            Object.create({
                mixins: [],
                properties: Object.create(null),
            });

        for (const mixin of classMetadata.mixins) {
            const mixinObject = DeserializeObject(jsonObject, mixin, options);
            Object.assign(instance, mixinObject);

            const mixinKeys = Object.getOwnPropertyNames(mixin.prototype);
            for (const mixinKey of mixinKeys) {
                const descriptor = Object.getOwnPropertyDescriptor(mixin.prototype, mixinKey);
                if (descriptor !== undefined && mixinKey !== 'constructor') {
                    Object.defineProperty(instance, mixinKey, descriptor);
                }
            }
        }

        const propertyKeys = Object.keys(classMetadata?.properties);

        for (const propertyKey of propertyKeys) {
            verifyNullability(propertyKey, classMetadata.properties[propertyKey], jsonObject);
            verifyType(propertyKey, classMetadata.properties[propertyKey], jsonObject);
            mapObjectProperty(propertyKey, classMetadata.properties[propertyKey], jsonObject, instance, false, options);
        }

        if (options?.passUnknownProperties) {
            const unknownProperties = Object.keys(jsonObject).filter((key) => {
                return !propertyKeys.includes(key);
            });

            for (const unknownProperty of unknownProperties) {
                instance[unknownProperty] = jsonObject[unknownProperty];
            }
        }

        classConstructor = Object.getPrototypeOf(classConstructor);
    }

    return instance;
};

/**
 * Serializes an instance of a class into a JSON object.
 * @template T
 * @param {T} instance The instance of the class to serialize.
 * @param {SerializeOptions} options The options for serialization.
 * @returns {object} The serialized JSON object.
 */
export const SerializeObject = <T>(instance: T, options?: SerializeOptions): object => {
    const json: object = {};

    let classConstructor = instance.constructor;

    while (classConstructor !== null && classConstructor?.prototype !== Object.prototype) {
        const classMetadata: IJsonClassMetadata = classConstructor.hasOwnProperty(metadataKey) ?
            classConstructor[metadataKey] :
            Object.create({
                mixins: [],
                properties: Object.create(null),
            });

        const propertyKeys = Object.keys(classMetadata?.properties);

        for (const propertyKey of propertyKeys) {
            mapObjectProperty(propertyKey, classMetadata.properties[propertyKey], instance, json, true, options);
        }

        if (options?.passUnknownProperties && classConstructor === instance.constructor) {
            const unknownProperties = Object.keys(instance).filter((key) => {
                return !propertyKeys.includes(key);
            });

            for (const unknownProperty of unknownProperties) {
                json[unknownProperty] = instance[unknownProperty];
            }
        }

        classConstructor = Object.getPrototypeOf(classConstructor);
    }

    return json;
};
