/* eslint-disable id-length */
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
import {
    JsonOptions,
} from '../src/decorators';

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

        expect(testJson).toEqual({
            test: 'test',
        });
    });

    it('should throw an error if the JSON string is invalid', () => {
        class TestClass {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        expect(() => {
            DeserializeObject('{"test": "test"', TestClass);
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
            @JsonProperty('i', JsonType.NUMBER)
            public int: number;

            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        const testJson = DeserializeObject({
            i: 1,
            t: 'test',
        }, TestClass);

        expect(testJson).toEqual({
            int: 1,
            test: 'test',
        });
    });

    it('should deserialize array properties correctly', () => {
        class TestClass {
            @JsonProperty('t', [JsonType.STRING])
            public test: string[];
        }

        const testJson = DeserializeObject({
            t: [
                'content',
            ],
        }, TestClass);

        expect(testJson).toEqual({
            test: [
                'content',
            ],
        });
    });

    it('should deserialize class properties correctly', () => {
        class Child {
            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        class Parent {
            @JsonProperty('c', Child)
            public child: Child;
        }

        const testJson = DeserializeObject({
            c: {
                t: 'content',
            },
        }, Parent);

        expect(testJson).toEqual({
            child: {
                test: 'content',
            },
        });
    });

    it('should deserialize array of class properties correctly', () => {
        class Child {
            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        class Parent {
            @JsonProperty('c', [Child])
            public child: Child[];
        }

        const testJson = DeserializeObject({
            c: [
                {
                    t: 'content',
                },
            ],
        }, Parent);

        expect(testJson).toEqual({
            child: [
                {
                    test: 'content',
                },
            ],
        });
    });

    it('should deserialize multi-nested class properties correctly', () => {
        class Child {
            @JsonProperty('t', [JsonType.STRING])
            public test: string;
        }

        class Parent {
            @JsonProperty('c', Child)
            public child: Child;
        }

        class GrandParent {
            @JsonProperty('p', Parent)
            public parent: Parent;
        }

        const testJson = DeserializeObject({
            p: {
                c: {
                    t: [
                        'content',
                    ],
                },
            },
        }, GrandParent);

        expect(testJson).toEqual({
            parent: {
                child: {
                    test: [
                        'content',
                    ],
                },
            },
        });
    });

    it('should deserialize extended class properties correctly', () => {
        class Child {
            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        class Parent extends Child {
            @JsonProperty('t2', JsonType.STRING)
            public test2: string;
        }

        const testJson = DeserializeObject({
            t: 'content',
            t2: 'content2',
        }, Parent);

        expect(testJson).toEqual({
            test: 'content',
            test2: 'content2',
        });
    });
});

/**
 * Tests for serializing a class into JSON with the JsonProperty decorator.
 */
describe('JsonProperty Serialize Tests', () => {
    it('should serialize a class correctly', () => {
        class TestClass {
            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        const testJson = new TestClass();
        testJson.test = 'test';

        expect(JSON.stringify(SerializeObject(testJson))).toBe('{"t":"test"}');
    });

    it('should serialize a class with an array correctly', () => {
        // noinspection JSMismatchedCollectionQueryUpdate - This is intentional.
        class TestClass {
            @JsonProperty('t', [JsonType.STRING])
            public test: string[];
        }

        const testJson = new TestClass();
        testJson.test = [
            'test',
        ];

        expect(JSON.stringify(SerializeObject(testJson))).toBe('{"t":["test"]}');
    });

    it('should serialize a class with a nested class correctly', () => {
        class Child {
            @JsonProperty('c', JsonType.STRING)
            public child: string;
        }

        class TestClass {
            @JsonProperty('t', Child)
            public test: Child;
        }

        const testJson = new TestClass();
        testJson.test = new Child();
        testJson.test.child = 'test';

        expect(JSON.stringify(SerializeObject(testJson))).toBe('{"t":{"c":"test"}}');
    });

    it('should serialize a class with an array of nested classes correctly', () => {
        class Child {
            @JsonProperty('c', JsonType.STRING)
            public child: string;
        }

        class TestClass {
            @JsonProperty('t', [Child])
            public test: Child[];
        }

        const testJson = new TestClass();
        testJson.test = [
            new Child(),
        ];
        testJson.test[0].child = 'test';

        expect(JSON.stringify(SerializeObject(testJson))).toBe('{"t":[{"c":"test"}]}');
    });
});

/**
 * Tests for the JsonProperty type checking.
 */
describe('JsonProperty Type Tests', () => {
    it('should throw an error when deserializing a property with the wrong type', () => {
        class TestClass {
            @JsonProperty('i', JsonType.NUMBER)
            public int: number;

            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        expect(() => {
            return DeserializeObject({
                i: '1',
                t: 'test',
            }, TestClass);
        }).toThrow('Property i is not a number. It is a string.');
    });

    it('should throw an error when deserializing a property with the wrong type in an array', () => {
        class TestClass {
            @JsonProperty('t', [JsonType.STRING])
            public test: string[];
        }

        expect(() => {
            return DeserializeObject({
                t: [
                    1,
                ],
            }, TestClass);
        }).toThrow('Property t is not an array of string. It is an array of number.');
    });

    it('should throw an error when deserializing a property with the wrong type in a class', () => {
        class Child {
            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        class Parent {
            @JsonProperty('c', Child)
            public child: Child;
        }

        expect(() => {
            return DeserializeObject({
                c: {
                    t: 1,
                },
            }, Parent);
        }).toThrow('Property t is not a string. It is a number.');
    });

    it('should infer the type from the default value if type not passed', () => {
        class TestClass {
            @JsonProperty('t')
            public test = 'default';
        }

        class TestClass2 {
            @JsonProperty('t')
            public test = 1;
        }

        const testJson = DeserializeObject({
            t: 'test',
        }, TestClass);

        const testJson2 = DeserializeObject({
            t: 1,
        }, TestClass2);

        expect(testJson).toEqual({
            test: 'test',
        });

        expect(testJson2).toEqual({
            test: 1,
        });
    });

    it('should use the passed in type even if a default value is passed', () => {
        class TestClass {
            @JsonProperty('t', JsonType.STRING)
            public test = 1;
        }

        const testJson = DeserializeObject({
            t: 'text',
        }, TestClass);

        expect(testJson).toEqual({
            test: 'text',
        });
    });

    it('should throw an error if type is not passed and a default value is not provided', () => {
        class TestClass {
            @JsonProperty('t')
            public test: number;
        }

        expect(() => {
            DeserializeObject({
                t: 'text',
            }, TestClass);
        }).toThrow('Property test does not have a type and cannot be inferred from the default value.');
    });
});

/**
 * Tests for the JsonProperty nullability.
 */
describe('JsonProperty Nullability Tests', () => {
    it('should throw an error when deserializing a property with null value and nullability set to map', () => {
        class TestClass {
            @JsonProperty('i', JsonType.NUMBER)
            public int: number;

            @JsonProperty('t', JsonType.STRING, PropertyNullability.MAP)
            public test: string;
        }

        expect(() => {
            return DeserializeObject({
                i: 1,
                t: null,
            }, TestClass);
        }).toThrow('Property t is not a string. It is null.');
    });

    it('should not throw an error when deserializing a property with null value and nullability set to ignore', () => {
        class TestClass {
            @JsonProperty('i', JsonType.NUMBER)
            public int: number;

            @JsonProperty('t', JsonType.STRING, PropertyNullability.IGNORE)
            public test: string;
        }

        expect(() => {
            return DeserializeObject({
                i: 1,
                t: null,
            }, TestClass);
        }).not.toThrow();
    });

    it('should not throw an error when deserializing a property not present in the class and nullability set to ignore', () => {
        class TestClass {
            @JsonProperty('i', JsonType.NUMBER)
            public int: number;

            @JsonProperty('t', JsonType.STRING, PropertyNullability.IGNORE)
            public test: string;
        }

        expect(() => {
            return DeserializeObject({
                i: 1,
            }, TestClass);
        }).not.toThrow();
    });

    it('should use the default value when deserializing a property not present in the JSON and nullability set to ignore', () => {
        class TestClass {
            @JsonProperty('i', JsonType.NUMBER)
            public int: number;

            @JsonProperty('t', JsonType.STRING, PropertyNullability.IGNORE)
            public test: string = 'test';
        }

        const testJson = DeserializeObject({
            i: 1,
        }, TestClass);

        expect(testJson).toEqual({
            int: 1,
            test: 'test',
        });
    });

    it('should deserialize an array property with a default value if nullability is set to ignore', () => {
        class TestClass {
            @JsonProperty('t', [JsonType.STRING], PropertyNullability.IGNORE)
            public test: string[] = ['test'];
        }

        const testJson = DeserializeObject({}, TestClass);

        expect(testJson).toEqual({
            test: ['test'],
        });
    });

    it('should throw an error if the property is not defined in the JSON', () => {
        class TestClass {
            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        expect(() => {
            DeserializeObject({}, TestClass);
        }).toThrow('Property t is not defined in the JSON.\r\n{}');
    });
});

describe('JsonOptions Tests', () => {
    it('should use the default nullability mode if not passed', () => {
        @JsonOptions({
            defaultNullabilityMode: PropertyNullability.IGNORE,
        })
        class TestClass {
            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        const testJson = DeserializeObject({
            t: null,
        }, TestClass);

        expect(testJson.test).toBeUndefined();
    });

    it('should only apply the options to the class it is applied to', () => {
        @JsonOptions({
            defaultNullabilityMode: PropertyNullability.IGNORE,
        })
        class Parent {
            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        class Child extends Parent {
            @JsonProperty('t2', JsonType.STRING)
            public test2: string;
        }

        expect(() => {
            return DeserializeObject({
                t: null,
                t2: null,
            }, Child);
        }).toThrow('Property t2 is not a string. It is null.');
    });

    it('should map JSON properties to class properties of the same name if mapClassNames is true', () => {
        @JsonOptions({
            mapClassProperties: true,
        })
        class TestClass {
            @JsonProperty('t', JsonType.STRING)
            public test: string;

            public test2?: string = undefined;

            public test3?: string[] = undefined;

            public test4: number = 1;
        }

        const testJson = DeserializeObject({
            t: 'test',
            test2: 'test2',
            test3: ['test3'],
            test4: 2,
        }, TestClass);

        expect(testJson).toEqual({
            test: 'test',
            test2: 'test2',
            test3: ['test3'],
            test4: 2,
        });
    });
});

describe('DeserializeOptions Tests', () => {
    it('should pass unknown properties if passUnknownProperties is true', () => {
        class TestClass {
            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        const testJson = DeserializeObject({
            t: 'test',
            test2: 'test2',
        }, TestClass, {
            passUnknownProperties: true,
        });

        expect(testJson).toEqual({
            test: 'test',
            test2: 'test2',
        });
    });

    it('should map JSON properties to class properties of the same name if mapClassNames is true', () => {
        class TestClass {
            @JsonProperty('t', JsonType.STRING)
            public test: string;

            public test2?: string = undefined;

            public test3?: string[] = undefined;

            public test4: number = 1;
        }

        const testJson = DeserializeObject({
            t: 'test',
            test2: 'test2',
            test3: ['test3'],
            test4: 2,
        }, TestClass, {
            mapClassProperties: true,
        });

        expect(testJson).toEqual({
            test: 'test',
            test2: 'test2',
            test3: ['test3'],
            test4: 2,
        });
    });

    it('should pass unknown properties of all child classes if passUnknownProperties is true', () => {
        class Child {
            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        class Parent {
            @JsonProperty('c', Child)
            public child: Child;
        }

        const testJson = DeserializeObject({
            c: {
                t: 'test',
                test2: 'test2',
            },
        }, Parent, {
            passUnknownProperties: true,
        });

        expect(testJson).toEqual({
            child: {
                test: 'test',
                test2: 'test2',
            },
        });
    });

    it('should not pass unknown properties if passUnknownProperties is false or not passed', () => {
        class TestClass {
            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        const testJson = DeserializeObject({
            t: 'test',
            test2: 'test2',
        }, TestClass, {
            passUnknownProperties: false,
        });

        expect(testJson.test).toBe('test');
        expect((testJson as any).test2).toBeUndefined();

        class TestClass2 {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        const testJson2 = DeserializeObject({
            test: 'test',
            test2: 'test2',
        }, TestClass2);

        expect(testJson2).toEqual({
            test: 'test',
        });
    });
});

describe('SerializeOptions Tests', () => {
    it('should pass unknown properties if passUnknownProperties is true', () => {
        class TestClass {
            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        const testJson = new TestClass();
        testJson.test = 'test';
        (testJson as any).test2 = 'test2';

        expect(JSON.stringify(SerializeObject(testJson, {
            passUnknownProperties: true,
        }))).toBe('{"t":"test","test2":"test2"}');
    });

    it('should pass unknown properties of all child classes if passUnknownProperties is true', () => {
        class Child {
            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        class Parent {
            @JsonProperty('c', Child)
            public child: Child;
        }

        const testJson = new Parent();
        testJson.child = new Child();
        testJson.child.test = 'test';
        (testJson.child as any).test2 = 'test2';

        expect(JSON.stringify(SerializeObject(testJson, {
            passUnknownProperties: true,
        }))).toBe('{"c":{"t":"test","test2":"test2"}}');
    });

    it('should not pass unknown properties if passUnknownProperties is false or not passed', () => {
        class TestClass {
            @JsonProperty('t', JsonType.STRING)
            public test: string;
        }

        const testJson = new TestClass();
        testJson.test = 'test';
        (testJson as any).test2 = 'test2';

        expect(JSON.stringify(SerializeObject(testJson, {
            passUnknownProperties: false,
        }))).toBe('{"t":"test"}');

        const testJson2 = new TestClass();
        testJson2.test = 'test';
        (testJson2 as any).test2 = 'test2';

        expect(JSON.stringify(SerializeObject(testJson2))).toBe('{"t":"test"}');
    });
});
