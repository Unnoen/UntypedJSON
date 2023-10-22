import {
    GetOrCreateClassMetaData,
    MetadataKey,
} from './helpers';
import {
    type Constructor,
    type DeserializeType,
    type IJsonClassMetadata,
    type IJsonClassOptions,
    type IJsonPropertyMetadata,
    type PropertyNullability,
} from './types';

/**
 * Decorator for properties that should be serialized and deserialized.
 * @param {string} jsonProperty The name of the property in the JSON.
 * @param {DeserializeType} type The type of the property. Can be a primitive type, a class, an array of either, or a JsonConverter
 * @param {PropertyNullability} nullabilityMode The nullability mode of the property.
 * @example
 * class TestClass {
 *    \@JsonProperty('test', JsonType.STRING)
 *    public test: string;
 *
 *    \@JsonProperty('testArray', [JsonType.STRING])
 *    public testArray: string[] = [];
 * }
 */
export const JsonProperty = (jsonProperty: string, type?: DeserializeType, nullabilityMode?: PropertyNullability) => {
    return function (target: any, propertyKey: string) {
        const isArray = Array.isArray(type);
        const isClass = isArray ? typeof type[0] === 'function' : typeof type === 'function';
        const classType = (isClass ? (isArray ? type[0] : type) : undefined) as new() => any;

        const metadata: IJsonPropertyMetadata = {
            array: isArray,
            classType,
            jsonProperty,
            nested: isClass,
            nullabilityMode,
            type,
        };

        const targetConstructor = target.constructor;
        const classMetadata: IJsonClassMetadata = GetOrCreateClassMetaData(targetConstructor);
        classMetadata.properties[propertyKey] = metadata;
        targetConstructor[MetadataKey] = classMetadata;
    };
};

/**
 * Decorator for classes that should inherit (mix in) other classes.
 * @template T
 * @param {T} classes The classes to mix in.
 * @example
 * class Walkable {...}
 * class Flyable {...}
 *
 * \@JsonMixin(Walkable, Flyable)
 * class Bird {
 *    \@JsonProperty('name', JsonType.STRING)
 *    public name: string;
 * }
 */
export const JsonMixin = <T extends Constructor[]> (...classes: T) => {
    return function <C extends Constructor>(target: C): void {
        const classMetadata: IJsonClassMetadata = GetOrCreateClassMetaData(target);

        classMetadata.mixins = classes;

        target[MetadataKey] = classMetadata;
    };
};

export const JsonOptions = (options: IJsonClassOptions) => {
    return function <C extends Constructor>(target: C): void {
        const classMetadata: IJsonClassMetadata = GetOrCreateClassMetaData(target);

        classMetadata.options = options;

        target[MetadataKey] = classMetadata;
    };
};
