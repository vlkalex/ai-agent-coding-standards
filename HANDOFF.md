# Handoff — Repo Repositioning & Rename

Working notes from the review/discussion session. Not part of the published package — delete or move before release.

## TL;DR

We're repositioning this repo from "frontend coding standards for AI agents" to a
general **agent-ops quality layer**, and renaming it. Market research is done. Two
decisions are made; one (the final name) is still open.

---

## What this repo is

7 opinionated markdown docs distributed as an npm package (`npx ai-agent-standards init`
copies them into `docs/`). Also a portfolio piece — proof-of-work is alexvlk.com + the
alexvlk-portfolio repo, plus a shipped 3,500-user mobile app.

Files: `react/component-guidelines.md`, `principles/coding-principles.md`,
`review/quality-gate.md`, `agents/claude-md-guide.md`, `agents/agents-md-guide.md`,
`workflow/ticket-structure.md`, `workflow/project-skill-template.md`.

Key realization: it's **not really "mainly frontend."** Only 1 of 7 files
(component-guidelines) is React-specific. The other 6 are framework-agnostic. The general
material is the bigger asset.

## Decisions made

- **Direction A (general "agent-ops"), confirmed.** Treat the React guide as the reference
  *example*, not the product. Don't delete the general material to fit a "frontend" label.
- **Name "steer" — rejected** (was the original favorite). See research below.
- **Anti-slop = positioning/tagline, NOT the name.** Great hook, but the name is taken in-niche.

## Open decision

**Final name.** Current shortlist (✅ = npm-available, checked 2026-05-29):
- ✅ `codewarden` — brandable, evokes the review-gate differentiator. (Claude's lean for a brand)
- ✅ `agent-coding-standards` — honest, keyword-rich, max discoverability. (Claude's lean for SEO)
- ✅ `agent-canon` — "canon" = authoritative standards; short/distinctive
- ✅ `agent-standards-kit`
- Proposed tagline regardless of name: *"Stop AI agents writing slop — opinionated, battle-tested coding standards."*

Also still to decide: keep or rebrand the npm package `ai-agent-standards` (published v1.0.0
under user `vlkalex`; renaming = deprecate old + publish new).

---

## Market research summary

### Is "steer" safe? NO.
- npm `steer` taken (abandoned ~2014 Chrome lib, unrecoverable).
- 3 live AI-agent projects already use it: `imtt-dev/steer` (132★), `Steer-AI`/SteerCode, `enderekici/steer`.
- **AWS Kiro owns "steering"** as its term for exactly this artifact (`.kiro/steering/`, GA Nov 2025).
- "steering vectors / activation steering" = saturated LLM research term → bad SEO.

### Is "antislop" safe? NO.
- npm `antislop` = "a blazing-fast linter for detecting AI-generated code slop" (adjacent competitor).
- `sam-paech/antislop-sampler` = established LLM technique. Same "obvious-name-already-taken" trap.
- Only `anti-slop` (hyphen) / `slopgate` free; both awkward. Plus meme-word tone risk vs. credibility moat.

### Does the concept already exist, battle-tested?
**Saturated (don't compete here):**
- Stack-specific rule snippets: awesome-cursorrules ~40k★, awesome-copilot ~34k★, cursor.directory.
- "npx install rules into repo" mechanism: Ruler ~2.7k★, rulesync ~1.1k★, PRPM, MS APM. Commoditized.
- "How to write CLAUDE.md/AGENTS.md": now has **authoritative first-party guides** (Anthropic best-practices;
  GitHub's 2,500-repo study). AGENTS.md is a **Linux Foundation standard** (donated Dec 2025, 60k+ projects).
  → Our two `*-md-guide.md` files are the WEAKEST part; they compete with free official sources.

**Genuine white space (our edge):**
- The **quality/governance layer**: anti-slop coding principles + an **AI-PR review/quality gate** +
  **agent ticket structure**. Big players (GitHub Spec Kit ~107k★, BMAD ~48k★) handle intent→tasks but
  ship NO review gate, NO ticket templates, NO curated principles.
- Pain is empirically real: GitClear 2025 (measured AI code-duplication rise); Qodo 2025 ("not in our
  standards" a top complaint); arXiv (AI PRs ~1.7x more major issues); arXiv 2602.11988 (bloated context
  files REDUCE success & raise cost >20% — validates "steer, don't bloat").

**Verdict:** Not reinventing a solved thing *if* repositioned around the under-served quality layer.
Can't win on "we have a methodology" (BMAD does) or the installer (commoditized). Only durable moats:
**curation/taste, completeness of the skipped pieces (review gate + ticket structure), and credibility
from being battle-tested on a shipped product.** Position as *"the opinionated quality layer on top of
whatever agent stack (AGENTS.md / Spec Kit / Cursor) you already use."*

---

## Recommended next steps (not yet started)

1. Pick the final name + decide npm rename.
2. Reposition README around the **quality gate + coding principles + ticket structure** as the headline;
   frame the React guide as one reference example.
3. Demote/rethink the two `*-md-guide.md` files — either cut, or reframe as a skeptical cross-tool
   synthesis citing the "bloated context hurts" research (an angle no official source takes).
4. Align the 3 names (repo / npm / README title) to one canonical name.
5. Add anti-slop tagline + the "battle-tested on a real app" credibility hook.
6. Installer improvements (from earlier discussion): auto-wire into CLAUDE.md/AGENTS.md, `--target` flag,
   selectable subset. Consider shipping as Claude Code skills/plugin as a v2 channel.
7. App templates: **decided against** — stale fast, contradicts the philosophy. Lighter alternative:
   an `examples/` folder with filled-in sample CLAUDE.md / AGENTS.md / skill / ticket.

## Branch
Working branch: `claude/repo-review-naming-4PHqh`. No code changes made yet — discussion + research only.
