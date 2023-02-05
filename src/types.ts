export type TypeEntry = { $$type: string | number | Type };
export type Type = Record<string, TypeEntry>;
export type Types = Record<string, Type>;

export type Entry = { [key: string]: unknown };
export type NamedEntries = Record<string, Entry>;
