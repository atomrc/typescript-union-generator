import { Property, Entry, NamedEntries, Type } from "./types";

export type GeneratorOptions = {
  /**
   * Will use this property as the discriminant.
   * If not provided, will fallback to using the first property that is common to all payloads.
   * If not discriminant could be found (or the discriminant given doesn't match any properties) will only generate a non-discriminated union
   */
  discriminant?: string;

  /**
   * Will extract all the properties that are common to all the payload in a single Base type.
   * Only the discriminant will not be put into this Base type
   */
  extractCommon?: boolean;
};

function generateTypes(entries: NamedEntries, extend?: Type): Type[] {
  const types = Object.entries(entries).map(([name, entry]) => {
    entry = Array.isArray(entry) ? entry : [entry];
    return {
      name,
      extend: extend?.name,
      properties: flattenProperties(
        entry,
        extend?.properties.map(({ name }) => name)
      ),
    };
  });

  return types;
}

function flattenProperties(
  entries: Entry[],
  exclude: string[] = []
): Property[] {
  const allProperties = Array.from(
    new Set(
      entries
        .flatMap((entry) => Object.keys(entry))
        .filter((property) => !exclude.includes(property))
    )
  );

  return allProperties.map((property) => ({
    name: property,
    values: entries.map((entry) => entry[property]),
  }));
}

function findCommonProperties(properties: Property[]) {
  return properties.filter((property) => {
    const types = new Set(property.values.map((value) => typeof value));
    return types.size === 1;
  });
}

export function generate(
  payloads: NamedEntries,
  options: GeneratorOptions = {}
): { discriminant?: string; base?: Type; types: Type[] } {
  const entries = Object.values(payloads).flatMap((entry) =>
    Array.isArray(entry) ? entry : [entry]
  );
  const properties = flattenProperties(entries);
  const commonProperties = findCommonProperties(properties);
  const useDiscriminant = options.discriminant ?? commonProperties[0]?.name;

  const filteredBaseProperties = commonProperties.filter(
    ({ name }) => name !== useDiscriminant
  );
  const baseType =
    options.extractCommon && filteredBaseProperties.length > 0
      ? {
          name: "Base",
          properties: filteredBaseProperties,
        }
      : undefined;

  const types = generateTypes(payloads, baseType);
  return {
    discriminant: useDiscriminant,
    base: baseType,
    types: types,
  };
}
