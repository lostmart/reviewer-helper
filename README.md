# Agentic Grader

A Node.js CLI tool for grading student code submissions. Clones a GitHub repository locally, then hands off to Claude or Gemini for analysis and feedback.

## Workflow

1. **Clone** — `npm start` prompts for the student's name and GitHub repo URL, clones it into `cloned_repos/`
2. **Analyze** — ask Claude or Gemini to analyze the repo against `docs/assignment-requirements.md` and `docs/general-context.md`, then write the feedback to `FEEDBACK.md` inside the cloned repo
3. **Submit** — ask Claude to create a GitHub issue on the student's repo with the feedback as the body, then delete the local clone

> If the student's fork has issues disabled, target the upstream repo instead (e.g. `web-rest-api/DDD-exercise`).

## Requirements

- [Node.js](https://nodejs.org)
- [Git](https://git-scm.com)

## Setup

```bash
git clone <this-repo-url>
cd agentic-grader
npm install
```

Copy the env file and add your GitHub token:

```bash
cp .env.example .env
```

| Variable          | Description                                       |
| ----------------- | ------------------------------------------------- |
| `GITHUB_TOKEN`    | Personal access token with repo scope             |
| `GITHUB_USERNAME` | Your GitHub username                              |
| `GEMINI_MODEL`    | Gemini model to use (default: `gemini-2.0-flash`) |

## Usage

```bash
npm start
```

## Grading context

| File                              | Purpose                                    |
| --------------------------------- | ------------------------------------------ |
| `gemini.md`                       | Assignment-agnostic rubric                 |
| `docs/assignment-requirements.md` | Active assignment — swap this per exercise |
| `docs/general-context.md`         | Course context (EPITA Advanced JS)         |
| `src/agents/reviewer.md`          | Reviewer agent system prompt               |
| `src/agents/evaluator.md`         | Evaluator agent system prompt              |

## Project structure

```
agentic-grader/
├── src/
│   ├── index.js                      # CLI — prompts, clones, logs
│   └── agents/
│       ├── reviewer.md               # Structures Gemini output into a technical assessment
│       └── evaluator.md              # Rewrites assessment as warm feedback with a grade
├── docs/
│   ├── assignment-requirements.md    # Active assignment context
│   ├── general-context.md            # Course context (EPITA Advanced JS)
│   └── spec.md                       # Project spec
├── cloned_repos/                     # Temporary student repo clones
├── gemini.md                         # Grading rubric for Gemini
├── .env.example                      # Environment variable template
└── package.json
```

### Commands

`npm start`

- prompts for student's GitHub repo URL, clones the repo, and logs success or exits with an error if the clone fails

- Prompt: analyze the repo found in @cloned_repos/ see if it respects the @docs/assignment-requirements.md and @docs/general-context.md then write your feedback in the ROOT of the folder @FEEDBACK.md. Give it a general grade 20 being the max grade for the assignment. Don't exceed 50 lines in all

- Review @FEEDBACK.md found in the cloned repo. Check it against @docs/assignment-requirements.md and @docs/general-context. Provide general suggestions, if you agree or not, and why.

- Once all done, run `npm run clean`
  It will delete everything in cloned_repos/ except .gitkeep, and reset `FEEDBACK.md` to its placeholder content.
