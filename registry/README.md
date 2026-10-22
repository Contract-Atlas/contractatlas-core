# Public deployment registry

These are third-party transcriptions of official sources, retrieved 22 October 2026. Protocol maintainers have not reviewed these manifests. This is a small example registry, not a ranking or endorsement.

| Manifest | Contracts | Official source | Evidence declared |
|---|---|---|---|
| [Blend v2.1](manifests/blend-v2-1.json) | Emitter, backstop, pool factory | [Blend deployments](https://docs.blend.capital/mainnet-deployments) | Addresses only |
| [Soroswap](manifests/soroswap.json) | Factory, router | [Soroswap repository](https://github.com/soroswap/core/blob/main/public/mainnet.contracts.json) | Addresses and published WASM hashes |
| [Reflector](manifests/reflector.json) | Stellar DEX, external markets, fiat oracles | [Stellar oracle providers](https://developers.stellar.org/docs/data/oracles/oracle-providers) | Addresses only |

No audit-to-WASM mapping was established from these deployment sources. Audit arrays are empty on purpose. A successful read can still be `incomplete`; a published hash is not an audit reference. Do not copy a live hash into the declared field just to obtain a match.

## Recorded attempts

Reports under `reports/` are outputs from the checker, including failed reads. The recording environment on 22 October 2026 had restricted network access. These attempts do **not** establish live deployed hashes. `unavailable` describes that observation; it does not imply a protocol defect or code drift. Source pages were readable through web retrieval, separately from the RPC client.

## Reproduce

Build the current checkout, then provide a mainnet RPC endpoint you can access:

```bash
pnpm install --frozen-lockfile
pnpm run build
node scripts/check-registry.mjs https://YOUR_MAINNET_RPC ./registry-observation
```

The script checks network identity and writes JSON reports and SVG status badges into a new directory (`registry-observation` by default). It refuses to use an existing directory and never overwrites the committed `reports/` attempts. Choose a new output directory for every run. It exits 1 for drift, incomplete evidence or unavailable reads, 2 for usage/output-directory errors, and 3 for checker execution failures. The workflow uploads only its fresh run directory; failed builds or invalid inputs cannot upload the committed historical reports as current evidence. It never signs or submits transactions. A source page may move or change; inspect `index.json`, confirm the addresses with the linked official sources, and review changes to declared hashes before recording again.
