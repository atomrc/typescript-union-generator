import { TypeEntry, Type, Types } from "./types";

export type Entry = Object;
export type NamedEntries = Record<string, Entry>;

const isNamedEntries = (obj: unknown): obj is NamedEntries =>
  !!obj &&
  typeof obj === "object" &&
  Object.keys(obj).length > 0 &&
  !Array.isArray(obj);

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

function generateTypes(entries: NamedEntries, discriminant?: string): Types {
  return Object.entries(entries).reduce<Types>(
    (acc, [name, type]) => ({ ...acc, [name]: toType(type, discriminant) }),
    {}
  );
}

function findDiscriminant(entries: NamedEntries): string {
  // we just need to check the properties of the first object against all the other objects
  const entryList = Object.values(entries);
  const properties = Object.keys(entryList[0]);
  return properties.filter((prop) => {
    return entryList.every((entry) =>
      Object.keys(entry).some((key) => key === prop)
    );
  }, [])[0];
}

function nameEntries(entries: Entry[] | NamedEntries) {
  return isNamedEntries(entries)
    ? entries
    : entries.reduce<NamedEntries>(
        (acc, entry, index) => ({ ...acc, [`Type${index}`]: entry }),
        {}
      );
}

export function generate(
  entries: Entry[] | NamedEntries,
  discriminant?: string
) {
  if (!Array.isArray(entries) && !isNamedEntries(entries)) {
    throw new Error("Entries must be an array of JSON payloads or an object");
  }
  const namedEntries = nameEntries(entries);
  const useDiscriminant = discriminant ?? findDiscriminant(namedEntries);
  return generateTypes(namedEntries, useDiscriminant);
}
