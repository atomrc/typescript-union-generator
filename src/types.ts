export type Property = { name: string; values: unknown[] };
export type Type = { name: string; extend?: string; properties: Property[] };

export type Entry = { [key: string]: unknown };
export type NamedEntries = Record<string, Entry | Entry[]>;
