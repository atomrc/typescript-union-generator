import { generateUnion } from ".";

describe("generateUnion", () => {
  it("generates types for a single entry", () => {
    const type = generateUnion([{ type: "element", value: "hey" }]);
  });
});
