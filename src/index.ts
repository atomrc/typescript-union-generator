import { renderTypeScript } from "./renderer";
import { generate, Entry, NamedEntries } from "./generator";

export function generateUnion(
  entries: Entry[] | NamedEntries,
  discriminant?: string
) {
  const types = generate(entries, discriminant);
  return renderTypeScript(types);
}
