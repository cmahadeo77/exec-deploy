# Status - exec-deploy

_Last reviewed: 2026-10-20_

CLI that searches and scores payments/fintech executive roles, tailors a master resume to a JD with Claude, and tracks the application pipeline.

## Components

| Component | State | Notes |
|---|---|---|
| search / scorer | Working (v1.0.0) | Adzuna + direct URL, domain-tuned 0-100 scoring |
| tailor | Working (v1.0.0) | Claude-tailored resume output |
| analyze | Working (v1.0.0) | Fit analysis: strengths, gaps, positioning |
| track / dashboard | Working (v1.0.0) | Local JSON pipeline store |
| push / respond | Present | Commands exist; usage not yet documented in README |
| Tests | Missing | No automated tests yet |

## Known gaps

- `push` and `respond` commands are not documented in the README command table.
- No test suite.

## Next up

See **M1 - Hardening** in [ROADMAP.md](ROADMAP.md).
