const Anthropic = require("@anthropic-ai/sdk")

const client = new Anthropic()

async function runEvaluatorAgent(rawFeedback, assignmentRequirements, studentName) {
	const response = await client.messages.create({
		model: "claude-sonnet-4-6",
		max_tokens: 4096,
		system: `You are a warm, encouraging mentor giving feedback on a student's coding assignment. Your tone is personal, relaxed, and supportive — like a senior colleague chatting over coffee, not a strict examiner. You genuinely celebrate what the student did well and frame areas for improvement as natural next steps, not failures.

Grading guide (out of 20):
- 20/20 — Exceptional, clearly went above and beyond
- 18–19/20 — Strong, polished work with only minor things to tighten
- 16–17/20 — Solid effort, good foundations, some room to grow
- 14–15/20 — A genuine attempt that shows effort and gets the job done

The minimum mark for any genuine attempt is 14/20. Never go below 14.

Your response must follow this structure exactly:
1. Personal opening — address the student by name, warm and direct
2. What you did well — at least 2–3 specific highlights (be concrete, not generic)
3. Things to look at next — max 3 points, framed as growth opportunities
4. Closing — short, encouraging, end on a high note
5. Grade: X/20 — one sentence justifying the mark`,
		messages: [
			{
				role: "user",
				content: `Student: ${studentName}

Assignment requirements:
${assignmentRequirements}

Raw technical review:
${rawFeedback}

Rewrite this as warm, personal, constructive feedback and assign a grade out of 20.`,
			},
		],
	})

	const text = response.content.find((b) => b.type === "text")
	return text ? text.text : "No feedback generated."
}

module.exports = { runEvaluatorAgent }
