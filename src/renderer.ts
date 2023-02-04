import { Type } from "./types";

function createTypeScriptDef(type: Type): string {
    const properties = Object.entries(type)
        .map(([key, value]) => {
            const type = typeof value.$$type === "object"
                ? `{${createTypeScriptDef(value.$$type)}}`
                : value.$$type;

            return `${key}: ${type}`;
        })
        .join(";");
    return properties;
}
export function renderTypeScript(types: Type[]) {
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

    return rawTypescript;
}
