# UntypedJSON
##### Typed JSON. The name is a lie.

---
A simple JSON deserializer and serializer for Node.js and the browser using TypeScript decorators.

It supports nested classes, arrays, null/undefined values, has type safety and the ability to create custom deserializers and serializers.

Designed to be lightweight with no dependencies. Your bundler will thank you.

- [Installation](#installation)
- [Usage](#usage)
  - [Simple Types](#simple-types)
  - [Arrays](#arrays)
  - [Nested Classes](#nested-classes)
  - [Extending Classes](#extending-classes)
  - [Null & Undefined Values](#null--undefined-values)
  - [Default Values](#default-values)
  - [Custom Deserializers & Serializers](#custom-deserializers--serializers)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Installation
Just use your favourite package manager:

npm

`npm install untypedjson`

pnpm

`pnpm add untypedjson`

Yarn

`yarn add untypedjson`

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
import { DeserializeObject, JsonProperty, JsonType } from "untypedjson";

class Person {
  @JsonProperty('name', JsonType.STRING)
  public name: string;

  @JsonProperty('age', JsonType.NUMBER)
  public age: number;
}

const jsonString = '{"name": "John Doe", "age": 42}';

const person = DeserializeObject(jsonString, Person);

console.log(person.name); // John Doe
console.log(person.age); // 42
```

You can also import the `JsonType` constants directly if that's more your style.
```ts
import { DeserializeObject, JsonProperty, STRING } from "untypedjson";

class Person {
  @JsonProperty('name', STRING)
  public name: string;
}
// ...
```

### Arrays
Just wrap your type in an array.
The parser will automatically detect it and parse it as an array.

```ts
import { DeserializeObject, JsonProperty, JsonType } from "untypedjson";

class Person {
    @JsonProperty('aliases', [JsonType.STRING])
    public aliases: string[];
}

const jsonString = '{"aliases": ["John", "Doe"]}';

const person = DeserializeObject(jsonString, Person);

console.log(person.aliases); // ["John", "Doe"]
console.log(person.aliases[0]); // John
```

### Nested Classes
Just use the class as the type.

```ts
import { DeserializeObject, JsonProperty, JsonType } from "untypedjson";

class Person {
    @JsonProperty('name', JsonType.STRING)
    public name: string;

    @JsonProperty('age', JsonType.NUMBER)
    public age: number;
}

class Company {
    @JsonProperty('name', JsonType.STRING)
    public name: string;

    @JsonProperty('employees', [Person]) // You can also use them in arrays!
    public employees: Person[];
}

const jsonString = '{"name": "ACME Inc.", "employees": [{"name": "John Doe", "age": 42}]}';

const company = DeserializeObject(jsonString, Company);

console.log(company.name); // ACME Inc.
console.log(company.employees[0].name); // John Doe
```

### Extending Classes
Just extend the class and use the `@JsonProperty` decorator on the properties you want to override.

```ts
import { DeserializeObject, JsonProperty, JsonType } from "untypedjson";

class Person {
    @JsonProperty('name', JsonType.STRING)
    public name: string;

    @JsonProperty('age', JsonType.NUMBER)
    public age: number;
}

class Employee extends Person {
    @JsonProperty('salary', JsonType.NUMBER)
    public salary: number;
}

const jsonString = '{"name": "John Doe", "age": 42, "salary": 100000}';

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
import { DeserializeObject, JsonProperty, JsonType, PropertyNullability } from "untypedjson";

class Person {
    @JsonProperty('name', JsonType.STRING)
    public name: string;
    
    @JsonProperty('age', JsonType.NUMBER, PropertyNullability.IGNORE)
    public age: number;
}

const jsonString = '{"name": "John Doe"}';

const person = DeserializeObject(jsonString, Person);

console.log(person.name); // John Doe
console.log(person.age); // undefined
```

### Default Values
If you want to set a default value, just set it in the initializer.

Make sure to set the `PropertyNullability` to `PropertyNullability.IGNORE` so that the parser doesn't override it!

```ts
import { DeserializeObject, JsonProperty, JsonType, PropertyNullability } from "untypedjson";

class Person {
    @JsonProperty('name', JsonType.STRING)
    public name: string;
    
    @JsonProperty('age', JsonType.NUMBER, PropertyNullability.IGNORE)
    public age: number = 42;
}

const jsonString = '{"name": "John Doe"}';

const person = DeserializeObject(jsonString, Person);

console.log(person.name); // John Doe
console.log(person.age); // 42
```

### Custom Deserializers & Serializers
If you want to use a custom deserializer or serializer, just extend the `JsonConverter` class and override the `Deserialize` and `Serialize` methods.

Make sure you implement your own type checking!

```ts
import { DeserializeObject, JsonConverter, JsonProperty, JsonType } from "untypedjson";

class DateConverter extends JsonConverter<Date> {
    public Serialize (value: Date): string {
        return value.toISOString();
    }

    public Deserialize (value: JsonType.STRING): Date {
        return new Date(value);
    }
}

class Person {
    @JsonProperty('name', JsonType.STRING)
    public name: string;

    @JsonProperty('birthday', DateConverter)
    public birthday: Date;
}

const jsonString = '{"name": "John Doe", "birthday": "1990-01-01"}';

const person = DeserializeObject(jsonString, Person);

console.log(person.name); // John Doe
console.log(person.birthday.getFullYear()); // 1990
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
