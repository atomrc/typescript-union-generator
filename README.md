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

const types = generateUnion(payloads, "type");
/*
type First = { value: string, type: "first" };
type Second = { value: string, type: "second" };
type Union = First | Second;
*/
```
