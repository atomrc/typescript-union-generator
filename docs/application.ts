import { generateUnion } from "../src/index";
import { format } from "prettier";
import tsParser from "prettier/parser-typescript";
import jsonic from "jsonic";

type State = { data: string; extractCommon: boolean; discriminant: string };
const state: State = {
  data: `{
  First: { type: "a", value: "first" },
  Second: { type: "b", value: "second" },
  Third: { type: "c", value: "third" },
}`,
  discriminant: "type",
  extractCommon: true,
};

const input = document.getElementById("payloads") as HTMLTextAreaElement;
const extractCommon = document.getElementById("extract") as HTMLInputElement;
const discriminant = document.getElementById(
  "discriminant"
) as HTMLInputElement;
const result = document.getElementById("result") as HTMLDivElement;

const debounce = (fn: (...args: any) => void, time: number) => {
  let timer: number;
  return (...args: any[]) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), time);
  };
};

const render = debounce((state: State) => {
  let payload;
  try {
    payload = jsonic(state.data);
  } catch {
    result.innerText = "Input data is not valid JSON";
  }
  if (state) {
    try {
      result.innerText = format(
        generateUnion(payload, {
          extractCommon: state.extractCommon,
          discriminant: state.discriminant,
        }),
        {
          parser: "typescript",
          plugins: [tsParser],
        }
      );
    } catch (error) {
      result.innerText = error.message;
    }
  }
}, 300);

function updateState(props: string, value: string | boolean) {
  state[props] = value;
  render(state);
}

input?.addEventListener("input", (event) => {
  updateState("data", event.target?.value);
});
discriminant?.addEventListener("input", (event) => {
  updateState("discriminant", event.target?.value || undefined);
});
extractCommon.addEventListener("change", (event) => {
  updateState("extractCommon", !!event.target?.checked);
});

input.value = state.data;
discriminant.value = state.discriminant;
extractCommon.checked = state.extractCommon;
render(state);
