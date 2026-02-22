# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Agentic Grader** — a Node.js CLI tool that uses the Gemini CLI as an AI orchestrator to automatically evaluate student code submissions (GitHub repositories) against assignment requirements and generate structured feedback.

## Architecture

The system has three layers:

1. **Rubric (`gemini.md`)** — The master instruction set passed to Gemini CLI. Defines evaluation criteria across three dimensions: code structure/quality, functionality/implementation, and best practices/error handling. Also specifies how Gemini must format its output (summary, detailed findings, actionable steps).

2. **Assignment Context (`docs/assignment-requirements.md`)** — Per-assignment requirements injected into the Gemini prompt alongside `gemini.md`. Swap this file to grade a different exercise.

3. **Orchestrator (`src/`)** — The Node.js layer (not yet implemented) that:
   - Accepts a student submission (GitHub repo URL or a `.txt` file containing one)
   - Clones the student repository locally
   - Invokes Gemini CLI with both `gemini.md` and `docs/assignment-requirements.md` as context
   - Outputs the structured feedback

## Key Conventions

- **Rubric is assignment-agnostic**: `gemini.md` handles generic structure/style/best-practices checks. Assignment-specific checks belong only in `docs/assignment-requirements.md`.
- **Gemini CLI** is the AI backend — invoke the `gemini` CLI binary, not the Gemini REST API directly.
- Student submissions can be a GitHub repo URL or a `.txt` file referencing one; the orchestrator must handle both forms.
- Runtime: Node.js (`"type": "commonjs"` in `package.json`), entry point is `index.js`.
