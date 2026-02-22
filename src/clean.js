const path = require("path")
const fs = require("fs")

const rootDir = path.resolve(__dirname, "..")
const clonedReposDir = path.join(rootDir, "cloned_repos")
const feedbackFile = path.join(rootDir, "FEEDBACK.md")

// Delete all cloned repos, keep .gitkeep
const entries = fs.readdirSync(clonedReposDir)
for (const entry of entries) {
	if (entry === ".gitkeep") continue
	const fullPath = path.join(clonedReposDir, entry)
	fs.rmSync(fullPath, { recursive: true, force: true })
	console.log(`Deleted: ${fullPath}`)
}

// Clear FEEDBACK.md content but keep the file
fs.writeFileSync(feedbackFile, "# write feedback here !!\n")
console.log("Cleared: FEEDBACK.md")
