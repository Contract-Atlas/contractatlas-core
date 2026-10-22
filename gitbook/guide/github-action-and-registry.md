## Use in CI

The root `action.yml` is a composite action. It installs a pinned version of the published package `@anas.abubakar/contractatlas-core` from npm, runs `check <manifest> --rpc <rpc-url>`, prints the Markdown report and appends it to `$GITHUB_STEP_SUMMARY`. The job exits with the CLI's exit code (`0`, `1`, `2` or `3`, as documented above). No wallet or signing key is needed.

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
      - uses: Contract-Atlas/contractatlas-core@main # pin a reviewed commit in your workflow
        with:
          manifest: manifests/mainnet.json
          rpc-url: ${{ secrets.STELLAR_RPC_URL }}
          version: 0.1.1
          # strict: 'true'            # also fail on incomplete evidence
          # fail-on: drift,unavailable  # default; ignored when strict is true
```

Inputs: `manifest`, `rpc-url`, `strict` (default `false`), `fail-on` (default `drift,unavailable`), `version` (exact version, default `0.1.1`). Outputs: `report` (path of the JSON report) and `exit-code`. A manifest that is `incomplete` passes unless you set `strict: 'true'` or add `incomplete` to `fail-on`.

**Status badge.** The action does not host or publish a badge. Two options that need no service of ours: a static shields.io badge you write yourself, for example `https://img.shields.io/badge/contractatlas-incomplete-yellow`, which is a label you update by hand and says nothing about the current chain; or the standard workflow status badge (`https://github.com/<owner>/<repo>/actions/workflows/<file>.yml/badge.svg`), which shows whether the last run of your own workflow passed under the policy you configured. Either describes one observation or one policy, not a continuing guarantee. The CLI can also write an SVG for a single run with `--badge-out badge.svg` in releases that include that flag.

## Public registry

[`registry/`](https://github.com/Contract-Atlas/contractatlas-core/blob/main/registry/README.md) holds manifests for Blend v2.1, Soroswap and Reflector, transcribed from each project's official page (sources cited per entry), and Markdown/JSON/SVG reports recorded on 2026-10-22 against a keyless public mainnet RPC. All eight contracts were reported `incomplete`: no audit-to-hash mapping is declared, and for Blend and Reflector no expected hash is declared either. These are not endorsements or audits. Reproduce with `node scripts/check-registry.mjs https://YOUR_MAINNET_RPC ./registry-observation` after building; the output directory must be new.

## How this differs from comparing a hash to a local build

Comparing the on-chain hash to a local build answers "is this build what is deployed?". [soroban-devkit](https://github.com/SaboLabs/soroban-devkit)'s `sdkt verify --contract <ID> [--wasm <file>] [--network <net>]` does that: its README describes it as an offline hash versus on-chain hash check for a deployed contract against a local WASM file, among a wider toolkit (inspect, diff, audit, deploy and more). That is a useful check, and it overlaps with the live-hash read here.

ContractAtlas answers a different question: does the code on chain match what an audit reviewed, per contract? It starts from a versioned manifest covering many contracts, with declared hashes and explicit audit references, and reports one of four states. `drift` means the live hash differs from the declaration (or from every audited hash). `unavailable` means the ledger could not be read or the entry is not live; it is never folded into drift. `incomplete` means the evidence is not enough, for example no audit names an artifact hash. An equal local and live hash cannot produce `match` here without an audit mapping. ContractAtlas does not rebuild source or prove that an audit reviewed what it names. The two tools can be used together. This comparison is based on the soroban-devkit README as read on 2026-10-22; check its current documentation.
