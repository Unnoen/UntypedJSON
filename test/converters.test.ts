import {
    DeserializeObject,
    JsonConverter,
    JsonProperty,
    type JsonType,
    SerializeObject,
} from '../src';

/**
 * Tests for JsonConverter.
 */
describe('JsonConverter Tests', () => {
    it('should deserialize from string to date', () => {
        class DateConverter extends JsonConverter<Date> {
            public Serialize (value: Date): string {
                return value.toISOString();
            }

            public Deserialize (value: JsonType.STRING): Date {
                return new Date(value);
            }
        }

        class TestClass {
            @JsonProperty('date', DateConverter)
            public date: Date;
        }

        const jsonString = '{"date": "2019-01-01T00:00:00.000Z"}';

        const testClass = DeserializeObject(jsonString, TestClass);

        expect(testClass.date).toBeInstanceOf(Date);
        expect(testClass.date.getFullYear()).toBe(2_019);
    });

    it('should deserialize from date to string', () => {
        class DateConverter extends JsonConverter<Date> {
            public Serialize (value: Date): string {
                return value.toISOString();
            }

            public Deserialize (value: JsonType.STRING): Date {
                return new Date(value);
            }
        }

        class TestClass {
            @JsonProperty('date', DateConverter)
            public date: Date;
        }

        const testClass = new TestClass();
        testClass.date = new Date('2019-01-01');

        const json = SerializeObject(testClass);

        expect(JSON.stringify(json)).toBe('{"date":"2019-01-01T00:00:00.000Z"}');
    });

    it('should deserialize and prefix a string', () => {
        class PrefixConverter extends JsonConverter<string> {
            public Serialize (value: string): string {
                return `prefix-${value}`;
            }

            public Deserialize (value: JsonType.STRING): string {
                return value.replace('prefix-', '');
            }
        }

        class TestClass {
            @JsonProperty('prefix', PrefixConverter)
            public prefix: string;
        }

        const jsonString = '{"prefix": "prefix-value"}';

        const testClass = DeserializeObject(jsonString, TestClass);

        expect(testClass.prefix).toBe('value');
    });
});
