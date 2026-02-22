# Agentic Grader

A Node.js CLI tool that uses the Gemini CLI as an AI orchestrator to automatically evaluate student code submissions (GitHub repositories) against assignment requirements and generate structured feedback as a GitHub Pull Request.

## How it works

1. Prompts for the student's name and GitHub repo URL
2. Clones the repo locally into `cloned_repos/`
3. Runs Gemini CLI against the repo using `gemini.md` (rubric) and `docs/assignment-requirements.md` (assignment context)
4. Creates a `FEEDBACK.md` file, commits it to a `feedback/<student-name>` branch, and opens a Pull Request
5. Deletes the local clone only if the PR was created successfully

## Requirements

- [Node.js](https://nodejs.org)
- [Git](https://git-scm.com)
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) — must be available as `gemini` in your PATH
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

   | Variable          | Description                        |
   |-------------------|------------------------------------|
   | `GITHUB_TOKEN`    | Personal access token with repo scope |
   | `GITHUB_USERNAME` | Your GitHub username               |

3. Make sure `gemini` and `gh` are authenticated and available in your PATH.

## Usage

```bash
node src/index.js
```

The CLI will prompt you for:
- Student's name
- GitHub repo URL

## Grading configuration

| File | Purpose |
|------|---------|
| `gemini.md` | Assignment-agnostic rubric (structure, quality, best practices) |
| `docs/assignment-requirements.md` | Per-assignment requirements — swap this file to grade a different exercise |

To grade a different assignment, replace the contents of `docs/assignment-requirements.md` with the new requirements. The rubric in `gemini.md` stays the same.

## Project structure

```
agentic-grader/
├── src/
│   └── index.js                      # CLI orchestrator
├── docs/
│   ├── assignment-requirements.md    # Active assignment context
│   └── spec.md                       # Project spec
├── cloned_repos/                     # Temporary clones (auto-deleted after PR)
├── gemini.md                         # Grading rubric
├── .env.example                      # Environment variable template
└── package.json
```
