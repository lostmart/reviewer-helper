1. Project Analysis Rubric for Student Submission
   This document serves as the core instruction set for the Gemini CLI orchestrator. Its purpose is to evaluate a cloned student repository against specific learning objectives and technical requirements defined for the assignment.

2. Assignment Context
   Inject Assignment Name and Key Objectives here. This section provides necessary context for Gemini.

Overall Goal: [e.g., Evaluate adherence to modern web development best practices, project structure, and functionality based on the course module.]

3. Technical Requirements & Checks
   The orchestrator will instruct Gemini to perform the following technical evaluations:

3.1 Code Structure and Quality
Repository Structure: Verify the presence of standard directories (src/, docs/, tests/) and critical files (README.md, package.json, .gitignore).

Code Readability: Assess code for adherence to established style guides (e.g., JavaScript Standard Style or Airbnb). Look for clear variable naming, consistent indentation, and meaningful comments.

Modularity: Evaluate if the code is logically broken down into modules, components, or functions rather than monolithic files.

3.2 Functionality and Implementation
Feature Completeness: Compare implemented features against the specific requirements outlined in the course assignment (assignment.md, which the orchestrator will also provide as context).

CLI Utilization (Specific to this project): Confirm appropriate integration and usage of cloud CLI and Gemini CLI as specified in the assignment prompt.

3.3 Best Practices and Error Handling
Error Handling: Identify robust error handling mechanisms, particularly around API calls (GitHub API, Gemini API) and file system operations (cloning, reading files).

Security: Review for basic security considerations, such as the avoidance of hardcoding sensitive credentials (API keys, personal access tokens).

4. Feedback Generation Instructions
   Based on the analysis in Section 3, the Gemini CLI must generate structured feedback for the student.

Summary: Provide a high-level summary of strengths and significant areas for improvement.

Detailed Findings: Create a bulleted list corresponding directly to the checks in Section 3, highlighting specific successes and clearly identifying deficiencies.

Actionable Steps: Conclude with 2-3 specific, actionable recommendations for improvement.
