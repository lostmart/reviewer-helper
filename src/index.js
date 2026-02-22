const readline = require("readline")
const { spawnSync } = require("child_process")
const path = require("path")
const fs = require("fs")

function ask(rl, question) {
	return new Promise((resolve) => rl.question(question, resolve))
}

// Call a local Claude agent defined by a .md system prompt file
function callAgent(agentFile, userPrompt) {
	const systemPrompt = fs.readFileSync(agentFile, "utf8")

	const result = spawnSync(
		"claude",
		["-p", "--system-prompt", systemPrompt, "--tools", "", userPrompt],
		{ encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }
	)

	if (result.error) throw new Error(`Claude CLI: ${result.error.message}`)
	if (result.status !== 0)
		throw new Error(`Claude CLI exited ${result.status}:\n${result.stderr}`)

	return result.stdout.trim()
}

function runGemini(cloneDir, rubric, assignment) {
	const prompt = [
		rubric,
		"\n--- ASSIGNMENT REQUIREMENTS ---\n",
		assignment,
		"\n--- STUDENT REPOSITORY ---\n",
		`The student repository is at @${cloneDir}`,
		"Analyze all files according to the rubric and produce a thorough technical assessment.",
	].join("\n")

	const result = spawnSync("gemini", ["-p", prompt], {
		cwd: cloneDir,
		encoding: "utf8",
		maxBuffer: 10 * 1024 * 1024,
	})

	if (result.error) throw new Error(`Gemini CLI: ${result.error.message}`)
	if (result.status !== 0)
		throw new Error(`Gemini CLI exited ${result.status}:\n${result.stderr}`)

	return result.stdout.trim()
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
	const cloneDir = path.resolve(path.join(clonedReposDir, `${studentName}_${repoName}`))

	if (!cloneDir.startsWith(clonedReposDir + path.sep)) {
		console.error("Invalid student name or repo name: path traversal detected.")
		rl.close()
		process.exit(1)
	}

	if (fs.existsSync(cloneDir)) fs.rmSync(cloneDir, { recursive: true, force: true })
	fs.mkdirSync(clonedReposDir, { recursive: true })

	// Load context files
	const rubric = fs.readFileSync(path.join(__dirname, "..", "gemini.md"), "utf8")
	const assignment = fs.readFileSync(
		path.join(__dirname, "..", "docs", "assignment-requirements.md"),
		"utf8"
	)
	const courseContext = fs.readFileSync(
		path.join(__dirname, "..", "docs", "general-context.md"),
		"utf8"
	)

	// Clone the repository
	console.log(`Cloning ${repoUrl} ...`)
	const clone = spawnSync("git", ["clone", repoUrl, cloneDir], { stdio: "inherit" })
	if (clone.status !== 0) {
		console.error("Failed to clone repository. Check the URL and try again.")
		rl.close()
		process.exit(1)
	}
	console.log(`\nRepo cloned to: ${cloneDir}`)

	// Run Gemini to get the raw code analysis
	console.log("\nRunning Gemini analysis (this may take a moment)...")
	let geminiOutput
	try {
		geminiOutput = runGemini(cloneDir, rubric, assignment)
		console.log("Gemini analysis complete.\n")
	} catch (err) {
		console.error("Gemini failed:", err.message)
		rl.close()
		process.exit(1)
	}

	// Agent 1 — structure the raw Gemini output into a technical assessment
	const reviewerAgent = path.join(__dirname, "agents", "reviewer.md")
	console.log("[Agent 1] Structuring technical assessment...")
	let technicalAssessment
	try {
		technicalAssessment = callAgent(
			reviewerAgent,
			`Here is the raw Gemini analysis for a student submission:\n\n${geminiOutput}`
		)
		console.log("[Agent 1] Assessment ready.\n")
	} catch (err) {
		console.error("[Agent 1] Failed:", err.message)
		rl.close()
		process.exit(1)
	}

	// Agent 2 — rewrite as warm, personal feedback with a grade
	const evaluatorAgent = path.join(__dirname, "agents", "evaluator.md")
	console.log("[Agent 2] Generating student-facing feedback and grade...")
	let finalFeedback
	try {
		finalFeedback = callAgent(
			evaluatorAgent,
			`Student: ${studentName}

Course context:
${courseContext}

Assignment requirements:
${assignment}

Technical assessment:
${technicalAssessment}

Rewrite this as warm, personal, constructive feedback and assign a grade out of 20.`
		)
		console.log("[Agent 2] Feedback ready.\n")
	} catch (err) {
		console.error("[Agent 2] Failed:", err.message)
		rl.close()
		process.exit(1)
	}

	// Write feedback file
	const feedbackFile = path.join(cloneDir, "FEEDBACK.md")
	fs.writeFileSync(feedbackFile, finalFeedback)

	// Show preview
	console.log("==================== FEEDBACK PREVIEW ====================\n")
	console.log(finalFeedback)
	console.log("\n===========================================================\n")

	// Wait for user decision
	const answer = await ask(rl, 'Type "send" to create the PR, or anything else to cancel: ')

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
