import { Property, Type } from "./types";

function propertiesToType(
  properties: Property[],
  discriminant?: string
): string {
  return properties
    .map((type) => propertyToType(type, type.name === discriminant))
    .join(";");
}

function propertyToType(propety: Property, keepValue?: boolean): string {
  const types = new Set(
    propety.values.map((value) => {
      if (keepValue) {
        return JSON.stringify(value);
      }
      if (Array.isArray(value)) {
        return "any[]";
      }
      if (typeof value === "object" && value) {
        const nestedType = propertiesToType(
          Object.entries(value).map(([name, value]) => ({
            name,
            values: [value],
          }))
        );
        return `{${nestedType}}`;
      }
      return typeof value;
    })
  );

  const isOptional = types.has("undefined");
  types.delete("undefined");
  return `${propety.name}${isOptional ? "?" : ""}: ${Array.from(types).join(
    "|"
  )}`;
}

function createTypeScriptDef(type: Type, discriminant?: string): string {
  const extend = type.extend ? `${type.extend} &` : "";
  const properties = propertiesToType(type.properties, discriminant);

  return `type ${type.name} = ${extend} { ${properties} }`;
}

export function renderTypeScript({
  discriminant,
  base,
  types,
}: {
  discriminant?: string;
  base?: Type;
  types: Type[];
}) {
  const baseType = base ? [createTypeScriptDef(base)] : [];

  const otherTypes = types.map((type) =>
    createTypeScriptDef(type, discriminant)
  );

  const union =
    types.length > 1
      ? `type Union = ${types.map(({ name }) => name).join("|")}`
      : "";

  return [...baseType, ...otherTypes, union].join(";\n");
}
