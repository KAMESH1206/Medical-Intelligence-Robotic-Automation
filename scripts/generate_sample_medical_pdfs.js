const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.resolve(__dirname, "../sample_documents");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function createReferralPDF() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  // Top header banner
  page.drawRectangle({
    x: 40,
    y: 760,
    width: 515,
    height: 50,
    color: rgb(0.12, 0.28, 0.55),
  });

  page.drawText("MIRA METRO MEDICAL CLINIC - CLINICAL REFERRAL", {
    x: 55,
    y: 780,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Department of General Practice & Primary Care | Provider # 448291X", {
    x: 55,
    y: 767,
    size: 9,
    font: fontRegular,
    color: rgb(0.85, 0.9, 1),
  });

  // Referring Doctor Info
  let y = 730;
  page.drawText("Date: 11 November 2026", { x: 40, y, size: 10, font: fontRegular });
  page.drawText("Urgency: ROUTINE", { x: 440, y, size: 10, font: fontBold, color: rgb(0.8, 0.2, 0.1) });

  y -= 25;
  page.drawText("TO: Dr. Sarah Jenkins (Cardiologist)", { x: 40, y, size: 11, font: fontBold });
  y -= 14;
  page.drawText("Sydney Cardiology & Heart Centre, Suite 402, Sydney", { x: 40, y, size: 9, font: fontRegular });

  y -= 25;
  page.drawText("FROM: Dr. Peter Collins (MBBS, FRACGP)", { x: 40, y, size: 11, font: fontBold });
  y -= 14;
  page.drawText("Sydney Central Clinic | Phone: (02) 9876 5432 | Email: reception@sydneycentral.com.au", { x: 40, y, size: 9, font: fontRegular });

  // Patient Details Box
  y -= 25;
  page.drawRectangle({
    x: 40,
    y: y - 55,
    width: 515,
    height: 70,
    color: rgb(0.96, 0.97, 0.99),
    borderColor: rgb(0.8, 0.85, 0.92),
    borderWidth: 1,
  });

  page.drawText("PATIENT DETAILS", { x: 50, y: y + 2, size: 9, font: fontBold, color: rgb(0.12, 0.28, 0.55) });
  y -= 15;
  page.drawText("Name: David Miller", { x: 50, y, size: 10, font: fontBold });
  page.drawText("DOB: 14/08/1982 (Age: 44)", { x: 230, y, size: 10, font: fontRegular });
  page.drawText("Gender: Male", { x: 420, y, size: 10, font: fontRegular });
  y -= 16;
  page.drawText("Phone: 0412 888 999", { x: 50, y, size: 10, font: fontRegular });
  page.drawText("Medicare #: 2345 67891 2", { x: 230, y, size: 10, font: fontRegular });
  page.drawText("Address: 42 Park Street, Sydney NSW", { x: 420, y, size: 9, font: fontRegular });

  // Referral Content
  y -= 50;
  page.drawText("REASON FOR REFERRAL: Investigation of atypical chest tightness & exertional dyspnea", {
    x: 40,
    y,
    size: 11,
    font: fontBold,
  });

  y -= 22;
  page.drawText("Clinical History & Background:", { x: 40, y, size: 10, font: fontBold });
  const historyLines = [
    "Dear Dr. Jenkins,",
    "",
    "Thank you for seeing David Miller, a 44-year-old corporate accountant with a 6-week history of episodic",
    "retrosternal chest discomfort occurring primarily upon brisk walking and mild exertion.",
    "The discomfort resolves within 5 minutes of resting. He has a family history of premature CAD (father had MI at 52).",
    "",
    "Current Medications:",
    "  - Perindopril 5mg daily (for primary hypertension)",
    "  - Atorvastatin 20mg nocte",
    "  - Aspirin 100mg daily",
    "",
    "Examination Findings:",
    "  - BP: 138/86 mmHg | Pulse: 72 bpm regular | SpO2: 98% on room air",
    "  - Cardiovascular: Dual heart sounds, no audible murmurs or gallop rhythm.",
    "  - Respiratory: Chest clear, vesicular breath sounds bilaterally.",
    "  - ECG performed today: Normal sinus rhythm, non-specific T-wave flattening in V5-V6.",
    "",
    "I would be grateful for your cardiology assessment, stress echocardiogram, and ongoing management plan.",
    "",
    "Kind regards,",
    "",
    "Dr. Peter Collins, MBBS, FRACGP",
    "Sydney Central Clinic [Signed Digitally]"
  ];

  for (const line of historyLines) {
    y -= 14;
    page.drawText(line, { x: 40, y, size: 9, font: fontRegular, color: rgb(0.15, 0.15, 0.18) });
  }

  // Footer
  page.drawText("CONFIDENTIAL MEDICAL COMMUNICATION - INTENDED SOLELY FOR HEALTHCARE PURPOSES", {
    x: 90,
    y: 35,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await doc.save();
  const filePath = path.join(OUTPUT_DIR, "1_Doctor_Referral_Letter_Cardiology.pdf");
  fs.writeFileSync(filePath, pdfBytes);
  console.log("Created:", filePath);
}

async function createIntakeFormPDF() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  // Header
  page.drawRectangle({
    x: 40,
    y: 760,
    width: 515,
    height: 50,
    color: rgb(0.18, 0.52, 0.44),
  });

  page.drawText("APOLLO HEALTHCARE - NEW PATIENT INTAKE FORM", {
    x: 55,
    y: 780,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Clinical Documentation & Patient Electronic Medical Record (EMR) Intake", {
    x: 55,
    y: 767,
    size: 9,
    font: fontRegular,
    color: rgb(0.9, 0.98, 0.95),
  });

  let y = 730;
  page.drawText("SECTION 1: PATIENT DEMOGRAPHICS", { x: 40, y, size: 11, font: fontBold, color: rgb(0.18, 0.52, 0.44) });
  
  y -= 15;
  const fields = [
    ["Full Legal Name:", "Emma Louise Watson", "Date of Birth:", "12/04/1988"],
    ["Gender / Pronouns:", "Female (She/Her)", "Marital Status:", "Married"],
    ["Residential Address:", "18 Campbell St, Surry Hills NSW 2010", "Postal Code:", "2010"],
    ["Contact Phone:", "0412 345 678", "Email Address:", "emma.watson@gmail.com"],
    ["Medicare Number:", "4582 91023 1 (Ref # 1)", "Private Insurance:", "Bupa Gold - Member # 9812401"],
  ];

  for (const row of fields) {
    y -= 16;
    page.drawText(row[0], { x: 40, y, size: 9, font: fontBold });
    page.drawText(row[1], { x: 155, y, size: 9, font: fontRegular });
    page.drawText(row[2], { x: 335, y, size: 9, font: fontBold });
    page.drawText(row[3], { x: 440, y, size: 9, font: fontRegular });
  }

  y -= 25;
  page.drawText("SECTION 2: EMERGENCY CONTACT", { x: 40, y, size: 11, font: fontBold, color: rgb(0.18, 0.52, 0.44) });
  y -= 16;
  page.drawText("Emergency Contact:", { x: 40, y, size: 9, font: fontBold });
  page.drawText("Arthur Watson (Spouse) - Phone: 0419 777 666", { x: 155, y, size: 9, font: fontRegular });

  y -= 25;
  page.drawText("SECTION 3: MEDICAL HISTORY & ALLERGIES", { x: 40, y, size: 11, font: fontBold, color: rgb(0.18, 0.52, 0.44) });
  y -= 16;
  page.drawText("Known Drug Allergies:", { x: 40, y, size: 9, font: fontBold, color: rgb(0.8, 0.2, 0.1) });
  page.drawText("PENICILLIN (Causes urticaria and facial swelling)", { x: 155, y, size: 9, font: fontBold, color: rgb(0.8, 0.2, 0.1) });

  y -= 16;
  page.drawText("Chronic Conditions:", { x: 40, y, size: 9, font: fontBold });
  page.drawText("Mild Seasonal Asthma, Hypothyroidism", { x: 155, y, size: 9, font: fontRegular });

  y -= 16;
  page.drawText("Current Medications:", { x: 40, y, size: 9, font: fontBold });
  page.drawText("Levothyroxine 50mcg daily, Ventolin PRN", { x: 155, y, size: 9, font: fontRegular });

  y -= 25;
  page.drawText("SECTION 4: CHIEF COMPLAINT / REASON FOR VISIT", { x: 40, y, size: 11, font: fontBold, color: rgb(0.18, 0.52, 0.44) });
  y -= 16;
  page.drawText("Reason for Visit: Annual health checkup and comprehensive metabolic panel screening.", { x: 40, y, size: 9, font: fontRegular });

  y -= 35;
  page.drawText("PATIENT CONSENT & SIGNATURE", { x: 40, y, size: 10, font: fontBold });
  y -= 14;
  page.drawText("I confirm that the information provided above is accurate to the best of my knowledge.", { x: 40, y, size: 8.5, font: fontRegular });
  y -= 25;
  page.drawText("Patient Signature: Emma Watson [Signed Electronically]", { x: 40, y, size: 9, font: fontBold });
  page.drawText("Date: 11/11/2026", { x: 420, y, size: 9, font: fontRegular });

  const pdfBytes = await doc.save();
  const filePath = path.join(OUTPUT_DIR, "2_Patient_Intake_Registration_Form.pdf");
  fs.writeFileSync(filePath, pdfBytes);
  console.log("Created:", filePath);
}

async function createPrescriptionPDF() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  // Top header banner
  page.drawRectangle({
    x: 40,
    y: 760,
    width: 515,
    height: 50,
    color: rgb(0.48, 0.22, 0.65),
  });

  page.drawText("KAUVERY HEALTH CLINIC - OFFICIAL PRESCRIPTION (Rx)", {
    x: 55,
    y: 780,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Prescribing Practitioner: Dr. Marcus Vance | Reg # MED-8821094 | PBS Provider", {
    x: 55,
    y: 767,
    size: 9,
    font: fontRegular,
    color: rgb(0.95, 0.9, 1),
  });

  let y = 730;
  page.drawText("Date of Issue: 11 November 2026", { x: 40, y, size: 10, font: fontRegular });
  page.drawText("Script Ref: RX-2026-99148", { x: 420, y, size: 10, font: fontBold });

  y -= 25;
  page.drawRectangle({
    x: 40,
    y: y - 40,
    width: 515,
    height: 50,
    color: rgb(0.98, 0.96, 1),
    borderColor: rgb(0.85, 0.8, 0.95),
    borderWidth: 1,
  });

  page.drawText("PATIENT:", { x: 50, y: y - 5, size: 9, font: fontBold, color: rgb(0.48, 0.22, 0.65) });
  page.drawText("KAMESH M R", { x: 110, y: y - 5, size: 10, font: fontBold });
  page.drawText("DOB: 12/03/1993", { x: 260, y: y - 5, size: 9, font: fontRegular });
  page.drawText("Phone: +91 63824 86456", { x: 380, y: y - 5, size: 9, font: fontRegular });

  y -= 22;
  page.drawText("Address: Kauvery Care Unit, Clinic Campus", { x: 50, y: y - 5, size: 9, font: fontRegular });
  page.drawText("Allergies: No Known Drug Allergies (NKDA)", { x: 260, y: y - 5, size: 9, font: fontBold, color: rgb(0.2, 0.6, 0.2) });

  y -= 50;
  page.drawText("Rx (PRESCRIPTION MEDICATIONS)", { x: 40, y, size: 14, font: fontBold, color: rgb(0.48, 0.22, 0.65) });

  const meds = [
    {
      name: "1. AMOXICILLIN 500mg CAPSULES",
      sig: "Sig: Take 1 capsule three times daily (every 8 hours) with meals.",
      qty: "Quantity: 20 capsules | Repeats: 0",
      ind: "Indication: Upper respiratory bacterial infection",
    },
    {
      name: "2. PARACETAMOL 500mg TABLETS",
      sig: "Sig: Take 1-2 tablets every 4-6 hours PRN for fever or pain (Max 4g/day).",
      qty: "Quantity: 50 tablets | Repeats: 1",
      ind: "Indication: Symptomatic pain and pyrexia relief",
    },
    {
      name: "3. METFORMIN HYDROCHLORIDE 500mg",
      sig: "Sig: Take 1 tablet twice daily with breakfast and dinner.",
      qty: "Quantity: 100 tablets | Repeats: 2",
      ind: "Indication: Glycemic maintenance",
    },
  ];

  for (const m of meds) {
    y -= 25;
    page.drawText(m.name, { x: 40, y, size: 11, font: fontBold });
    y -= 14;
    page.drawText(m.sig, { x: 55, y, size: 9, font: fontRegular });
    y -= 13;
    page.drawText(m.qty, { x: 55, y, size: 9, font: fontBold });
    y -= 13;
    page.drawText(m.ind, { x: 55, y, size: 8.5, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
  }

  y -= 50;
  page.drawText("DISPENSER WARNING: Substitution permitted unless otherwise indicated.", { x: 40, y, size: 8, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
  y -= 30;
  page.drawText("Doctor's Signature: Dr. Marcus Vance, MBBS, MD [VERIFIED PRESCRIPTION]", { x: 40, y, size: 10, font: fontBold });

  const pdfBytes = await doc.save();
  const filePath = path.join(OUTPUT_DIR, "3_Medical_Prescription_Slip.pdf");
  fs.writeFileSync(filePath, pdfBytes);
  console.log("Created:", filePath);
}

async function createLabReportPDF() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  // Top header banner
  page.drawRectangle({
    x: 40,
    y: 760,
    width: 515,
    height: 50,
    color: rgb(0.65, 0.18, 0.22),
  });

  page.drawText("METRO PATHOLOGY LABS - COMPREHENSIVE BLOOD PANEL", {
    x: 55,
    y: 780,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("NATA / ISO 15189 Accredited Medical Diagnostic Laboratory # 10482", {
    x: 55,
    y: 767,
    size: 9,
    font: fontRegular,
    color: rgb(1, 0.9, 0.9),
  });

  let y = 730;
  page.drawText("PATIENT: BALAVARSHINI", { x: 40, y, size: 10, font: fontBold });
  page.drawText("Specimen Date: 10 Nov 2026 08:30 AM", { x: 340, y, size: 9, font: fontRegular });
  y -= 14;
  page.drawText("DOB: 05/11/1998 | Gender: Female | ID: PAT-89252", { x: 40, y, size: 9, font: fontRegular });
  page.drawText("Report Date: 11 Nov 2026 11:45 AM", { x: 340, y, size: 9, font: fontRegular });
  y -= 14;
  page.drawText("Requested by: Dr. Sarah Jenkins (Cardiology)", { x: 40, y, size: 9, font: fontBold });

  y -= 25;
  page.drawText("TEST RESULTS & CLINICAL REFERENCE RANGES", { x: 40, y, size: 11, font: fontBold, color: rgb(0.65, 0.18, 0.22) });

  y -= 18;
  // Table Header
  page.drawRectangle({ x: 40, y: y - 5, width: 515, height: 20, color: rgb(0.93, 0.94, 0.96) });
  page.drawText("ANALYTE / TEST", { x: 50, y, size: 9, font: fontBold });
  page.drawText("RESULT", { x: 230, y, size: 9, font: fontBold });
  page.drawText("UNITS", { x: 310, y, size: 9, font: fontBold });
  page.drawText("REFERENCE RANGE", { x: 400, y, size: 9, font: fontBold });

  const tests = [
    ["Hemoglobin (Hb)", "13.8", "g/dL", "12.0 - 15.5", false],
    ["White Blood Cell Count (WBC)", "7.2", "x10^9/L", "4.0 - 11.0", false],
    ["Platelet Count", "265", "x10^9/L", "150 - 450", false],
    ["Fasting Blood Glucose", "98", "mg/dL", "70 - 99", false],
    ["HbA1c (Glycated Hemoglobin)", "5.4", "%", "< 5.7 (Normal)", false],
    ["Total Cholesterol", "215", "mg/dL", "< 200 (ELEVATED)", true],
    ["HDL Cholesterol (Good)", "58", "mg/dL", "> 50 (Desirable)", false],
    ["LDL Cholesterol (Calculated)", "135", "mg/dL", "< 100 (ELEVATED)", true],
    ["Triglycerides", "110", "mg/dL", "< 150 (Normal)", false],
    ["Serum Creatinine", "0.85", "mg/dL", "0.59 - 1.04", false],
    ["eGFR (Kidney Function)", "> 90", "mL/min/1.73m2", "> 60 (Normal)", false],
    ["C-Reactive Protein (CRP)", "1.2", "mg/L", "< 3.0 (Low risk)", false],
  ];

  for (const t of tests) {
    y -= 18;
    if (t[4]) {
      page.drawText(t[0], { x: 50, y, size: 9, font: fontBold, color: rgb(0.8, 0.1, 0.1) });
      page.drawText(t[1] + " *HIGH*", { x: 230, y, size: 9, font: fontBold, color: rgb(0.8, 0.1, 0.1) });
    } else {
      page.drawText(t[0], { x: 50, y, size: 9, font: fontRegular });
      page.drawText(t[1], { x: 230, y, size: 9, font: fontRegular });
    }
    page.drawText(t[2], { x: 310, y, size: 9, font: fontRegular });
    page.drawText(t[3], { x: 400, y, size: 8.5, font: fontRegular });
  }

  y -= 30;
  page.drawText("PATHOLOGIST COMMENT: Mild hyperlipidemia noted. Normal renal function and glycemic status.", {
    x: 40,
    y,
    size: 8.5,
    font: fontBold,
  });
  y -= 14;
  page.drawText("Report Authorized by: Dr. Evelyn Reed, FRCPA (Lead Consultant Chemical Pathologist)", {
    x: 40,
    y,
    size: 8.5,
    font: fontRegular,
  });

  const pdfBytes = await doc.save();
  const filePath = path.join(OUTPUT_DIR, "4_Pathology_Blood_Panel_Report.pdf");
  fs.writeFileSync(filePath, pdfBytes);
  console.log("Created:", filePath);
}

async function createDischargeSummaryPDF() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  // Top header banner
  page.drawRectangle({
    x: 40,
    y: 760,
    width: 515,
    height: 50,
    color: rgb(0.15, 0.35, 0.45),
  });

  page.drawText("ST. VINCENT'S HOSPITAL - CLINICAL DISCHARGE SUMMARY", {
    x: 55,
    y: 780,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Acute Medical Care Unit | Ward 4B | Medical Record Number: MRN-774129", {
    x: 55,
    y: 767,
    size: 9,
    font: fontRegular,
    color: rgb(0.9, 0.95, 1),
  });

  let y = 730;
  page.drawText("Patient Name: Robert Taylor", { x: 40, y, size: 10, font: fontBold });
  page.drawText("Admission Date: 06 Nov 2026", { x: 340, y, size: 9, font: fontRegular });
  y -= 14;
  page.drawText("DOB: 22/07/1965 (Age 61) | Male", { x: 40, y, size: 9, font: fontRegular });
  page.drawText("Discharge Date: 11 Nov 2026", { x: 340, y, size: 9, font: fontBold, color: rgb(0.1, 0.6, 0.2) });
  y -= 14;
  page.drawText("Attending Physician: Dr. Amanda Thorne, MD, FRACP", { x: 40, y, size: 9, font: fontBold });

  y -= 25;
  const sections = [
    { title: "PRIMARY DIAGNOSIS:", text: "Community-Acquired Pneumonia (Right Middle Lobe), fully resolved on IV antibiotics." },
    { title: "SECONDARY DIAGNOSES:", text: "Essential Hypertension, Type 2 Diabetes Mellitus." },
    { title: "HOSPITAL COURSE & SUMMARY:", text: "Patient admitted with fever 38.9C, productive cough, and right-sided pleuritic chest pain. Chest X-ray showed right middle lobe consolidation. Commenced on IV Ceftriaxone and Azithromycin with prompt clinical improvement. Afebrile for 72 hours, inflammatory markers normalized (CRP 84 -> 6 mg/L)." },
    { title: "DISCHARGE MEDICATIONS:", text: "1. Amoxicillin/Clavulanate 875/125mg PO BD to complete a 5-day oral step-down course.\n2. Metformin 500mg PO BD.\n3. Perindopril 5mg PO daily." },
    { title: "FOLLOW-UP & INSTRUCTIONS:", text: "- Follow up with General Practitioner within 7-10 days for clinical review.\n- Repeat Chest X-Ray recommended in 6 weeks to confirm complete radiological clearance.\n- Return immediately to Emergency if fever, shortness of breath, or chest pain recurs." }
  ];

  for (const s of sections) {
    page.drawText(s.title, { x: 40, y, size: 9.5, font: fontBold, color: rgb(0.15, 0.35, 0.45) });
    y -= 14;
    const lines = s.text.split("\n");
    for (const l of lines) {
      page.drawText(l, { x: 40, y, size: 8.5, font: fontRegular });
      y -= 12;
    }
    y -= 8;
  }

  y -= 20;
  page.drawText("Discharge Authorized by: Dr. Amanda Thorne [Electronic Sign-off]", { x: 40, y, size: 9.5, font: fontBold });

  const pdfBytes = await doc.save();
  const filePath = path.join(OUTPUT_DIR, "5_Hospital_Discharge_Summary.pdf");
  fs.writeFileSync(filePath, pdfBytes);
  console.log("Created:", filePath);
}

async function run() {
  console.log("Generating sample medical PDFs...");
  await createReferralPDF();
  await createIntakeFormPDF();
  await createPrescriptionPDF();
  await createLabReportPDF();
  await createDischargeSummaryPDF();
  console.log("All sample medical PDFs successfully created!");
}

run();

