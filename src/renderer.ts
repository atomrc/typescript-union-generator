import { TypeDef, Types } from "./types";

function createTypeScriptDef(type: TypeDef): string {
  const properties = Object.entries(type)
    .map(([key, value]) => {
      const type =
        typeof value.$$type === "object"
          ? `{${createTypeScriptDef(value.$$type)}}`
          : value.$$type;

      return `${key}: ${type}`;
    })
    .join(";");
  return properties;
}
export function renderTypeScript({
  base,
  types,
}: {
  base?: TypeDef;
  types: Types;
}) {
  const typeDefs = Object.entries(types).map(([name, type]) => ({
    name,
    extend: base ? "Base" : undefined,
    props: createTypeScriptDef(type.def),
  }));

  const baseType = base
    ? [
        {
          name: "Base",
          extend: undefined,
          props: createTypeScriptDef(base),
        },
      ]
    : [];

  const rawTypescript = `
    ${[...baseType, ...typeDefs]
      .map(
        ({ name, extend, props }) =>
          `type ${name} = ${extend ? `${extend} & ` : ""}{ ${props} }`
      )
      .join(";")}
    type Union = ${typeDefs.map(({ name }) => `${name}`).join("|")}
  `;

  return rawTypescript;
}
