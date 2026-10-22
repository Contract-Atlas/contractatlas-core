import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { parseManifest } from "../src/manifest.ts";
import { manifestSha256 } from "../src/check.ts";
import { parseReport } from "../src/reportSchema.ts";

const root = new URL("../registry/", import.meta.url);
const index = JSON.parse(await readFile(new URL("index.json", root), "utf8")) as { entries: Array<{ slug: string; manifest: string; sources: string[]; report: string }> };

describe("public registry provenance", () => {
  for (const entry of index.entries) {
    it(`${entry.slug}: validates official-source entries and binds recorded report to the manifest`, async () => {
      expect(entry.sources.every((s) => s.startsWith("https://"))).toBe(true);
      const parsed = parseManifest(JSON.parse(await readFile(new URL(entry.manifest, root), "utf8")));
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) throw new Error(JSON.stringify(parsed.issues));
      expect(parsed.manifest.network.name).toBe("mainnet");
      // No invented audit mapping may turn these transcribed declarations into a match.
      expect(parsed.manifest.contracts.every((c) => c.audits.length === 0)).toBe(true);
      const report = parseReport(JSON.parse(await readFile(new URL(entry.report, root), "utf8")));
      expect(report.ok).toBe(true);
      if (!report.ok) throw new Error(report.error);
      expect(report.report.manifest.sha256).toBe(manifestSha256(parsed.manifest));
      expect(report.report.contracts.map((c) => c.id)).toEqual(parsed.manifest.contracts.map((c) => c.id));
      expect(report.report.overall).not.toBe("match");
    });
  }
});
