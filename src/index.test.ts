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

    const types = generateUnion(payloads, "type");

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
    ]);

    expect(f(type)).toEqual(
      f(
        `
    type Type0 = {
        type: "first",
        value: number,
        data: { test: number, value: string }
    };
    type Union = Type0;
    `
      )
    );
  });

  it("keeps the discriminant's value", () => {
    const type = generateUnion([
      { type: "first", value: 1 },
      { type: "second" },
      { type: 3 },
    ]);

    expect(f(type)).toEqual(
      f(
        `
    type Type0 = { type: "first", value: number};
    type Type1 = { type: "second" };
    type Type2 = { type: 3 };
    type Union = Type0 | Type1 | Type2;
    `
      )
    );
  });

  it.each([[{}], ["test"], [1]])(
    "only accepts array of JSON objects (%s)",
    (payload: any) => {
      expect(() => generateUnion(payload)).toThrow("must be an array");
    }
  );
});
