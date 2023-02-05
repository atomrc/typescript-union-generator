export type TypeEntry = { $$type: string | number | TypeDef };
export type TypeDef = Record<string, TypeEntry>;
export type Types = Record<string, { extends?: string; def: TypeDef }>;

export type Entry = { [key: string]: unknown };
export type NamedEntries = Record<string, Entry>;
