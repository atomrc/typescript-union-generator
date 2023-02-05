import { Entry, NamedEntries } from "./types";

type Entries = Entry[];
export type Input = Entries | NamedEntries;

const isNamedEntries = (obj: unknown): obj is NamedEntries =>
  !!obj &&
  typeof obj === "object" &&
  Object.keys(obj).length > 0 &&
  !Array.isArray(obj);

function toNamedInput(entries: Entries) {
  return entries.reduce<NamedEntries>(
    (acc, entry, index) => ({ ...acc, [`Type${index}`]: entry }),
    {}
  );
}

export function parseInput(input: Input) {
  if (!Array.isArray(input) && !isNamedEntries(input)) {
    throw new Error("Entries must be an array of JSON payloads or an object");
  }
  return isNamedEntries(input) ? input : toNamedInput(input);
}
