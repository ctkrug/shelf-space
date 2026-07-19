import { describe, expect, it } from "vitest";
import { readTextFile, validateTextFile } from "../src/core/file-input.js";

function file(overrides = {}) {
  return { name: "notes.txt", type: "text/plain", size: 4, text: async () => "read", ...overrides };
}

describe("validateTextFile", () => {
  it("accepts .txt files even when the browser omits the MIME type", () => {
    expect(validateTextFile(file({ type: "" }))).toEqual({ ok: true });
  });

  it("rejects missing, non-text, and empty files with usable errors", () => {
    expect(validateTextFile()).toMatchObject({ ok: false });
    expect(validateTextFile(file({ name: "cover.png", type: "image/png" }))).toMatchObject({ ok: false });
    expect(validateTextFile(file({ size: 0 }))).toMatchObject({ ok: false, error: "That text file is empty." });
  });
});

describe("readTextFile", () => {
  it("returns file text for valid files", async () => {
    await expect(readTextFile(file())).resolves.toEqual({ ok: true, text: "read" });
  });

  it("converts a File.text failure into a designed error", async () => {
    await expect(readTextFile(file({ text: async () => { throw new Error("disk"); } }))).resolves.toMatchObject({ ok: false });
  });
});
