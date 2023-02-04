# TypeScript Union Type Generator

Generates TypeScript union types straight from raw payloads ([live demo](https://blog.atomrc.dev/typescript-union-generator/)).

Transforms this:

```js
[
  { type: "first", value: "two" },
  { type: "second", val: 1 },
];
```

into:

```ts
type Type0 = { type: "first"; value: string };
type Type1 = { type: "second"; val: number };
type Union = Type0 | Type1;
```

## Installation

```
npm install tsug
```

## Usage

To generate a `Union Type` from a bunch of payloads, you can run

```js
import { generateUnion } from "ts-union-generator";

const types = generateUnion(payloads);
// ^ your union type and type definitions are in that string
```

## Discriminant detection

By default the library will take the first property that is common to every single payload that you give.  
If no common property can be found, it will just generate the raw types.

If needed you can provide the property that should be the discriminant as second parameter:

```js
const paylaods = [
  { value: "val", type: "first" },
  { value: "tough", type: "second" },
];

const types = generateUnion(payloads, 'type');
/*
type Type0 = { value: string, type: "first" };
type Type1 = { value: string, type: "second" };
type Union = Type0 | Type1;
*/
```
