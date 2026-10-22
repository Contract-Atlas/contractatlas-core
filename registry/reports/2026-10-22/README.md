# Recorded observations, 2026-10-22

Each manifest in `../../manifests/` was checked against the public mainnet RPC `https://mainnet.sorobanrpc.com` (no key) with contractatlas-core 0.1.1 built from this repository:

```bash
node dist/cli.js check registry/manifests/<slug>.json --rpc https://mainnet.sorobanrpc.com --strict \
  --format markdown --out registry/reports/2026-10-22/<slug>.json --badge-out registry/reports/2026-10-22/<slug>.svg \
  > registry/reports/2026-10-22/<slug>.md
```

Slugs: `blend-v2-1`, `soroswap`, `reflector`. Every run exited 1 under `--strict` because every contract is `incomplete` (see `../../README.md`). The observation times and ledger numbers are inside each report. These are point-in-time observations, not audits or endorsements.
