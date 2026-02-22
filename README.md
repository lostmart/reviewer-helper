# Agentic Grader

A Node.js CLI tool that orchestrates two Claude AI agents to evaluate student code submissions (GitHub repositories) and deliver warm, constructive feedback as a GitHub Pull Request.

## How it works

1. Prompts for the student's name and GitHub repo URL
2. **Agent 1 (Reviewer)** — clones the repo into `cloned_repos/` and runs Gemini CLI against it using the rubric (`gemini.md`) and assignment context (`docs/assignment-requirements.md`), producing a raw technical assessment
3. **Agent 2 (Evaluator)** — reads the raw assessment and the assignment requirements, rewrites the feedback in a positive, personal, and relaxed tone, and assigns a grade between 14 and 20
4. Displays the final feedback in the terminal for review
5. Waits for the user to type `send` before creating the PR
6. Commits `FEEDBACK.md` to a `feedback/<student-name>` branch, opens a Pull Request, and deletes the local clone — only if the PR succeeds

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
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) — available as `gemini` in your PATH
- [GitHub CLI](https://cli.github.com) (`gh`) — authenticated and configured

## Setup

1. Clone this repository and install dependencies:

   ```bash
   git clone <this-repo-url>
   cd agentic-grader
   npm install
   ```

2. Copy the example env file and fill in your credentials:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |----------|-------------|
   | `ANTHROPIC_API_KEY` | Anthropic API key (powers both Claude agents) |
   | `GITHUB_TOKEN` | Personal access token with repo scope |
   | `GITHUB_USERNAME` | Your GitHub username |

3. Make sure `gemini` and `gh` are authenticated and available in your PATH.

## Usage

```bash
npm start
```

The CLI will prompt you for the student's name and GitHub repo URL, then run both agents automatically. Once the feedback is displayed, type `send` to create the PR or anything else to cancel.

## Grading configuration

| File | Purpose |
|------|---------|
| `gemini.md` | Assignment-agnostic rubric passed to Gemini (structure, quality, best practices) |
| `docs/assignment-requirements.md` | Per-assignment requirements — swap this to grade a different exercise |

To grade a different assignment, replace `docs/assignment-requirements.md`. The rubric in `gemini.md` stays the same.

## Project structure

```
agentic-grader/
├── src/
│   ├── index.js                      # CLI entry point and orchestrator
│   ├── reviewer.js                   # Agent 1: clones repo, runs Gemini, returns raw feedback
│   └── evaluator.js                  # Agent 2: rewrites feedback positively, assigns grade
├── docs/
│   ├── assignment-requirements.md    # Active assignment context
│   └── spec.md                       # Project spec
├── cloned_repos/                     # Temporary clones (auto-deleted after PR)
├── gemini.md                         # Grading rubric for Gemini
├── .env.example                      # Environment variable template
└── package.json
```
