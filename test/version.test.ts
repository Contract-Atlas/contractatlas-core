import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { TOOL_VERSION } from "../src/version.ts";

describe("version", () => {
  it("TOOL_VERSION matches package.json", async () => {
    const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as { version: string };
    expect(TOOL_VERSION).toBe(pkg.version);
  });

  it("the newest CHANGELOG release heading matches package.json", async () => {
    const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as { version: string };
    const log = await readFile(new URL("../CHANGELOG.md", import.meta.url), "utf8");
    expect(log).toMatch(new RegExp(`^## ${pkg.version.replaceAll(".", "\\.")}\\b`, "m"));
  });
});
