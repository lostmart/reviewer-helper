const { spawnSync } = require("child_process")
const Anthropic = require("@anthropic-ai/sdk")

const client = new Anthropic()

const TOOLS = [
	{
		name: "clone_repo",
		description: "Clone a GitHub repository to a local directory.",
		input_schema: {
			type: "object",
			properties: {
				url: { type: "string", description: "The GitHub repository URL" },
				dest: { type: "string", description: "Absolute path for the local clone" },
			},
			required: ["url", "dest"],
		},
	},
	{
		name: "run_gemini_review",
		description:
			"Run Gemini CLI on the cloned repository and return the raw technical analysis.",
		input_schema: {
			type: "object",
			properties: {
				clone_dir: {
					type: "string",
					description: "Absolute path to the cloned repository",
				},
			},
			required: ["clone_dir"],
		},
	},
]

function handleTool(name, input, context) {
	if (name === "clone_repo") {
		const result = spawnSync("git", ["clone", input.url, input.dest], {
			encoding: "utf8",
		})
		if (result.status !== 0) return `Clone failed: ${result.stderr}`
		return `Successfully cloned to ${input.dest}`
	}

	if (name === "run_gemini_review") {
		const { rubric, assignment } = context
		const prompt = [
			rubric,
			"\n--- ASSIGNMENT REQUIREMENTS ---\n",
			assignment,
			"\n--- STUDENT REPOSITORY ---\n",
			`The student repository is at @${input.clone_dir}`,
			"Analyze all files according to the rubric and produce a thorough technical assessment.",
		].join("\n")

		const result = spawnSync("gemini", ["-p", prompt], {
			cwd: input.clone_dir,
			encoding: "utf8",
			maxBuffer: 10 * 1024 * 1024,
		})

		if (result.error) return `Gemini error: ${result.error.message}`
		if (result.status !== 0)
			return `Gemini failed (exit ${result.status}): ${result.stderr}`
		return result.stdout.trim()
	}

	return `Unknown tool: ${name}`
}

async function runReviewerAgent(repoUrl, cloneDir, rubric, assignment) {
	const messages = [
		{
			role: "user",
			content: `Please review this student repository.

- URL: ${repoUrl}
- Clone it to: ${cloneDir}

Steps:
1. Clone the repository using the clone_repo tool
2. Run the Gemini review using the run_gemini_review tool
3. Return the full raw review output as your final response`,
		},
	]

	let iterations = 0
	const MAX_ITERATIONS = 10

	while (iterations++ < MAX_ITERATIONS) {
		const response = await client.messages.create({
			model: "claude-sonnet-4-6",
			max_tokens: 8096,
			system:
				"You are a technical code reviewer. Clone the student repository and run a Gemini CLI analysis on it. Use the tools provided. Return the complete raw review output as your final response.",
			tools: TOOLS,
			messages,
		})

		messages.push({ role: "assistant", content: response.content })

		if (response.stop_reason === "end_turn") {
			const text = response.content.find((b) => b.type === "text")
			return text ? text.text : "No review output produced."
		}

		if (response.stop_reason === "tool_use") {
			const toolResults = []
			for (const block of response.content) {
				if (block.type === "tool_use") {
					const result = handleTool(block.name, block.input, { rubric, assignment })
					toolResults.push({
						type: "tool_result",
						tool_use_id: block.id,
						content: String(result),
					})
				}
			}
			messages.push({ role: "user", content: toolResults })
		}
	}

	throw new Error("Reviewer agent exceeded maximum iterations without completing.")
}

module.exports = { runReviewerAgent }
