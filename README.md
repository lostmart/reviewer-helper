# Agentic Grader

A Node.js CLI tool that accepts a student's name and GitHub repository URL, clones the repo locally, and confirms success.

## How it works

1. Prompts for the student's name and GitHub repo URL
2. Clones the repo into `cloned_repos/<studentName>_<repoName>/`
3. Logs success or exits with an error if the clone fails

## Requirements

- [Node.js](https://nodejs.org)
- [Git](https://git-scm.com)

## Setup

```bash
git clone <this-repo-url>
cd agentic-grader
```

No dependencies to install.

## Usage

```bash
npm start
```

## Project structure

```
agentic-grader/
├── src/
│   ├── index.js                      # CLI entry point
│   └── agents/
│       ├── reviewer.md               # Agent 1 prompt (unused)
│       └── evaluator.md              # Agent 2 prompt (unused)
├── docs/
│   ├── assignment-requirements.md    # Assignment context
│   ├── general-context.md            # Course context (EPITA Advanced JS)
│   └── spec.md                       # Project spec
├── cloned_repos/                     # Student repos cloned here
├── gemini.md                         # Grading rubric
├── .env.example                      # Environment variable template
└── package.json
```

## Commands

- `npm start` prompts for student's name and GitHub repo URL, clones the repo, and logs success or exits with an error if the clone fails
- Claude or Gemini CLI: analyze the repo found in @cloned_repos/ see if it respects the @docs/assignment-requirements.md and @docs/general-context.md then write your feedback on a feedback.md file in the projects root directory
- Create a PR on GitHub. Include your feedback in the PR description, finally, delete the cloned repo and feedback.md if the PR is successful
