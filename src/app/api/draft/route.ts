import { getAnthropicClient } from "@/lib/claude";
import { buildDraftPrompt } from "@/lib/prompts";
import type { Practice } from "@/lib/types";
import { z } from "zod";

const DraftResponseSchema = z.object({
  subject: z.string(),
  body: z.string(),
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
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: buildDraftPrompt(practice),
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = DraftResponseSchema.parse(JSON.parse(text));

    return Response.json({ subject: parsed.subject, body: parsed.body });
  } catch (error) {
    console.error("Draft API error:", error);
    return Response.json({ error: "Failed to draft email" }, { status: 500 });
  }
}
