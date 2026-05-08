# exec-deploy

> AI-powered resume optimizer and opportunity distribution for payments & fintech executives — contract and FTE.

Built by [Chris Mahadeo](https://cmahadeo77.github.io) | Danville, CA

---

## What it does

1. **Searches** job boards (Adzuna + direct URLs) for roles matching a payments/fintech executive profile
2. **Scores** each role 0–100 using a domain-tuned signal engine (not generic keyword match)
3. **Tailors** your master resume to a specific JD using Claude — outputs a ready-to-send `.docx`
4. **Tracks** your application pipeline in a local JSON store
5. **Analyzes** fit for any role with honest strengths/gaps and positioning language

---

## Quick start

```bash
git clone https://github.com/cmahadeo77/exec-deploy.git
cd exec-deploy
./run.sh setup        # set API keys
npm install
./run.sh search       # find and score live roles
./run.sh tailor --url https://linkedin.com/jobs/view/... --company Meta
./run.sh analyze --url https://linkedin.com/jobs/view/...
./run.sh track        # view pipeline
```

---

## Commands

| Command | What it does |
|---|---|
| `search` | Scan job boards, score results, save Tier A/B to tracker |
| `search --url <url>` | Score a specific job posting |
| `tailor --url <url>` | Tailor master resume to JD → `.docx` |
| `analyze --url <url>` | Fit analysis with strengths, gaps, positioning |
| `track` | View full application pipeline |

---

## Scoring algorithm

Roles are scored against a weighted signal set tuned to this profile:

- **Tier 1 signals** (high weight): `visa`, `mastercard`, `dual-network`, `tokenization`, `stablecoin`, `deal structure`, `partnership structure`, `embedded finance`, `issuer`, `processor`
- **Tier 2 signals**: `payments`, `fintech`, `GTM`, `business case`, `KPI`, `cross-functional`
- **Location signals**: `remote`, `Bay Area`, `San Francisco`, `hybrid`

Scores normalize to 0–100. Tier A ≥ 65, Tier B ≥ 40, Tier C below.

---

## Architecture

```
exec-deploy/
├── run.sh                  # Entry point
├── index.js                # CLI (Commander.js)
├── commands/
│   ├── search.js           # Discovery + scoring
│   ├── tailor.js           # Resume optimization → .docx
│   ├── analyze.js          # Fit analysis
│   └── track.js            # Pipeline tracker
├── lib/
│   ├── resume.js           # Master resume (structured)
│   ├── scorer.js           # Deterministic scoring engine
│   ├── sourcer.js          # Adzuna + URL scraper
│   ├── claude.js           # Anthropic API integration
│   └── tracker.js          # JSON application store
└── logs/
    └── applications.json   # Pipeline state
```

**Stack:** Node.js 18+, Commander.js, Anthropic SDK, Adzuna API, Cheerio, docx.js

---

## Setup

### API keys needed

| Key | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | [platform.anthropic.com](https://platform.anthropic.com) |
| `ADZUNA_APP_ID` + `ADZUNA_APP_KEY` | [developer.adzuna.com](https://developer.adzuna.com) — free, instant |

Run `./run.sh setup` to configure interactively, or create a `.env` file manually.

---

## Why this exists

Most resume tools are generic. This one is tuned to a specific domain — payments and fintech executive roles — with a scoring algorithm that distinguishes between "payments experience preferred" and roles that specifically need dual Visa/Mastercard network fluency, tokenization delivery depth, and embedded finance GTM.

Generic tools score both the same. This one doesn't.

---

## License

MIT
