# prestige

> _One-line description of the project goes here._

<!-- TODO: replace the description above and the Overview below once the project takes shape. -->

## Overview

This repository is currently scaffolding — the application code has not been
started yet. What's in place today is the agent-skills configuration used by the
[Matt Pocock engineering skills](https://github.com/mattpocock/skills).

## Agent skills setup

This repo is configured for the engineering skills. The full pointer block lives
in [`AGENTS.md`](./AGENTS.md); the details live under [`docs/agents/`](./docs/agents/):

| Config | Choice | File |
| --- | --- | --- |
| Issue tracker | Local markdown under `.scratch/<feature>/` | [`docs/agents/issue-tracker.md`](./docs/agents/issue-tracker.md) |
| Triage labels | Canonical five (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`) | [`docs/agents/triage-labels.md`](./docs/agents/triage-labels.md) |
| Domain docs | Multi-context (`CONTEXT-MAP.md` + per-context `CONTEXT.md`) | [`docs/agents/domain.md`](./docs/agents/domain.md) |

To change any of these — for example, switching to GitHub/GitLab issues after
adding a remote — re-run the `/setup-matt-pocock-skills` skill, or edit the
`docs/agents/*.md` files directly.

## Repository layout

```
.
├── AGENTS.md              # Agent skills pointer block
├── docs/agents/           # Issue-tracker, triage-label, and domain-doc config
├── .agents/skills/        # Vendored engineering skills (tool-agnostic path)
├── .claude/skills/        # Vendored engineering skills (Claude Code path)
├── skills-lock.json       # Skill lockfile
└── .scratch/              # Local-markdown issues & PRDs (created on first use)
```

## Getting started

_Fill this in once there's code to build and run._
