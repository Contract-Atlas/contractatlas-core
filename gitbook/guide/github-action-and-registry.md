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

[Registry manifests and recording instructions](https://github.com/Contract-Atlas/contractatlas-core/blob/main/registry/README.md) cover official-source addresses for Blend v2.1, Soroswap and Reflector. Missing declared hashes and audit mappings are left missing. The checked-in attempts recorded network unavailability in this environment; they do not establish current code hashes. Run them again with an accessible mainnet RPC before citing live results. After building, run `node scripts/check-registry.mjs https://YOUR_MAINNET_RPC ./registry-observation`. The output directory must be new; committed historical reports are preserved.

## How this differs from `sdkt verify`

[`sdkt verify`](https://docs.rs/crate/sdkt-wasm/2.5.0/source/README.md) compares a deployed contract's WASM hash with a local artifact. That hash comparison overlaps with ContractAtlas. Use it when your question is whether a particular build is deployed.

ContractAtlas starts from a versioned, multi-contract manifest: expected hashes plus explicit audit artifact references. Its report preserves the declaration, observations, artifact mapping gaps and provenance. An equal local/live hash alone cannot produce `match` when the audit-to-artifact mapping is absent. ContractAtlas does not rebuild source or prove that an audit reviewed the artifact it names. The tools can be used together; this is a difference in evidence and workflow, not a claim that DevKit lacks other features.

