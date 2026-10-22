# Public deployment registry

These are third-party transcriptions of official sources, retrieved 22 October 2026. Protocol maintainers have not reviewed these manifests. This is a small example registry, not a ranking or endorsement.

| Manifest | Contracts | Official source | Evidence declared |
|---|---|---|---|
| [Blend v2.1](manifests/blend-v2-1.json) | Emitter, backstop, pool factory | [Blend deployments](https://docs.blend.capital/mainnet-deployments) | Addresses only |
| [Soroswap](manifests/soroswap.json) | Factory, router | [Soroswap repository](https://github.com/soroswap/core/blob/main/public/mainnet.contracts.json) | Addresses and published WASM hashes |
| [Reflector](manifests/reflector.json) | Stellar DEX, external markets, fiat oracles | [Stellar oracle providers](https://developers.stellar.org/docs/data/oracles/oracle-providers) | Addresses only |

No audit-to-WASM mapping was established from these deployment sources. Audit arrays are empty on purpose. A successful read can still be `incomplete`; a published hash is not an audit reference. Do not copy a live hash into the declared field just to obtain a match.

## Recorded observations

[`reports/2026-10-22/`](reports/2026-10-22/) holds Markdown, JSON and SVG outputs from running the checker on 22 October 2026 against the keyless public mainnet RPC `https://mainnet.sorobanrpc.com` (command in that folder's README). Statuses returned:

| Manifest | Contract | Live WASM hash (truncated) | Status | Finding |
|---|---|---|---|---|
| Blend v2.1 | Emitter | 438a5528cff1... | `incomplete` | `no_declared_artifact` |
| Blend v2.1 | Backstop v2.1 | c1f4502a757e... | `incomplete` | `no_declared_artifact` |
| Blend v2.1 | Pool factory v2.1 | 313280505488... | `incomplete` | `no_declared_artifact` |
| Soroswap | Factory | 5db738b05d91... | `incomplete` | `no_audit_reference` |
| Soroswap | Router | 4c3db3ebd2d6... | `incomplete` | `no_audit_reference` |
| Reflector | Stellar DEX oracle | 25fc306065cb... | `incomplete` | `no_declared_artifact` |
| Reflector | External CEX and DEX oracle | 25fc306065cb... | `incomplete` | `no_declared_artifact` |
| Reflector | Fiat oracle | 25fc306065cb... | `incomplete` | `no_declared_artifact` |

For Soroswap, the live hashes equal the hashes in the project's published `mainnet.contracts.json`, but no audit artifact mapping was declared, so the tool does not report `match`. Nothing here is an audit, an endorsement, or a statement about protocol safety. The Stellar Asset Contract for native XLM was not included: it is a built-in non-WASM executable, which the tool reports as `incomplete` by design. Contract names were transcribed from the linked pages; confirm them there.

## Reproduce

Build the current checkout, then provide a mainnet RPC endpoint you can access:

```bash
pnpm install --frozen-lockfile
pnpm run build
node scripts/check-registry.mjs https://YOUR_MAINNET_RPC ./registry-observation
```

The script checks network identity and writes JSON reports and SVG status badges into a new directory (`registry-observation` by default). It refuses to use an existing directory and never overwrites the committed `reports/` attempts. Choose a new output directory for every run. It exits 1 for drift, incomplete evidence or unavailable reads, 2 for usage/output-directory errors, and 3 for checker execution failures. The workflow uploads only its fresh run directory; failed builds or invalid inputs cannot upload the committed historical reports as current evidence. It never signs or submits transactions. A source page may move or change; inspect `index.json`, confirm the addresses with the linked official sources, and review changes to declared hashes before recording again.
