import { TypeEntry, Entry, Type, Types, NamedEntries } from "./types";

export type GeneratorOptions = {
  discriminant?: string;
};

function toType(entry: Entry, discriminant?: string): Type {
  return Object.entries(entry).reduce<Type>((types, [key, value]) => {
    let type: TypeEntry;
    if (typeof value === "object" && value) {
      type = { $$type: toType(value as Entry) };
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

export function generate(
  entries: NamedEntries,
  options: GeneratorOptions = {}
) {
  const useDiscriminant = options.discriminant ?? findDiscriminant(entries);
  return generateTypes(entries, useDiscriminant);
}
