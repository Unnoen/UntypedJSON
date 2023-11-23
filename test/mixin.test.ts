/* eslint-disable @typescript-eslint/consistent-type-definitions,@typescript-eslint/no-empty-interface */
// noinspection JSUnusedLocalSymbols

import {
    DeserializeObject,
    JsonMixin,
    JsonOptions,
    JsonProperty,
    JsonType,
    PropertyNullability,
} from '../src';

/**
 * Tests for the JsonMixin decorator.
 */
describe('JsonMixin', () => {
    it('should mixin a class and deserialize correctly', () => {
        interface TestClass extends TestMixinClass {}

        class TestMixinClass {
            @JsonProperty('testMixin', JsonType.STRING)
            public testMixin: string;
        }

        @JsonMixin(TestMixinClass)
        class TestClass {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        const testJson = '{"test": "test", "testMixin": "testMixin"}';

        const testClass = DeserializeObject(testJson, TestClass);

        expect(testClass.test).toBe('test');
        expect(testClass.testMixin).toBe('testMixin');
    });

    it('should mixin multiple classes and deserialize correctly', () => {
        interface TestClass extends TestMixinClass, TestMixinClass2 {}

        class TestMixinClass {
            @JsonProperty('testMixin', JsonType.STRING)
            public testMixin: string;
        }

        class TestMixinClass2 {
            @JsonProperty('testMixin2', JsonType.STRING)
            public testMixin2: string;
        }

        @JsonMixin(TestMixinClass, TestMixinClass2)
        class TestClass {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        const testJson = '{"test": "test", "testMixin": "testMixin", "testMixin2": "testMixin2"}';

        const testClass = DeserializeObject(testJson, TestClass);

        expect(testClass.test).toBe('test');
        expect(testClass.testMixin).toBe('testMixin');
        expect(testClass.testMixin2).toBe('testMixin2');
    });

    it('should mixin an extended class and deserialize correctly', () => {
        interface TestClass extends TestMixinClass2 {}

        class TestMixinClass {
            @JsonProperty('testMixin', JsonType.STRING)
            public testMixin: string;
        }

        class TestMixinClass2 extends TestMixinClass {
            @JsonProperty('testMixin2', JsonType.STRING)
            public testMixin2: string;
        }

        @JsonMixin(TestMixinClass2)
        class TestClass {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        const testJson = '{"test": "test", "testMixin": "testMixin", "testMixin2": "testMixin2"}';

        const testClass = DeserializeObject(testJson, TestClass);

        expect(testClass.test).toBe('test');
        expect(testClass.testMixin).toBe('testMixin');
        expect(testClass.testMixin2).toBe('testMixin2');
    });

    it('should mixin a class with a nested class property and deserialize correctly', () => {
        interface TestClass extends TestMixin {}

        class TestClassProperty {
            @JsonProperty('property', JsonType.STRING)
            public property: string;
        }

        class TestMixin {
            @JsonProperty('testMixin', TestClassProperty)
            public testMixin: TestClassProperty;
        }

        @JsonMixin(TestMixin)
        class TestClass {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        const testJson = '{"test": "test", "testMixin": {"property": "property"}}';

        const testClass = DeserializeObject(testJson, TestClass);

        expect(testClass.test).toBe('test');
        expect(testClass.testMixin).toBeInstanceOf(TestClassProperty);
        expect(testClass.testMixin.property).toBe('property');
    });

    it('should serialize correctly', () => {
        interface TestClass extends TestMixin {}

        class TestClassProperty {
            @JsonProperty('property', JsonType.STRING)
            public property: string;
        }

        class TestMixin {
            @JsonProperty('testMixin', TestClassProperty)
            public testMixin: TestClassProperty;
        }

        @JsonMixin(TestMixin)
        class TestClass {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        const testClass = new TestClass();
        testClass.test = 'test';
        testClass.testMixin = new TestClassProperty();
        testClass.testMixin.property = 'property';

        const testJson = JSON.stringify(testClass);

        expect(testJson).toBe('{"test":"test","testMixin":{"property":"property"}}');
    });

    it('should inherit functions from mixins correctly', () => {
        interface TestClass extends TestMixinClass {}

        class TestMixinClass {
            @JsonProperty('testMixin', JsonType.STRING)
            public testMixin: string;

            public get testGetter (): string {
                return 'test' + this.testMixin;
            }

            public testFunction (): string {
                return 'test' + this.testMixin;
            }
        }

        @JsonMixin(TestMixinClass)
        class TestClass {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        const testJson = '{"test": "test", "testMixin": "testMixin"}';

        const testClass = DeserializeObject(testJson, TestClass);

        expect(testClass.test).toBe('test');
        expect(testClass.testMixin).toBe('testMixin');
        expect(testClass.testGetter).toBe('testtestMixin');
        expect(testClass.testFunction()).toBe('testtestMixin');
    });

    it('should mixin a class with options', () => {
        interface TestClass extends TestMixinClass {}

        @JsonOptions({
            defaultNullabilityMode: PropertyNullability.IGNORE,
        })
        class TestMixinClass {
            @JsonProperty('testMixin', JsonType.STRING)
            public testMixin: string;
        }

        @JsonMixin(TestMixinClass)
        class TestClass {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        const testJson = '{"test": "test", "testMixin": null}';

        const testClass = DeserializeObject(testJson, TestClass);

        expect(testClass.test).toBe('test');
        expect(testClass.testMixin).toBeUndefined();
    });

    it('should not apply options to other classes when using multiple mixins', () => {
        interface TestClass extends TestMixinClass, TestMixinClass2 {
        }

        @JsonOptions({
            defaultNullabilityMode: PropertyNullability.IGNORE,
        })
        class TestMixinClass {
            @JsonProperty('testMixin', JsonType.STRING)
            public testMixin: string;
        }

        class TestMixinClass2 {
            @JsonProperty('testMixin2', JsonType.STRING)
            public testMixin2: string;
        }

        @JsonMixin(TestMixinClass, TestMixinClass2)
        class TestClass {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        const testJson = '{"test": "test", "testMixin": null, "testMixin2": "testMixin2"}';
        const testClass = DeserializeObject(testJson, TestClass);

        expect(testClass.test).toBe('test');
        expect(testClass.testMixin).toBeUndefined();
        expect(testClass.testMixin2).toBe('testMixin2');

        const testJson2 = '{"test": "test", "testMixin": null, "testMixin2": null}';

        expect(() => {
            return DeserializeObject(testJson2, TestClass);
        }).toThrow('Property testMixin2 is not a string. It is null.');
    });

    it('should work with multiple decorators on one class', () => {
        interface TestClass extends TestMixinClass {}

        class TestMixinClass {
            @JsonProperty('testMixin', JsonType.STRING)
            public testMixin: string;
        }

        @JsonOptions({
            defaultNullabilityMode: PropertyNullability.IGNORE,
        })
        @JsonMixin(TestMixinClass)
        class TestClass {
            @JsonProperty('test', JsonType.STRING)
            public test: string;
        }

        const testJson = '{"test": null, "testMixin": "testMixin"}';

        const testClass = DeserializeObject(testJson, TestClass);

        expect(testClass.test).toBeUndefined();
        expect(testClass.testMixin).toBe('testMixin');
    });
});
