import { getAnthropicClient } from "@/lib/claude";
import { buildChatSystemPrompt } from "@/lib/prompts";
import type { ChatMessage } from "@/lib/types";
import { readFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    // Load practices for context
    const dataPath = path.join(process.cwd(), "data", "practices.json");
    const practicesJson = await readFile(dataPath, "utf-8");

    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 600,
      system: buildChatSystemPrompt(practicesJson),
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return Response.json({ reply: text });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}

