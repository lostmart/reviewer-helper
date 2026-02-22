const readline = require("readline")
const { spawnSync } = require("child_process")
const path = require("path")
const fs = require("fs")

function runGeminiReview(cloneDir) {
	const rubric = fs.readFileSync(path.join(__dirname, "..", "gemini.md"), "utf8")
	const assignment = fs.readFileSync(
		path.join(__dirname, "..", "docs", "assignment-requirements.md"),
		"utf8"
	)

	const prompt = [
		rubric,
		"\n--- ASSIGNMENT REQUIREMENTS ---\n",
		assignment,
		"\n--- STUDENT REPOSITORY ---\n",
		`The student repository has been cloned and its files are available via @${cloneDir}`,
		"Analyze all files according to the rubric above and generate structured feedback.",
	].join("\n")

	console.log("\nRunning Gemini review (this may take a moment)...")

	const result = spawnSync("gemini", ["-p", prompt], {
		cwd: cloneDir,
		encoding: "utf8",
		maxBuffer: 10 * 1024 * 1024,
	})

	if (result.error) {
		throw new Error(`Gemini CLI not found or failed to start: ${result.error.message}`)
	}
	if (result.status !== 0) {
		throw new Error(`Gemini CLI exited with code ${result.status}:\n${result.stderr}`)
	}

	return result.stdout.trim()
}

function createFeedbackPR(cloneDir, studentName, feedbackContent) {
	const branch = `feedback/${studentName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`
	const feedbackFile = path.join(cloneDir, "FEEDBACK.md")

	fs.writeFileSync(feedbackFile, feedbackContent)

	// Use spawnSync with argument arrays — no shell interpolation, no injection risk
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

// Set up the terminal interface
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

console.log("===================================")
console.log("  AI Student Review Orchestrator   ")
console.log("===================================\n")

// 1. Ask for the student's name
rl.question("Enter the student's name: ", (studentName) => {
	// 2. Ask for the GitHub URL
	rl.question("Enter the GitHub repo URL: ", (repoUrl) => {
		console.log("\n-----------------------------------")
		console.log("Starting Review Process for:")
		console.log(`Name: ${studentName}`)
		console.log(`Repo: ${repoUrl}`)
		console.log("-----------------------------------\n")

		// Step 1: Clone the repository locally
		const repoName = repoUrl.split("/").pop().replace(/\.git$/, "")
		const clonedReposDir = path.resolve(path.join(__dirname, "..", "cloned_repos"))
		const cloneDir = path.resolve(path.join(clonedReposDir, `${studentName}_${repoName}`))

		// Guard against path traversal via crafted studentName or repoName
		if (!cloneDir.startsWith(clonedReposDir + path.sep)) {
			console.error("Invalid student name or repo name: path traversal detected.")
			rl.close()
			process.exit(1)
		}

		if (fs.existsSync(cloneDir)) {
			console.log(`Directory already exists, removing: ${cloneDir}`)
			fs.rmSync(cloneDir, { recursive: true, force: true })
		}

		fs.mkdirSync(clonedReposDir, { recursive: true })

		console.log(`Cloning ${repoUrl} ...`)
		// spawnSync avoids shell interpolation of repoUrl
		const clone = spawnSync("git", ["clone", repoUrl, cloneDir], { stdio: "inherit" })
		if (clone.status !== 0) {
			console.error("Failed to clone repository. Check the URL and try again.")
			rl.close()
			process.exit(1)
		}
		console.log(`\nRepo cloned to: ${cloneDir}`)

		// Step 2: Run Gemini CLI with gemini.md & assignment.md
		let feedbackContent
		try {
			feedbackContent = runGeminiReview(cloneDir)
			console.log("\nGemini review complete.")
		} catch (err) {
			console.error("Failed to run Gemini review:", err.message)
			rl.close()
			process.exit(1)
		}

		// Step 3: Submit feedback as a GitHub Pull Request
		try {
			createFeedbackPR(cloneDir, studentName, feedbackContent)
			console.log("\nFeedback PR created successfully.")
			fs.rmSync(cloneDir, { recursive: true, force: true })
			console.log(`Cleaned up temporary clone: ${cloneDir}\n`)
		} catch (err) {
			console.error("Failed to create feedback PR:", err.message)
			console.log(`Clone kept at: ${cloneDir}`)
			rl.close()
			process.exit(1)
		}

		rl.close()
	})
})
