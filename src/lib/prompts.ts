import type { Practice } from "./types";

// ─────────────────────────────────────────────
// Prompt 1: AI Fit-Score Prompt
// Goal: Score a GP/health practice 0-100 for
//       how well they'd benefit from AI automation.
// ─────────────────────────────────────────────
export function buildScorePrompt(practice: Practice): string {
  return `You are a healthcare AI consultant evaluating medical practices for AI automation readiness.

Analyse this practice and return a JSON object with two fields:
- "score": integer 0-100 (higher = better fit for AI automation)
- "reason": 2-3 sentence explanation aimed at a sales rep

Scoring criteria (weight in brackets):
- Size of team (25%): larger teams benefit more from automation
- Services breadth (20%): more services = more workflow complexity = more AI value
- Telehealth offering (15%): tech-forward practices adopt AI faster
- Bulk billing (10%): higher patient volume, automation ROI is clearer
- Specialties (15%): specialist practices have complex documentation needs
- Website presence (15%): practices with websites are more digitally mature

Practice data:
${JSON.stringify(practice, null, 2)}

Respond ONLY with valid JSON. Example: {"score": 72, "reason": "..."}`;
}

// ─────────────────────────────────────────────
// Prompt 2: Personalised Outreach Email
// Goal: Draft a warm, specific outreach email
// ─────────────────────────────────────────────
export function buildDraftPrompt(practice: Practice): string {
  return `You are a friendly healthcare technology sales rep at MediLead AI, an Australian company that helps medical practices save 10+ hours per week with AI-powered admin automation (appointment scheduling, referral letters, billing, patient follow-ups).

Write a SHORT personalised outreach email to this practice. Rules:
- Max 150 words in the body
- Subject line must mention the practice name or suburb
- Mention 1-2 specific pain points relevant to their services or size
- End with a soft CTA: "Would a 15-minute call work this week?"
- Australian English spelling
- Warm, not pushy

Practice:
Name: ${practice.name}
Suburb: ${practice.suburb}, ${practice.state}
Services: ${practice.services?.join(", ") || "General Practice"}
Team size: ${practice.teamSizeEstimate || "unknown"}
Telehealth: ${practice.telehealth ? "Yes" : "No"}
Bulk billing: ${practice.bulkBilling ? "Yes" : "No"}

Respond with JSON: {"subject": "...", "body": "..."}`;
}

// ─────────────────────────────────────────────
// Prompt 3: AI Chat Assistant
// Goal: Answer natural language questions about
//       the loaded practices dataset
// ─────────────────────────────────────────────
export function buildChatSystemPrompt(practicesJson: string): string {
  return `You are MediLead AI Assistant, a helpful analytics assistant for a healthcare sales team.

You have access to a dataset of Australian medical practices. Answer the user's questions concisely and helpfully.

When asked about data, give specific numbers and insights. Format lists with bullet points.
When you don't know something, say so honestly.

Current practices dataset:
${practicesJson}

Today's date: ${new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;
}
