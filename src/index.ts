import { renderTypeScript } from "./renderer";
import { generate, GeneratorOptions } from "./generator";
import { Input, parseInput } from "./inputParser";

export function generateUnion(payloads: Input, options?: GeneratorOptions) {
  const entries = parseInput(payloads);
  const types = generate(entries, options);

  return renderTypeScript(types);
}
