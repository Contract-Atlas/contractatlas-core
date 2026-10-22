# Changelog

## Unreleased
- Reusable deployment-check GitHub Action with strict defaults and retained JSON/SVG artifacts.
- CLI `--badge-out` and CI report/output support.
- Official-source registry manifests for Blend v2.1, Soroswap and Reflector, with honest unavailable recording attempts.
- Explain the evidence/workflow overlap and distinction with `sdkt verify`.
- Redact credential-bearing URLs from failed network-identity reads.

## 0.1.1
- Package metadata (repository, homepage, bugs) and absolute documentation links for the registry page. No runtime changes since 0.1.0; published under the owner's npm scope `@anas.abubakar`.

## 0.1.0 (unreleased)
- Manifest v1 and report v1 schemas (generated JSON Schema).
- Checker: network identity check, per-contract classification, provenance and fixed limitation statements.
- Stellar RPC ledger source (SDK 17.2.1) with timeouts and URL-safe error details.
- CLI: `validate`, `check`, `--fail-on`, `--strict`, text / JSON / Markdown output.
- Testnet upgradeable fixture with recorded before/after-upgrade reports.
