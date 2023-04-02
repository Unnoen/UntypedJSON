import {
    metadataKey,
} from './features';
import {
    type DeserializeType,
    type IJsonPropertyMetadata,
    PropertyNullability,
} from './types';

/**
 * Decorator for properties that should be serialized and deserialized.
 *
 * @param {string} jsonProperty The name of the property in the JSON.
 * @param {DeserializeType} type The type of the property. Can be a primitive type, a class, an array of either, or a JsonConverter
 * @param {PropertyNullability} nullabilityMode The nullability mode of the property.
 * @example
 * class TestClass {
 *    \@JsonProperty('test', JsonType.STRING)
 *    public test: string;
 *
 *   \@JsonProperty('testArray', [JsonType.STRING])
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
        const propertiesMetadata = targetConstructor.hasOwnProperty(metadataKey) ?
            targetConstructor[metadataKey] :
            Object.create(null);
        propertiesMetadata[propertyKey] = metadata;
        targetConstructor[metadataKey] = propertiesMetadata;
    };
};
