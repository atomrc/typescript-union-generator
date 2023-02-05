import { TypeEntry, Type, Entry, NamedEntries, Types } from "./types";

export type GeneratorOptions = {
  discriminant?: string;
  extactCommons?: boolean;
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

function findCommonProperties(
  payloads: NamedEntries
): { type: string; name: string }[] {
  // we just need to check the properties of the first object against all the other objects
  const entries = Object.values(payloads);
  const properties = Object.keys(entries[0]);
  return (
    properties
      .map((property) => ({
        name: property,
        values: entries
          .map((entry) => entry[property])
          .filter((value) => value !== undefined),
      }))
      // We filter all the properties that have the same number of values than the number of entries
      .filter((prop) => prop.values.length === entries.length)
      .map((prop) => ({ name: prop.name, type: typeof prop.values[0] }))
  );
}

function generateTypes(entries: NamedEntries, discriminant?: string): Types {
  return Object.entries(entries).reduce<Types>(
    (acc, [name, type]) => ({ ...acc, [name]: toType(type, discriminant) }),
    {}
  );
}

export function generate(
  entries: NamedEntries,
  options: GeneratorOptions = {}
) {
  const commonProperties = findCommonProperties(entries);
  const useDiscriminant = options.discriminant ?? commonProperties[0].name;
  return generateTypes(entries, useDiscriminant);
}
