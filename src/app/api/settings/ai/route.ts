import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ENV_PATH = path.resolve(process.cwd(), ".env.local");

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY || "";
  const geminiModel = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
  const n1nKey = process.env.N1N_API_KEY || "";

  return NextResponse.json({
    success: true,
    hasGeminiKey: Boolean(geminiKey && geminiKey.trim().length > 10),
    geminiModel,
    maskedGeminiKey: geminiKey
      ? `${geminiKey.slice(0, 7)}...${geminiKey.slice(-4)}`
      : "",
    hasN1nKey: Boolean(n1nKey && n1nKey.trim().length > 10),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, geminiKey, geminiModel } = body;

    // Test Gemini Connection
    if (action === "test") {
      let keyToTest = geminiKey || process.env.GEMINI_API_KEY || "";
      if (keyToTest.includes("...") && process.env.GEMINI_API_KEY) {
        keyToTest = process.env.GEMINI_API_KEY;
      }
      if (!keyToTest) {
        return NextResponse.json({
          success: false,
          error: "No Gemini API key provided to test.",
        });
      }

      // Candidate models in order of priority
      const requestedModel = geminiModel || process.env.GEMINI_MODEL || "gemini-3-flash-preview";
      const candidateModels = [
        requestedModel,
        "gemini-3-flash-preview",
        "gemini-3.1-flash-lite",
      ];
      // Deduplicate
      const uniqueModels = Array.from(new Set(candidateModels));

      let lastError = "";
      let workingModel = "";

      for (const model of uniqueModels) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
          keyToTest.trim()
        )}`;

        try {
          const testRes = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Respond with the single word: OK" }] }],
              generationConfig: { maxOutputTokens: 5 },
            }),
          });

          const data = await testRes.json();
          if (testRes.ok) {
            workingModel = model;
            break;
          } else {
            lastError = data.error?.message || `HTTP ${testRes.status}`;
            // If the model is not found or deprecated, continue to next candidate
            if (testRes.status === 404 || lastError.includes("no longer available")) {
              continue;
            }
          }
        } catch (err: unknown) {
          const error = err as Error;
          lastError = error.message;
        }
      }

      if (workingModel) {
        return NextResponse.json({
          success: true,
          model: workingModel,
          message: workingModel === requestedModel
            ? `Gemini API Verified! Connected via ${workingModel} (Ready for Clinical OCR)`
            : `Connected via ${workingModel} (auto-migrated from deprecated ${requestedModel})`,
        });
      }

      return NextResponse.json({
        success: false,
        error: `Gemini API Error: ${lastError}`,
      });
    }

    // Save Gemini Key to .env.local
    if (geminiKey !== undefined) {
      process.env.GEMINI_API_KEY = geminiKey.trim();
      if (geminiModel) {
        process.env.GEMINI_MODEL = geminiModel.trim();
      }

      if (fs.existsSync(ENV_PATH)) {
        let content = fs.readFileSync(ENV_PATH, "utf-8");
        if (content.includes("GEMINI_API_KEY=")) {
          content = content.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${geminiKey.trim()}`);
        } else {
          content = `GEMINI_API_KEY=${geminiKey.trim()}\n` + content;
        }

        if (geminiModel) {
          if (content.includes("GEMINI_MODEL=")) {
            content = content.replace(/GEMINI_MODEL=.*/g, `GEMINI_MODEL=${geminiModel.trim()}`);
          } else {
            content = `GEMINI_MODEL=${geminiModel.trim()}\n` + content;
          }
        }

        fs.writeFileSync(ENV_PATH, content, "utf-8");
      }

      return NextResponse.json({
        success: true,
        message: "Gemini API credentials successfully saved and activated!",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}

