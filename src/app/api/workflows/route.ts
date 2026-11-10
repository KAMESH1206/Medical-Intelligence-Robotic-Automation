import { NextResponse } from "next/server";
import { SEED_WORKFLOWS } from "@/lib/demoData";

export async function GET() {
  return NextResponse.json({
    success: true,
    count: SEED_WORKFLOWS.length,
    data: SEED_WORKFLOWS,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const wf = SEED_WORKFLOWS.find((w) => w.id === body.workflowId) || SEED_WORKFLOWS[0];

    const execution = {
      id: `exec_${Date.now()}`,
      workflowId: wf.id,
      workflowName: wf.name,
      status: "success",
      triggeredBy: body.triggeredBy || "Automated Operator",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 720,
      stepResults: wf.steps.map((s) => ({
        stepId: s.id,
        action: s.actionType,
        status: "success",
        output: { status: "Verified without exception" },
      })),
    };

    return NextResponse.json({
      success: true,
      message: `Workflow '${wf.name}' executed successfully.`,
      data: execution,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to execute workflow" },
      { status: 400 }
    );
  }
}

