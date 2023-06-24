import 'jest';
import {
    ANY,
    BOOLEAN,
    DeserializeObject,
    JsonProperty,
    JsonType,
    NUMBER,
    OBJECT,
    PropertyNullability,
    SerializeObject,
    STRING,
} from '../src';

/**
 * Tests for the JsonType enum.
 */
describe('JsonType Tests', () => {
    it('should have the correct values', () => {
        expect(JsonType.STRING).toBe('string');
        expect(JsonType.NUMBER).toBe('number');
        expect(JsonType.BOOLEAN).toBe('boolean');
        expect(JsonType.OBJECT).toBe('object');
        expect(JsonType.ANY).toBe('any');
    });
});

/**
 * Tests for the JsonType constants.
 */
describe('JsonType Constants Tests', () => {
    it('should have the correct values', () => {
        expect(STRING).toBe('string');
        expect(NUMBER).toBe('number');
        expect(BOOLEAN).toBe('boolean');
        expect(OBJECT).toBe('object');
        expect(ANY).toBe('any');
    });
});

/**
 * Deserialization tests.
 */
describe('DeserializeObject Tests', () => {
    it('should parse a JSON string', () => {
        class TestClass {
            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        const testJson = DeserializeObject('{"t": "test"}', TestClass);

        expect(testJson.test).toBe('test');
    });

    it('should throw an error if the JSON string is invalid', () => {
        class TestClass {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        expect(() => {
            DeserializeObject('{"test": "test"', TestClass);
            // eslint-disable-next-line jest/require-to-throw-message
        }).toThrow();
    });

    it('should throw an error if the JSON is not an object', () => {
        class TestClass {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        expect(() => {
            // @ts-expect-error(2345) - This is intentional.
            DeserializeObject(1, TestClass);
        }).toThrow('json is not an object or string.');
    });

    it('should throw an error if an array with more than one type is passed', () => {
        class TestClass {
            @JsonProperty('test', [JsonType.STRING,
                JsonType.NUMBER])
            public test: string[];
        }

        expect(() => {
            DeserializeObject({
                test: [
                    'test',
                    1,
                ],
            }, TestClass);
        }).toThrow('Property test is an array of multiple types. This is not supported.');
    });
});

/**
 * Tests for deserializing JSON into a class instance with the JsonProperty decorator.
 */
describe('JsonProperty Deserialize Tests', () => {
    it('should deserialize correctly', () => {
        class TestClass {
            @JsonProperty('int', JsonType.NUMBER)
            public int: number;

            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        const testJson = DeserializeObject({
            int: 1,
            test: 'test',
        }, TestClass);

        expect(testJson.int).toBe(1);
        expect(testJson.test).toBe('test');
    });

    it('should deserialize array properties correctly', () => {
        class TestClass {
            @JsonProperty('test', [JsonType.STRING])
            public test: string[];
        }

        const testJson = DeserializeObject({
            test: [
                'content',
            ],
        }, TestClass);

        expect(testJson.test[0]).toBe('content');
    });

    it('should deserialize class properties correctly', () => {
        class Child {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        class Parent {
            @JsonProperty('child', Child)
            public child: Child;
        }

        const testJson = DeserializeObject({
            child: {
                test: 'content',
            },
        }, Parent);

        expect(testJson.child.test).toBe('content');
    });

    it('should deserialize array of class properties correctly', () => {
        class Child {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        class Parent {
            @JsonProperty('child', [Child])
            public child: Child[];
        }

        const testJson = DeserializeObject({
            child: [
                {
                    test: 'content',
                },
            ],
        }, Parent);

        expect(testJson.child[0].test).toBe('content');
    });

    it('should deserialize multi-nested class properties correctly', () => {
        class Child {
            @JsonProperty('test', [JsonType.STRING])
            public test: string;
        }

        class Parent {
            @JsonProperty('child', Child)
            public child: Child;
        }

        class GrandParent {
            @JsonProperty('parent', Parent)
            public parent: Parent;
        }

        const testJson = DeserializeObject({
            parent: {
                child: {
                    test: [
                        'content',
                    ],
                },
            },
        }, GrandParent);

        expect(testJson.parent.child.test[0]).toBe('content');
    });

    it('should deserialize extended class properties correctly', () => {
        class Child {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        class Parent extends Child {
            @JsonProperty('test2', JsonType.STRING)
            public test2: string;
        }

        const testJson = DeserializeObject({
            test: 'content',
            test2: 'content2',
        }, Parent);

        expect(testJson.test).toBe('content');
        expect(testJson.test2).toBe('content2');
    });
});

/**
 * Tests for serializing a class into JSON with the JsonProperty decorator.
 */
describe('JsonProperty Serialize Tests', () => {
    it('should serialize a class correctly', () => {
        class TestClass {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        const testJson = new TestClass();
        testJson.test = 'test';

        expect(JSON.stringify(SerializeObject(testJson))).toBe('{"test":"test"}');
    });

    it('should serialize a class with an array correctly', () => {
        // noinspection JSMismatchedCollectionQueryUpdate - This is intentional.
        class TestClass {
            @JsonProperty('test', [JsonType.STRING])
            public test: string[];
        }

        const testJson = new TestClass();
        testJson.test = [
            'test',
        ];

        expect(JSON.stringify(SerializeObject(testJson))).toBe('{"test":["test"]}');
    });

    it('should serialize a class with a nested class correctly', () => {
        class Child {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        class TestClass {
            @JsonProperty('test', Child)
            public test: Child;
        }

        const testJson = new TestClass();
        testJson.test = new Child();
        testJson.test.test = 'test';

        expect(JSON.stringify(SerializeObject(testJson))).toBe('{"test":{"test":"test"}}');
    });

    it('should serialize a class with an array of nested classes correctly', () => {
        class Child {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        class TestClass {
            @JsonProperty('test', [Child])
            public test: Child[];
        }

        const testJson = new TestClass();
        testJson.test = [
            new Child(),
        ];
        testJson.test[0].test = 'test';

        expect(JSON.stringify(SerializeObject(testJson))).toBe('{"test":[{"test":"test"}]}');
    });
});

/**
 * Tests for the JsonProperty type checking.
 */
describe('JsonProperty Type Tests', () => {
    it('should throw an error when deserializing a property with the wrong type', () => {
        class TestClass {
            @JsonProperty('int', JsonType.NUMBER)
            public int: number;

            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        expect(() => {
            return DeserializeObject({
                int: '1',
                test: 'test',
            }, TestClass);
        }).toThrow('Property int is not a number. It is a string.');
    });

    it('should throw an error when deserializing a property with the wrong type in an array', () => {
        class TestClass {
            @JsonProperty('test', [JsonType.STRING])
            public test: string[];
        }

        expect(() => {
            return DeserializeObject({
                test: [
                    1,
                ],
            }, TestClass);
        }).toThrow('Property test is not an array of string. It is an array of number.');
    });

    it('should throw an error when deserializing a property with the wrong type in a class', () => {
        class Child {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        class Parent {
            @JsonProperty('child', Child)
            public child: Child;
        }

        expect(() => {
            return DeserializeObject({
                child: {
                    test: 1,
                },
            }, Parent);
        }).toThrow('Property test is not a string. It is a number.');
    });
});

/**
 * Tests for the JsonProperty nullability.
 */
describe('JsonProperty Nullability Tests', () => {
    it('should throw an error when deserializing a property with null value and nullability set to map', () => {
        class TestClass {
            @JsonProperty('int', JsonType.NUMBER)
            public int: number;

            @JsonProperty('test', JsonType.STRING, PropertyNullability.MAP)
            public test: string;
        }

        expect(() => {
            return DeserializeObject({
                int: 1,
                test: null,
            }, TestClass);
        }).toThrow('Property test is not a string. It is a null.');
    });

    it('should not throw an error when deserializing a property with null value and nullability set to ignore', () => {
        class TestClass {
            @JsonProperty('int', JsonType.NUMBER)
            public int: number;

            @JsonProperty('test', JsonType.STRING, PropertyNullability.IGNORE)
            public test: string;
        }

        expect(() => {
            return DeserializeObject({
                int: 1,
                test: 'test',
            }, TestClass);
        }).not.toThrow();
    });

    it('should not throw an error when deserializing a property not present in the class and nullability set to ignore', () => {
        class TestClass {
            @JsonProperty('int', JsonType.NUMBER)
            public int: number;

            @JsonProperty('test', JsonType.STRING, PropertyNullability.IGNORE)
            public test: string;
        }

        expect(() => {
            return DeserializeObject({
                int: 1,
            }, TestClass);
        }).not.toThrow();
    });

    it('should use the default value when deserializing a property not present in the JSON and nullability set to ignore', () => {
        class TestClass {
            @JsonProperty('int', JsonType.NUMBER)
            public int: number;

            @JsonProperty('test', JsonType.STRING, PropertyNullability.IGNORE)
            public test: string = 'test';
        }

        const testJson = DeserializeObject({
            int: 1,
        }, TestClass);

        expect(testJson.test).toBe('test');
    });

    it('should deserialize an array property with a default value if nullability is set to ignore', () => {
        class TestClass {
            @JsonProperty('test', [JsonType.STRING], PropertyNullability.IGNORE)
            public test: string[] = ['test'];
        }

        const testJson = DeserializeObject({}, TestClass);

        expect(testJson.test).toEqual(['test']);
    });

    it('should throw an error if the property is not defined in the JSON', () => {
        class TestClass {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        expect(() => {
            DeserializeObject({}, TestClass);
        }).toThrow('Property test is not defined in the JSON.\r\n{}');
    });
});
