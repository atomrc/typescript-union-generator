import { generateUnion } from "./index";
import { format } from "prettier";

function f(code: string) {
  return format(code, { parser: "typescript" });
}

describe("generateUnion", () => {
  it("generates raw types if no discriminant is found", () => {
    const type = generateUnion([
      { type: "first", value: 2 },
      { name: "hello", val: 1 },
    ]);

    expect(f(type)).toEqual(
      f(
        `
    type Type0 = { type: string, value: number};
    type Type1 = { name: string, val: number};
    type Union = Type0 | Type1;
    `
      )
    );
  });

  it("uses the given discriminant if provided", () => {
    const payloads = [
      { value: "val", type: "first" },
      { value: "tough", type: "second" },
    ];

    const types = generateUnion(payloads, { discriminant: "type" });

    expect(f(types)).toEqual(
      f(
        `
    type Type0 = { value: string, type: "first" };
    type Type1 = { value: string, type: "second" };
    type Union = Type0 | Type1;
    `
      )
    );
  });

  it("generates nested types", () => {
    const type = generateUnion([
      { type: "first", value: 2, data: { test: 1, value: "test" } },
      { type: "second", value: 2, data: { other: 1 } },
    ]);

    expect(f(type)).toEqual(
      f(
        `
    type Type0 = {
        type: "first",
        value: number,
        data: { test: number, value: string }
    };
    type Type1 = { type: "second", value: number, data: {other: number} };
    type Union = Type0 | Type1;
    `
      )
    );
  });

  it("keeps the discriminant's value", () => {
    const type = generateUnion([
      { type: "first", value: 1 },
      { type: "second" },
      { type: "third" },
    ]);

    expect(f(type)).toEqual(
      f(
        `
    type Type0 = { type: "first", value: number};
    type Type1 = { type: "second" };
    type Type2 = { type: "third" };
    type Union = Type0 | Type1 | Type2;
    `
      )
    );
  });

  it("generates named types", () => {
    const type = generateUnion({
      UserCreate: {
        type: "user-create",
        id: 12,
        username: "atomrc",
      },
      UserDelete: {
        type: "user-delete",
        id: 12,
      },
    });

    expect(f(type)).toEqual(
      f(
        `
    type UserCreate = { type: "user-create", id: number, username: string};
    type UserDelete = { type: "user-delete", id: number };
    type Union = UserCreate | UserDelete;
    `
      )
    );
  });

  it("extract common properties that have similar type", () => {
    const type = generateUnion(
      {
        First: { type: "first", value: 1, common: "one", first: 1 },
        Second: { type: "second", value: 2, common: "two", second: "second" },
        Third: { type: "third", common: "third" },
      },
      { extractCommon: true }
    );

    expect(f(type)).toEqual(
      f(`
      type Base = {common: string};
      type First = Base & {type: "first", value: number, first: number}
      type Second = Base & {type: "second", value: number, second: string}
      type Third = Base & {type: "third"}
      type Union = First | Second | Third
    `)
    );
  });

  it("doesn't create base type if not properties are in common", () => {
    const type = generateUnion(
      {
        First: { type: "first", value: 1, first: 1 },
        Second: { type: "second", value: 2, second: "second" },
        Third: { type: "third" },
      },
      { extractCommon: true }
    );

    expect(f(type)).toEqual(
      f(`
      type First = {type: "first", value: number, first: number}
      type Second = {type: "second", value: number, second: string}
      type Third = {type: "third"}
      type Union = First | Second | Third
    `)
    );
  });

  it("does not consider common property if the types differ", () => {
    const type = generateUnion(
      {
        First: { type: "first", value: 1 },
        Second: { type: "second", value: "hello" },
      },
      { extractCommon: true }
    );

    expect(f(type)).toEqual(
      f(`
      type First = {type: "first", value: number}
      type Second = {type: "second", value: string}
      type Union = First | Second
    `)
    );
  });

  it("generates any[] for array types", () => {
    const type = generateUnion({
      First: [{ type: "first", value: ["hello"] }],
    });

    expect(f(type)).toEqual(
      f(`
      type First = {type: "first", value: any[]}
    `)
    );
  });

  it("merges types when an array is given", () => {
    const type = generateUnion({
      First: [
        { type: "first", value: 1, first: 1 },
        { type: "first", value: 2 },
      ],
    });

    expect(f(type)).toEqual(
      f(`
      type First = {type: "first", value: number, first?: number}
    `)
    );
  });

  it.each([[{}], ["test"], [1]])(
    "only accepts array of JSON objects (%s)",
    (payload: any) => {
      expect(() => generateUnion(payload)).toThrow("must be an array");
    }
  );
});
