# TypeScript Union Type Generator

Generates TypeScript union types straight from raw payloads ([live demo](https://blog.atomrc.dev/typescript-union-generator/)).

Transforms this:

```js
{
  First: { type: "first", value: "two" },
  Second: { type: "second", val: 1 },
};
```

into:

```ts
type First = { type: "first"; value: string };
type Second = { type: "second"; val: number };
type Union = First | Second;
```

## Installation

```
npm install tsug
```

## Usage

To generate a `Union Type` from a bunch of payloads, you can run

```js
import { generateUnion } from "ts-union-generator";

const events = {
  UserCreate: {
    type: "user-create",
    id: 12,
    username: "atomrc",
  },
  UserDelete: {
    type: "user-delete",
    id: 12,
  },
};
const types = generateUnion(payloads);
// ^ your union type and type definitions are in that string
```

## Discriminant detection

By default the library will take the first property that is common to every single payload that you give.  
If no common property can be found, it will just generate the raw types.

If needed you can provide the property that should be the discriminant as second parameter:

```js
const payloads = {
  First: { value: "val", type: "first" },
  Second: { value: "tough", type: "second" },
};

const types = generateUnion(payloads, { discriminant: "type" });
/*
type First = { value: string, type: "first" };
type Second = { value: string, type: "second" };
type Union = First | Second;
*/
```

## Optional properties detection

If a single payload is given for a particular type you want to generate, then no optional properties can be inferred from it.
Instead, if you pass an array of payloads for a single type then `tsug` will automatically infer which properties are optional or mandatory. 
It will also merge the types of a single property together, in case there are multiple types. 

```js
const payloads = {
  First: [
    // notice the array for the type First
    { type: "first", name: "felix", value: 1, age: 10 },
    { type: "first", name: "sam", value: "two" },
  ],
};

const types = generateUnion(payloads);
/*
type First = {
  type: "first",
  name: string,
  value: number | string,
  age?: number
};
*/
```

## Extract common properties to a Base type

You might want to extact properties that are common between all the types. In this case you can pass `{ extractCommon: true }` option to the `generateUnion` function

```js
const payloads = {
  First: { type: "a", value: "first" },
  Second: { type: "b", value: "second" },
  Third: { type: "c", value: "third" },
};

const types = generateUnion(payload, { extractCommon: true });
/*
type Base = { value: string };
type First = Base & { type: "a" };
type Second = Base & { type: "b" };
type Third = Base & { type: "c" };
type Union = First | Second | Third;
*/
```
