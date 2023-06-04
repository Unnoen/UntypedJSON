import {
    metadataKey,
} from './features';
import {
    type Constructor,
    type DeserializeType,
    type IJsonClassMetadata,
    type IJsonPropertyMetadata,
    PropertyNullability,
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
export const JsonProperty = (jsonProperty: string, type: DeserializeType, nullabilityMode: PropertyNullability = PropertyNullability.MAP) => {
    return function (target: any, propertyKey: string) {
        const isArray = Array.isArray(type);
        const isClass = typeof type === 'function';

        const metadata: IJsonPropertyMetadata = {
            array: isArray,
            classType: isClass ? type : undefined,
            jsonProperty,
            nested: isClass,
            nullabilityMode,
            type,
        };

        const targetConstructor = target.constructor;
        const classMetadata: IJsonClassMetadata = targetConstructor.hasOwnProperty(metadataKey) ? targetConstructor[metadataKey] : Object.create({
            mixins: [],
            properties: Object.create(null),
        });
        const propertiesMetadata = classMetadata?.hasOwnProperty('properties') ? classMetadata.properties : Object.create(null);

        propertiesMetadata[propertyKey] = metadata;

        targetConstructor[metadataKey] = {
            mixins: [],
            properties: propertiesMetadata,
        } as IJsonClassMetadata;
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
        const classMetadata: IJsonClassMetadata = target.hasOwnProperty(metadataKey) ? target[metadataKey] : Object.create({
            mixins: [],
            properties: Object.create(null),
        });

        classMetadata.mixins = classes;

        target[metadataKey] = classMetadata;
    };
};
