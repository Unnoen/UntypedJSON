# UntypedJSON
##### Typed JSON. The name is a lie.
[![npm](https://img.shields.io/npm/v/@unnoen/untypedjson?logo=npm)](https://www.npmjs.com/package/@unnoen/untypedjson)
[![workflow](https://github.com/unnoen/untypedjson/actions/workflows/pull-request.yml/badge.svg?event=push&branch=main)](https://github.com/Unnoen/UntypedJSON)
---
A simple JSON deserializer and serializer for Node.js and the browser using TypeScript decorators.

Ever been working with JSON that uses inconsistent naming conventions? Then this is the library for you!

It supports nested classes, arrays, null/undefined values, has type safety and the ability to create custom deserializers and serializers.

It also has support for Mixins, so you can extend (multiple!) classes and override properties.

Designed to be lightweight with no dependencies. Your bundler will thank you.

Offers both CommonJS and ES Module builds, so you can use it with Node.js, Webpack, Rollup, Parcel, Vite etc.

- [Installation](#installation)
- [Usage](#usage)
  - [Simple Types](#simple-types)
  - [Arrays](#arrays)
  - [Nested Classes](#nested-classes)
  - [Extending Classes](#extending-classes)
  - [Null & Undefined Values](#null--undefined-values)
  - [Default Values](#default-values)
  - [Custom Deserializers & Serializers](#custom-deserializers--serializers)
  - [Mixins](#mixins)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Installation
Just use your favourite package manager:

npm

`npm install @unnoen/untypedjson`

pnpm

`pnpm add @unnoen/untypedjson`

Yarn

`yarn add @unnoen/untypedjson`

## Usage
It's super simple to use.
Just decorate your class with `@JsonProperty`, the name of the JSON property and the type of the property.

Then use the `DeserializeObject` function to parse the JSON string or object into an instance of your class.

Or use the `SerializeObject` function to convert your class instance into a JSON object, ready to be stringified.

Make sure you have these options enabled in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Simple Types
You have to use the provided `JsonType` enum so that the parser knows how to parse the value.

```ts
import { DeserializeObject, JsonProperty, JsonType } from "@unnoen/untypedjson";


class Person {
  // The JSON uses terrible naming conventions, so we map them to our own ones.
  @JsonProperty('fn', JsonType.STRING)
  public name: string;

  @JsonProperty('a', JsonType.NUMBER)
  public age: number;
}

const jsonString = '{"fn": "John Doe", "a": 42}';

const person = DeserializeObject(jsonString, Person);

// Now we can use our own property names!
console.log(person.name); // John Doe
console.log(person.age); // 42
```

You can also import the `JsonType` constants directly if that's more your style.
```ts
import { DeserializeObject, JsonProperty, STRING } from "@unnoen/untypedjson";

class Person {
  @JsonProperty('fn', STRING)
  public name: string;
}
// ...
```

### Arrays
Just wrap your type in an array.
The parser will automatically detect it and parse it as an array.

```ts
import { DeserializeObject, JsonProperty, JsonType } from "@unnoen/untypedjson";

class Person {
    @JsonProperty('aka', [JsonType.STRING])
    public aliases: string[];
}

const jsonString = '{"aka": ["John", "Doe"]}';

const person = DeserializeObject(jsonString, Person);

console.log(person.aliases); // ["John", "Doe"]
console.log(person.aliases[0]); // John
```

### Nested Classes
Just use the class as the type.

```ts
import { DeserializeObject, JsonProperty, JsonType } from "@unnoen/untypedjson";

class Person {
    @JsonProperty('fn', JsonType.STRING)
    public name: string;

    @JsonProperty('a', JsonType.NUMBER)
    public age: number;
}

class Company {
    @JsonProperty('cn', JsonType.STRING)
    public name: string;

    @JsonProperty('employees', [Person]) // You can also use them in arrays!
    public employees: Person[];
}

const jsonString = '{"cn": "ACME Inc.", "employees": [{"fn": "John Doe", "a": 42}]}';

const company = DeserializeObject(jsonString, Company);

console.log(company.name); // ACME Inc.
console.log(company.employees[0].name); // John Doe
```

### Extending Classes
Just extend the class and use the `@JsonProperty` decorator on the properties you want to override.

```ts
import { DeserializeObject, JsonProperty, JsonType } from "@unnoen/untypedjson";

class Person {
    @JsonProperty('fn', JsonType.STRING)
    public name: string;

    @JsonProperty('a', JsonType.NUMBER)
    public age: number;
}

class Employee extends Person {
    @JsonProperty('s', JsonType.NUMBER)
    public salary: number;
}

const jsonString = '{"fn": "John Doe", "a": 42, "s": 100000}';

const employee = DeserializeObject(jsonString, Employee);

console.log(employee.name); // John Doe
console.log(employee.salary); // 100000
```

### Null & Undefined Values
If you want to allow null or undefined values, just use the `PropertyNullability` enum.

- `PropertyNullability.MAP`will attempt to map the value to the type of the property. (default)
- `PropertyNullability.IGNORE` will ignore the property if it's null or undefined.
- `PropertyNullability.PASS` will pass the value as is.

```ts
import { DeserializeObject, JsonProperty, JsonType, PropertyNullability } from "@unnoen/untypedjson";

class Person {
    @JsonProperty('fn', JsonType.STRING)
    public name: string;
    
    @JsonProperty('a', JsonType.NUMBER, PropertyNullability.IGNORE)
    public age: number;
}

const jsonString = '{"fn": "John Doe"}';

const person = DeserializeObject(jsonString, Person);

console.log(person.name); // John Doe
console.log(person.age); // undefined
```

### Default Values
If you want to set a default value, just set it in the initializer.

Make sure to set the `PropertyNullability` to `PropertyNullability.IGNORE` so that the parser doesn't override it!

```ts
import { DeserializeObject, JsonProperty, JsonType, PropertyNullability } from "@unnoen/untypedjson";

class Person {
    @JsonProperty('fn', JsonType.STRING)
    public name: string;
    
    @JsonProperty('a', JsonType.NUMBER, PropertyNullability.IGNORE)
    public age: number = 42;
}

const jsonString = '{"fn": "John Doe"}';

const person = DeserializeObject(jsonString, Person);

console.log(person.name); // John Doe
console.log(person.age); // 42
```

### Custom Deserializers & Serializers
If you want to use a custom deserializer or serializer, just extend the `JsonConverter` class and override the `Deserialize` and `Serialize` methods.

Make sure you implement your own type checking!

```ts
import { DeserializeObject, JsonConverter, JsonProperty, JsonType } from "@unnoen/untypedjson";

class DateConverter extends JsonConverter<Date> {
    public Serialize (value: Date): string {
        return value.toISOString();
    }

    public Deserialize (value: JsonType.STRING): Date {
        return new Date(value);
    }
}

class Person {
    @JsonProperty('fn', JsonType.STRING)
    public name: string;

    @JsonProperty('b', DateConverter)
    public birthday: Date;
}

const jsonString = '{"fn": "John Doe", "b": "1990-01-01"}';

const person = DeserializeObject(jsonString, Person);

console.log(person.name); // John Doe
console.log(person.birthday.getFullYear()); // 1990
```

### Mixins
Ever wanted to add properties to a class from multiple other classes? Well now you can!

Use `@JsonMixin` to inherit properties from multiple classes. It also inherits the `@JsonProperty` decorators and getters/setters.

Make sure to define the interface for the class you're mixing in!

```ts
import { DeserializeObject, JsonMixin, JsonProperty, JsonType } from "@unnoen/untypedjson";

interface EmployeePerson extends Person, Employee {} // You must define the interface otherwise the compiler will complain.

class Person {
    @JsonProperty('fn', JsonType.STRING)
    public name: string;
}

class Employee {
    @JsonProperty('s', JsonType.NUMBER)
    public salary: number;
}

@JsonMixin(Person, Employee)
class EmployeePerson {
    // This class will have the properties from Person and Employee
}

const jsonString = '{"fn": "John Doe", "s": 100000}';

const employee = DeserializeObject(jsonString, EmployeePerson);

console.log(employee.name); // John Doe
console.log(employee.salary); // 100000
```

## Contributing
No pull request is too small!

If you want to contribute, just fork the repository and create a pull request into the `main` branch.

This project uses [Yarn Berry](https://yarnpkg.com/getting-started/install) for package management, however you can use npm if you want, it should work just fine.

Linting and tests are run on every commit, but don't worry if it fails! The most important part is contributing, linting issues and tests can be fixed later. :)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

TL;DR - Do whatever you want with it. Just don't sue me if it breaks.
I'd appreciate it if you could link back to this repository though. :)

## Acknowledgements
- [json2typescript](https://www.npmjs.com/package/json2typescript)
  - UntypedJSON is heavily inspired by this project. I wanted a lightweight alternative and decided to make my own.
