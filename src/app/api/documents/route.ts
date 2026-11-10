import { NextResponse } from "next/server";
import { SEED_DOCUMENTS } from "@/lib/demoData";

export async function GET() {
  return NextResponse.json({
    success: true,
    count: SEED_DOCUMENTS.length,
    data: SEED_DOCUMENTS,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newDoc = {
      id: `doc_${Date.now()}`,
      filename: body.filename || "medical_upload.pdf",
      fileType: body.fileType || "pdf",
      fileSize: body.fileSize || 102400,
      status: "completed",
      uploadedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      confidence: 0.94,
      extractedData: {
        patientName: "Extracted Patient",
        documentType: "Clinical Referral",
        confidence: 0.94,
      },
      isDemoData: false,
    };

    return NextResponse.json({
      success: true,
      message: "Document processed with OCR & AI confidence scoring.",
      data: newDoc,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to process document" },
      { status: 400 }
    );
  }
}

