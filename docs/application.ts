import { generateUnion } from "../src/index";
import { format } from "prettier";
import tsParser from "prettier/parser-typescript";
import jsonic from "jsonic";

const input = document.getElementById("payloads") as HTMLTextAreaElement;
const result = document.getElementById("result") as HTMLDivElement;

const debounce = (fn: (...args: any) => void, time: number) => {
  let timer: number;
  return (...args: any[]) => {
    window.clearTimeout(time);
    timer = window.setTimeout(() => fn(...args), time);
  };
};

input?.addEventListener(
  "input",
  debounce((event) => {
    let data: any;
    try {
      data = jsonic(event.target?.value);
    } catch {
      result.innerText = "Input data is not valid JSON";
    }
    if (data) {
      try {
        result.innerText = format(generateUnion(data), {
          parser: "typescript",
          plugins: [tsParser],
        });
      } catch (error) {
        result.innerText = error.message;
      }
    }
  }, 300)
);
