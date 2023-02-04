import { renderTypeScript } from "./renderer";
import { generate } from "./generator";

export type Entry = Object;

export function generateUnion(entries: Object[], discriminant?: string) {
  const types = generate(entries, discriminant);
  return renderTypeScript(types);
}
