import prettier from "prettier";

type Entry = Object;
type TypeEntry = { $$type: string | number | Type };
type Type = Record<string, TypeEntry>;

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

function findCommonProperties(entries: Entry[]) {
  // we just need to check the properties of the first object against all the other objects
  const properties = Object.keys(entries[0]);
  return properties.filter((prop) => {
    return entries.every((entry) =>
      Object.keys(entry).some((key) => key === prop)
    );
  }, []);
}

function createTypeScriptDef(type: Type): string {
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
function toTypeScript(types: Type[]) {
  const typeDefs = types.map((type, index) => ({
    name: `Type${index}`,
    props: createTypeScriptDef(type),
  }));

  const rawTypescript = `
    ${typeDefs
      .map(({ name, props }) => `type ${name} = { ${props} }`)
      .join(";")}
    type Union = ${typeDefs.map(({ name }) => `${name}`).join("|")}
  `;

  return prettier.format(rawTypescript, { parser: "typescript" });
}

export function generateUnion(entities: Entry[]) {
  const [discriminant] = findCommonProperties(entities);
  const types = entities.map((entry) => toType(entry, discriminant));
  return toTypeScript(types);
}
