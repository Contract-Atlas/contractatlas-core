import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { StrKey } from "@stellar/stellar-sdk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runCi } from "../src/ci.ts";
import { KNOWN_NETWORKS } from "../src/manifest.ts";
import { RpcLedgerSource } from "../src/ledger.ts";

const id = StrKey.encodeContract(Buffer.alloc(32, 3));
const hash = "1".repeat(64);
const audit = { id: "fixture", auditor: "Fixture only", report: "https://example.com/fixture", date: "2026-01-01", reviewedWasmHashes: [hash] };
beforeEach(() => {
  vi.spyOn(RpcLedgerSource.prototype, "getNetworkPassphrase").mockResolvedValue(KNOWN_NETWORKS.testnet);
  vi.spyOn(RpcLedgerSource.prototype, "getLatestLedger").mockResolvedValue(555);
  vi.spyOn(RpcLedgerSource.prototype, "getExecutable").mockResolvedValue({ kind: "wasm", wasmHash: hash });
});
afterEach(() => vi.restoreAllMocks());
const io = { stdout: () => {}, stderr: () => {} };

async function fixture(contract: unknown, passphrase: string = KNOWN_NETWORKS.testnet) {
  const directory = await mkdtemp(join(tmpdir(), "ca-ci-"));
  const manifest = join(directory, "manifest.json");
  await writeFile(manifest, JSON.stringify({ schemaVersion: "1", protocol: { name: "Fixture" }, network: { name: passphrase === KNOWN_NETWORKS.testnet ? "testnet" : "mainnet", passphrase }, contracts: [contract] }));
  return { manifest, directory, outputFile: join(directory, "outputs"), summaryFile: join(directory, "summary"), rpc: "https://rpc.example.com" };
}

describe("GitHub Action checker", () => {
  it("passes a match and emits a report, badge, outputs and summary", async () => {
    const options = await fixture({ id, name: "Vault", declaredWasmHash: hash, audits: [audit] });
    expect(await runCi(options, io)).toBe(0);
    expect(JSON.parse(await readFile(join(options.directory, "report.json"), "utf8")).overall).toBe("match");
    expect(await readFile(join(options.directory, "badge.svg"), "utf8")).toContain("ContractAtlas: match (recorded observation)");
    expect(await readFile(options.outputFile, "utf8")).toContain("overall=match\nexit-code=0\n");
    expect(await readFile(options.summaryFile, "utf8")).toContain("Match: 1; drift: 0");
  });

  it("fails drift and retains the failed evidence", async () => {
    const options = await fixture({ id, name: "Vault", declaredWasmHash: "2".repeat(64), audits: [audit] });
    expect(await runCi(options, io)).toBe(1);
    expect(JSON.parse(await readFile(join(options.directory, "report.json"), "utf8")).overall).toBe("drift");
    expect(await readFile(join(options.directory, "badge.svg"), "utf8")).toContain("ContractAtlas: drift");
    expect(await readFile(options.outputFile, "utf8")).toContain("exit-code=1\n");
  });

  it("fails incomplete by default, with an explicit non-strict opt-out", async () => {
    const options = await fixture({ id, name: "Vault", declaredWasmHash: hash });
    expect(await runCi(options, io)).toBe(1);
    expect(JSON.parse(await readFile(join(options.directory, "report.json"), "utf8")).overall).toBe("incomplete");
    expect(await runCi({ ...options, strict: false }, io)).toBe(0);
  });

  it("fails unavailable without claiming drift or a match", async () => {
    const options = await fixture({ id, name: "Vault", declaredWasmHash: hash, audits: [audit] }, KNOWN_NETWORKS.mainnet);
    expect(await runCi(options, io)).toBe(1);
    const report = JSON.parse(await readFile(join(options.directory, "report.json"), "utf8"));
    expect(report.overall).toBe("unavailable");
    expect(report.summary).toEqual({ match: 0, drift: 0, incomplete: 0, unavailable: 1 });
  });

  it("does not put credential-bearing RPC URLs in failed network reports", async () => {
    vi.mocked(RpcLedgerSource.prototype.getNetworkPassphrase).mockRejectedValue(new Error("failed https://rpc.example.com/private-api-key"));
    const options = await fixture({ id, name: "Vault", declaredWasmHash: hash });
    expect(await runCi(options, io)).toBe(1);
    const report = await readFile(join(options.directory, "report.json"), "utf8");
    expect(report).not.toContain("private-api-key");
    expect(report).toContain("<url>");
  });

  it("invalid input fails without publishing old outputs", async () => {
    const options = await fixture({ id, name: "Vault" });
    await writeFile(options.manifest, "{}");
    expect(await runCi(options, io)).toBe(2);
    await expect(readFile(options.outputFile, "utf8")).rejects.toThrow();
  });
});
