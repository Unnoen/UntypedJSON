/* eslint-disable @typescript-eslint/consistent-type-definitions,@typescript-eslint/no-empty-interface */
// noinspection JSUnusedLocalSymbols

import {
    DeserializeObject,
    JsonMixin,
    JsonProperty,
    JsonType,
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
});
