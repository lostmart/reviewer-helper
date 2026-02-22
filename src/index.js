require("dotenv").config()

const readline = require("readline")
const { spawnSync } = require("child_process")
const path = require("path")
const fs = require("fs")

function ask(rl, question) {
	return new Promise((resolve) => rl.question(question, resolve))
}

async function main() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	console.log("===================================")
	console.log("  AI Student Review Orchestrator   ")
	console.log("===================================\n")

	const repoUrl = await ask(rl, "Enter the GitHub repo URL: ")

	rl.close()

	// Build and validate cloneDir (path traversal guard)
	const repoName = repoUrl
		.split("/")
		.pop()
		.replace(/\.git$/, "")
	const clonedReposDir = path.resolve(path.join(__dirname, "..", "cloned_repos"))
	const cloneDir = path.resolve(path.join(clonedReposDir, `${repoName}`))

	if (!cloneDir.startsWith(clonedReposDir + path.sep)) {
		console.error("Invalid repo URL: path traversal detected.")
		process.exit(1)
	}

	if (fs.existsSync(cloneDir)) {
		fs.rmSync(cloneDir, { recursive: true, force: true })
	}
	fs.mkdirSync(clonedReposDir, { recursive: true })

	console.log(`\nCloning ${repoUrl} ...`)
	const clone = spawnSync("git", ["clone", repoUrl, cloneDir], {
		stdio: "inherit",
	})

	if (clone.status !== 0) {
		console.error("Clone failed. Check the URL and try again.")
		process.exit(1)
	}

	console.log(`\nSuccessfully cloned to: ${cloneDir}`)
}

main()
