<p align="center"><img src="docs/assets/banner.svg" alt="contractatlas-core" width="100%"></p>

# contractatlas-core

[![CI](https://github.com/Contract-Atlas/contractatlas-core/actions/workflows/ci.yml/badge.svg)](https://github.com/Contract-Atlas/contractatlas-core/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![Release](https://img.shields.io/github/v/release/Contract-Atlas/contractatlas-core)](https://github.com/Contract-Atlas/contractatlas-core/releases) [![npm](https://img.shields.io/npm/v/@anas.abubakar/contractatlas-core)](https://www.npmjs.com/package/@anas.abubakar/contractatlas-core)

[Documentation](https://stellar-developer-tools.gitbook.io/contractatlas-core/) · [App repository](https://github.com/Contract-Atlas/contractatlas-studio) · [Issues](https://github.com/Contract-Atlas/contractatlas-core/issues) · [Discussions](https://github.com/Contract-Atlas/contractatlas-core/discussions)


A protocol's audit should not silently describe yesterday's code.

ContractAtlas compares what is **live on a Soroban network** with what a protocol **declares in a manifest**: the expected WASM hash for each contract and the audit references that list reviewed artifacts. It reports one of four states per contract and renders the same report in a terminal, in CI and (via [contractatlas-studio](https://github.com/Contract-Atlas/contractatlas-studio)) on a public page.

| Status | Meaning |
|---|---|
| `match` | Live WASM hash equals the declared hash, and an audit lists that hash as reviewed |
| `drift` | Live hash differs from the declared hash, or matches it but no audit lists it |
| `incomplete` | Evidence is not enough to compare: no declared hash, no audit, a source-commit-only audit, or a non-WASM executable |
| `unavailable` | The ledger could not be read, or the instance is not a live entry (archived, expired or undeployed: not distinguishable) |

A failed read is never reported as drift, and a missing artifact mapping is never reported as audited.

## What it does not do

No safety score, no "audited" label, no inference of privileged roles (they are declarations you write), no source rebuild. A match means the deployed hash equals a hash an audit says it reviewed. It does not mean the audit covered dependencies, configuration or roles. See [SPEC.md](https://github.com/Contract-Atlas/contractatlas-core/blob/main/SPEC.md) and [ADR 0001](https://github.com/Contract-Atlas/contractatlas-core/blob/main/docs/adr/0001-incremental-value-over-existing-tools.md) for how this compares with Stellar Lab and others.

## Install and run

Published to npm as `@anas.abubakar/contractatlas-core` (`npm install @anas.abubakar/contractatlas-core`). To work from source: From a clone (Node 22 or newer, pnpm):

```bash
git clone https://github.com/Contract-Atlas/contractatlas-core.git
cd contractatlas-core
pnpm install --frozen-lockfile
pnpm build
node dist/cli.js check fixtures/testnet/manifest.json --rpc https://soroban-testnet.stellar.org
```

```bash
node dist/cli.js validate manifest.json            # offline schema check
node dist/cli.js check manifest.json --rpc <url> --format markdown >> "$GITHUB_STEP_SUMMARY"
node dist/cli.js check manifest.json --rpc <url> --out report.json --strict
```

Exit codes: `0` ok, `1` a failing status found (`--fail-on` defaults to `drift,unavailable`; `--strict` adds `incomplete`), `2` invalid manifest or usage, `3` unexpected error.

## GitHub Action

The action builds the checked-out action source, checks your manifest against live RPC, and fails the job on `drift`, `incomplete` or `unavailable`. Reports and SVG badges are preserved as workflow artifacts even when the check fails. No wallet or signing key is needed.

```yaml
name: Deployment check
on: [push, workflow_dispatch]
permissions:
  contents: read
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Contract-Atlas/contractatlas-core@main # Pin a reviewed commit in your workflow.
        with:
          manifest: manifests/mainnet.json
          rpc: ${{ secrets.STELLAR_RPC_URL }}
```

The action defaults to strict evidence requirements. Set `strict: 'false'` only if your policy permits `incomplete`; drift and unavailable reads still fail. Outputs are `report`, `badge`, `overall` and `exit-code`. The badge describes one recorded observation, not a continuing guarantee. Publish the SVG yourself if you want to embed it on a site; the action does not push files or publish pages. The CLI also supports `--badge-out badge.svg`.

## Public registry

[Registry manifests and recording instructions](registry/README.md) cover official-source addresses for Blend v2.1, Soroswap and Reflector. Missing declared hashes and audit mappings are left missing. The checked-in attempts recorded network unavailability in this environment; they do not establish current code hashes. Run them again with an accessible mainnet RPC before citing live results. After building, run `node scripts/check-registry.mjs https://YOUR_MAINNET_RPC ./registry-observation`. The output directory must be new; committed historical reports are preserved.

## How this differs from `sdkt verify`

[`sdkt verify`](https://docs.rs/crate/sdkt-wasm/2.5.0/source/README.md) compares a deployed contract's WASM hash with a local artifact. That hash comparison overlaps with ContractAtlas. Use it when your question is whether a particular build is deployed.

ContractAtlas starts from a versioned, multi-contract manifest: expected hashes plus explicit audit artifact references. Its report preserves the declaration, observations, artifact mapping gaps and provenance. An equal local/live hash alone cannot produce `match` when the audit-to-artifact mapping is absent. ContractAtlas does not rebuild source or prove that an audit reviewed the artifact it names. The tools can be used together; this is a difference in evidence and workflow, not a claim that DevKit lacks other features.

## Manifest

```json
{
  "schemaVersion": "1",
  "protocol": { "name": "My protocol" },
  "network": { "name": "testnet", "passphrase": "Test SDF Network ; September 2015" },
  "contracts": [{
    "id": "C...",
    "name": "Vault",
    "declaredWasmHash": "<64 hex>",
    "audits": [{
      "id": "audit-2026-01", "auditor": "...", "report": "https://...", "date": "2026-01-15",
      "reviewedWasmHashes": ["<64 hex>"],
      "limitations": ["Did not cover the oracle adapter."]
    }],
    "privileges": [{ "role": "upgrade authority", "holder": "G..." }]
  }]
}
```

JSON Schemas: `schema/manifest.v1.schema.json` and `schema/report.v1.schema.json` (generated from the runtime schemas; CI fails when stale).

## Demo: a real testnet upgrade

`fixtures/testnet` holds a manifest for two contracts deployed on testnet from [`fixtures/upgradeable-fixture`](https://github.com/Contract-Atlas/contractatlas-core/blob/main/fixtures/upgradeable-fixture/README.md) and two recorded reports from real runs:

1. [`01-before-upgrade`](https://github.com/Contract-Atlas/contractatlas-core/blob/main/fixtures/testnet/reports/01-before-upgrade.txt): fixture A is `match`; fixture B, whose review names a source commit only, is `incomplete`.
2. After a real on-chain `upgrade` transaction, [`02-after-upgrade`](https://github.com/Contract-Atlas/contractatlas-core/blob/main/fixtures/testnet/reports/02-after-upgrade.txt): fixture A is `drift` and the CLI exits 1. The audit link is retained but no longer covers the live code.

Contract IDs, hashes and transactions: [DEPLOYMENT.md](https://github.com/Contract-Atlas/contractatlas-core/blob/main/fixtures/testnet/DEPLOYMENT.md). The "audits" in the fixture are fictional labels, not professional audits. The contracts are permanently in the post-upgrade state, so a fresh run reproduces report 02.

## Supported versions

| Component | Version |
|---|---|
| Node.js | 22 or newer (developed on 24.19) |
| `@stellar/stellar-sdk` | 17.2.1 (exact pin) |
| Networks | Testnet exercised live. Mainnet and futurenet are accepted by the schema with their well-known passphrases and use the same code path, but are not exercised in CI. |
| Fixture contract | `soroban-sdk` 28.0.0, `stellar-cli` 28.1.0, rustc 1.96.0 |

## Testing

```bash
pnpm test            # deterministic: unit, fake-RPC wire tests with real XDR, CLI end to end
pnpm test:live       # opt-in: hits testnet and asserts the fixture is in its post-upgrade state
```

Status: v0.1, engineering complete for the declared scope. No maintainer has reviewed a real manifest yet; that adoption check is tracked separately from the code.

## Repository layout

- `docs/`: decision records (ADRs), evidence and assets
- `fixtures/`: recorded and fixture data used by the tests
- `gitbook/`: source of the GitBook documentation
- `schema/`: JSON Schemas, generated and checked in CI
- `scripts/`: build, generation and recording scripts
- `src/`: source
- `test/`: tests

## Documentation

The full documentation is at https://stellar-developer-tools.gitbook.io/contractatlas-core/. It is built from the `gitbook/` folder of this repository and synced from `main`, so a fix to a page is a pull request here.

## Contributing

Open issues are scoped so one person can finish one in a single cycle, and each lists acceptance criteria. Read [CONTRIBUTING.md](CONTRIBUTING.md), pick an issue from the [issue list](https://github.com/Contract-Atlas/contractatlas-core/issues), and say you are taking it before you start. Security reports go through [SECURITY.md](SECURITY.md), not public issues.

## Maintainers

| Maintainer | Role | GitHub |
|---|---|---|
| Anas Abubakar | Lead maintainer | [@Anasabubakar](https://github.com/Anasabubakar) |
| Abdulbasit Fazazi | Co-maintainer | [@fazaziishola-coder](https://github.com/fazaziishola-coder) |

## Community

Questions and design discussion go in [GitHub Discussions](https://github.com/Contract-Atlas/contractatlas-core/discussions). Bugs and scoped work go in [Issues](https://github.com/Contract-Atlas/contractatlas-core/issues).

## License

MIT. See [LICENSE](https://github.com/Contract-Atlas/contractatlas-core/blob/main/LICENSE). Contributing: [CONTRIBUTING.md](https://github.com/Contract-Atlas/contractatlas-core/blob/main/CONTRIBUTING.md). Security: [SECURITY.md](https://github.com/Contract-Atlas/contractatlas-core/blob/main/SECURITY.md).

## Contributors

Thanks to all the contributors who have made this project possible.

<a href="https://github.com/Contract-Atlas/contractatlas-core/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Contract-Atlas/contractatlas-core" alt="Contributors to contractatlas-core" />
</a>
