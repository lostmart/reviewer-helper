# Agentic Grader

A Node.js CLI tool that orchestrates two local Claude agents to evaluate student code submissions (GitHub repositories) and deliver warm, constructive feedback as a GitHub Pull Request.

## How it works

1. Prompts for the student's name and GitHub repo URL
2. Clones the repo into `cloned_repos/` and runs Gemini CLI for a raw code analysis
3. **Agent 1 (Reviewer)** — receives the Gemini output and structures it into a clean technical assessment, defined in `src/agents/reviewer.md`
4. **Agent 2 (Evaluator)** — takes the assessment alongside the assignment requirements and course context, rewrites it as warm, personal feedback, and assigns a grade between 14 and 20, defined in `src/agents/evaluator.md`
5. Displays the final feedback in the terminal for review
6. Waits for the user to type `send` before creating the PR
7. Commits `FEEDBACK.md` to a `feedback/<student-name>` branch, opens a Pull Request, and deletes the local clone — only if the PR succeeds

## Agents

Both agents are defined as plain markdown files in `src/agents/` and called via the `claude` CLI. No API key required — Claude Code's own authentication is used.

| Agent | File | Role |
|-------|------|------|
| Reviewer | `src/agents/reviewer.md` | Structures Gemini's raw output into a technical assessment |
| Evaluator | `src/agents/evaluator.md` | Rewrites the assessment as encouraging, course-aware feedback with a grade |

To adjust an agent's behavior, just edit its `.md` file.

## Grading scale

| Grade | Meaning |
|-------|---------|
| 20/20 | Exceptional — clearly went above and beyond |
| 18–19/20 | Strong, polished work with minor things to tighten |
| 16–17/20 | Solid effort, good foundations, some room to grow |
| 14–15/20 | A genuine attempt that gets the job done |

Minimum passing grade for any genuine submission is **14/20**.

## Requirements

- [Node.js](https://nodejs.org)
- [Git](https://git-scm.com)
- [Claude Code](https://claude.ai/code) (`claude`) — authenticated and available in your PATH
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) — available as `gemini` in your PATH
- [GitHub CLI](https://cli.github.com) (`gh`) — authenticated and configured

## Setup

1. Clone this repository:

   ```bash
   git clone <this-repo-url>
   cd agentic-grader
   ```

2. No dependencies to install — the project has no npm packages.

3. Make sure `claude`, `gemini`, and `gh` are authenticated and available in your PATH.

## Usage

```bash
npm start
```

The CLI will prompt you for the student's name and GitHub repo URL, then run the full pipeline automatically. Once the feedback preview is shown, type `send` to create the PR or anything else to cancel.

## Grading configuration

| File | Purpose |
|------|---------|
| `gemini.md` | Assignment-agnostic rubric passed to Gemini (structure, quality, best practices) |
| `docs/assignment-requirements.md` | Per-assignment requirements — swap this to grade a different exercise |
| `docs/general-context.md` | Course context injected into Agent 2 for course-aware feedback |

To grade a different assignment, replace `docs/assignment-requirements.md`. Everything else stays the same.

## Project structure

```
agentic-grader/
├── src/
│   ├── index.js                      # CLI entry point and orchestrator
│   └── agents/
│       ├── reviewer.md               # Agent 1: structures Gemini output into a technical assessment
│       └── evaluator.md              # Agent 2: rewrites assessment as warm feedback with a grade
├── docs/
│   ├── assignment-requirements.md    # Active assignment context
│   ├── general-context.md            # Course context (EPITA Advanced JS)
│   └── spec.md                       # Project spec
├── cloned_repos/                     # Temporary clones (auto-deleted after PR)
├── gemini.md                         # Grading rubric for Gemini
├── .env.example                      # Environment variable template
└── package.json
```
