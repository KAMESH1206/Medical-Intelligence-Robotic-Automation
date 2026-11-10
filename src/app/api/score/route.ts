import { getAnthropicClient } from "@/lib/claude";
import { buildScorePrompt } from "@/lib/prompts";
import type { Practice } from "@/lib/types";
import { z } from "zod";

const ScoreResponseSchema = z.object({
  score: z.number().int().min(0).max(100),
  reason: z.string(),
});

export async function POST(request: Request) {
  try {
    const practice = (await request.json()) as Practice;

    if (!practice?.id) {
      return Response.json({ error: "Invalid practice data" }, { status: 400 });
    }

    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: buildScorePrompt(practice),
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = ScoreResponseSchema.parse(JSON.parse(text));

    return Response.json({ score: parsed.score, reason: parsed.reason });
  } catch (error) {
    console.error("Score API error:", error);
    return Response.json({ error: "Failed to score practice" }, { status: 500 });
  }
}

