import { renderTypeScript } from "./renderer";
import { TypeEntry, Type } from "./types";
import { Entry } from "./index";

function toType(entry: Entry, discriminant?: string): Type {
  return Object.entries(entry).reduce<Type>((types, [key, value]) => {
    let type: TypeEntry;
    if (typeof value === "object" && value) {
      type = { $$type: toType(value) };
    } else {
      type = {
        $$type: key === discriminant ? JSON.stringify(value) : typeof value,
      };
    }
    return { ...types, [key]: type };
  }, {});
}

function findDiscriminant(entries: Entry[]): string {
  // we just need to check the properties of the first object against all the other objects
  const properties = Object.keys(entries[0]);
  return properties.filter((prop) => {
    return entries.every((entry) =>
      Object.keys(entry).some((key) => key === prop)
    );
  }, [])[0];
}

export function generate(entities: Entry[], discriminant?: string) {
  if (!Array.isArray(entities)) {
    throw new Error("Entries must be an array of JSON payloads");
  }
  const useDiscriminant = discriminant ?? findDiscriminant(entities);
  return entities.map((entry) => toType(entry, useDiscriminant));
}
