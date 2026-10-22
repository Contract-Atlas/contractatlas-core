# Changelog

## 0.2.0
- Composite GitHub Action (`action.yml`) that installs a pinned published version of the package, runs `check`, appends the Markdown report to the job summary and exits with the CLI's exit code. Inputs: `manifest`, `rpc-url`, `strict`, `fail-on`, `version`.
- CLI `--badge-out` writes an SVG for one observation.
- Registry of official-source manifests for Blend v2.1, Soroswap and Reflector, with Markdown, JSON and SVG reports recorded on 2026-10-22 against a public mainnet RPC (all `incomplete`).
- README: "Use in CI", badge guidance, and how this differs from comparing a hash to a local build (`sdkt verify`).
- Redact credential-bearing URLs from failed network-identity reads.
- Test that `TOOL_VERSION`, `package.json` and the changelog agree.

## 0.1.1
- Package metadata (repository, homepage, bugs) and absolute documentation links for the registry page. No runtime changes since 0.1.0; published under the owner's npm scope `@anas.abubakar`.

## 0.1.0 (unreleased)
- Manifest v1 and report v1 schemas (generated JSON Schema).
- Checker: network identity check, per-contract classification, provenance and fixed limitation statements.
- Stellar RPC ledger source (SDK 17.2.1) with timeouts and URL-safe error details.
- CLI: `validate`, `check`, `--fail-on`, `--strict`, text / JSON / Markdown output.
- Testnet upgradeable fixture with recorded before/after-upgrade reports.
