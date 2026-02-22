require("dotenv").config()

const readline = require("readline")
const { spawnSync } = require("child_process")
const path = require("path")
const fs = require("fs")

const { runReviewerAgent } = require("./reviewer")
const { runEvaluatorAgent } = require("./evaluator")

function ask(rl, question) {
	return new Promise((resolve) => rl.question(question, resolve))
}

function createPR(cloneDir, studentName, feedbackFile) {
	const branch = `feedback/${studentName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`

	const git = (...args) => {
		const result = spawnSync("git", ["-C", cloneDir, ...args], { stdio: "inherit" })
		if (result.status !== 0) throw new Error(`git ${args[0]} failed (exit ${result.status})`)
	}

	console.log(`\nCreating branch: ${branch}`)
	git("checkout", "-b", branch)
	git("add", "FEEDBACK.md")
	git("commit", "-m", `Add grader feedback for ${studentName}`)
	git("push", "origin", branch)

	console.log("\nOpening Pull Request...")
	const pr = spawnSync(
		"gh",
		["pr", "create", "--title", `Grader Feedback: ${studentName}`, "--body-file", feedbackFile],
		{ cwd: cloneDir, stdio: "inherit" }
	)
	if (pr.status !== 0) throw new Error(`gh pr create failed (exit ${pr.status})`)
}

async function main() {
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

	console.log("===================================")
	console.log("  AI Student Review Orchestrator   ")
	console.log("===================================\n")

	const studentName = await ask(rl, "Enter the student's name: ")
	const repoUrl = await ask(rl, "Enter the GitHub repo URL: ")

	console.log("\n-----------------------------------")
	console.log("Starting Review Process for:")
	console.log(`Name: ${studentName}`)
	console.log(`Repo: ${repoUrl}`)
	console.log("-----------------------------------\n")

	// Build and validate cloneDir (path traversal guard)
	const repoName = repoUrl.split("/").pop().replace(/\.git$/, "")
	const clonedReposDir = path.resolve(path.join(__dirname, "..", "cloned_repos"))
	const cloneDir = path.resolve(
		path.join(clonedReposDir, `${studentName}_${repoName}`)
	)

	if (!cloneDir.startsWith(clonedReposDir + path.sep)) {
		console.error("Invalid student name or repo name: path traversal detected.")
		rl.close()
		process.exit(1)
	}

	if (fs.existsSync(cloneDir)) {
		fs.rmSync(cloneDir, { recursive: true, force: true })
	}
	fs.mkdirSync(clonedReposDir, { recursive: true })

	// Load rubric and assignment context
	const rubric = fs.readFileSync(path.join(__dirname, "..", "gemini.md"), "utf8")
	const assignment = fs.readFileSync(
		path.join(__dirname, "..", "docs", "assignment-requirements.md"),
		"utf8"
	)

	// Agent 1 — clone repo and run Gemini review
	console.log("[Agent 1] Cloning repository and running Gemini review...")
	let rawFeedback
	try {
		rawFeedback = await runReviewerAgent(repoUrl, cloneDir, rubric, assignment)
		console.log("[Agent 1] Review complete.\n")
	} catch (err) {
		console.error("[Agent 1] Failed:", err.message)
		rl.close()
		process.exit(1)
	}

	// Agent 2 — rewrite feedback positively and assign grade
	console.log("[Agent 2] Generating student-facing feedback and grade...")
	let finalFeedback
	try {
		finalFeedback = await runEvaluatorAgent(rawFeedback, assignment, studentName)
		console.log("[Agent 2] Feedback ready.\n")
	} catch (err) {
		console.error("[Agent 2] Failed:", err.message)
		rl.close()
		process.exit(1)
	}

	// Write feedback to file inside the clone
	const feedbackFile = path.join(cloneDir, "FEEDBACK.md")
	fs.writeFileSync(feedbackFile, finalFeedback)

	// Show feedback preview
	console.log("==================== FEEDBACK PREVIEW ====================\n")
	console.log(finalFeedback)
	console.log("\n===========================================================\n")

	// Wait for user decision
	const answer = await ask(
		rl,
		'Type "send" to create the PR, or anything else to cancel: '
	)

	if (answer.trim().toLowerCase() === "send") {
		try {
			createPR(cloneDir, studentName, feedbackFile)
			console.log("\nFeedback PR created successfully.")
			fs.rmSync(cloneDir, { recursive: true, force: true })
			console.log(`Cleaned up temporary clone: ${cloneDir}\n`)
		} catch (err) {
			console.error("Failed to create feedback PR:", err.message)
			console.log(`Clone kept at: ${cloneDir}`)
			rl.close()
			process.exit(1)
		}
	} else {
		console.log("\nCancelled. No PR was created.")
		console.log(`Feedback file kept at: ${feedbackFile}`)
	}

	rl.close()
}

main()
