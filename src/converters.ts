import {
    type JsonType,
} from './types';

/**
 * A base class for JSON converters.
 *
 * When extending this class, you must implement the Serialize and Deserialize methods.
 * Type checking is not performed when using a custom converter.
 * @template T
 * @returns {JsonConverter<T>}
 * @class
 * @abstract
 * @example
 * class DateConverter extends JsonConverter<Date> {
 *   public Serialize (value: Date): string {
 *     return value.toISOString();
 *   }
 *   public Deserialize (value: string): Date {
 *     return new Date(value);
 *   }
 * }
 *
 * class MyClass {
 *   \@JsonProperty('date', DateConverter)
 *   public date: Date;
 * }
 */
export abstract class JsonConverter<T> {
    /**
     * Serializes a value into a JSON object.
     * @param {T} value
     * @returns {any}
     */
    public abstract Serialize (value: T): any;

    /**
     * Deserializes a JSON object into a value.
     * @param value
     * @returns {T}
     */
    public abstract Deserialize (value: JsonType): T;
}
