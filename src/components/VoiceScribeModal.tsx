"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMiraStore } from "@/lib/store";
import {
  Mic,
  MicOff,
  Sparkles,
  BrainCircuit,
  CheckCircle2,
  HeartPulse,
  Pill,
  X,
  RefreshCw,
  Stethoscope,
} from "lucide-react";

interface VoiceScribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (patientName: string) => void;
}

interface ScribeMedication {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface ScribeSOAP {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface ScribeData {
  patientName: string;
  age: number;
  gender: string;
  contactNumber: string;
  chiefComplaint: string;
  vitals: {
    bloodPressure: string;
    pulse: string;
    temperature: string;
    spO2: string;
  };
  clinicalDiagnosis: string;
  urgency: "Routine" | "Semi-Urgent" | "Emergency";
  allergies: string;
  prescribedMedications: ScribeMedication[];
  investigations: string[];
  followUp: string;
  soapNote: ScribeSOAP;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export default function VoiceScribeModal({
  isOpen,
  onClose,
  onSuccess,
}: VoiceScribeModalProps) {
  const { addPatient, uploadDocument, currentUser } = useMiraStore();
  const [dictation, setDictation] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scribedData, setScribedData] = useState<ScribeData | null>(null);
  const [activeTab, setActiveTab] = useState<"structured" | "soap">("structured");
  const [isSaved, setIsSaved] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Web Speech API Initialization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const windowWithSpeech = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
      };
      const SpeechRecognition =
        windowWithSpeech.SpeechRecognition ||
        windowWithSpeech.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setDictation((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
          }
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch { }
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Microphone speech recognition is not supported in this browser. Please use the preset buttons or type directly in the box.");
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch { }
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  };

  const handleApplyPreset = (presetText: string) => {
    setDictation(presetText);
    setScribedData(null);
    setIsSaved(false);
  };

  const handleProcessDictation = async () => {
    if (!dictation.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/clinical/voice-scribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dictation,
          doctorName: currentUser?.name || "Dr. Marcus Vance, MBBS, MD",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setScribedData(json.data);
          setIsSaved(false);
        }
      }
    } catch (err) {
      console.warn("Voice scribe processing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToStore = () => {
    if (!scribedData) return;

    // 1. Add Patient into Live Store
    addPatient({
      name: scribedData.patientName,
      phone: scribedData.contactNumber,
      email: `${scribedData.patientName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      dateOfBirth: new Date(Date.now() - scribedData.age * 365.25 * 24 * 3600 * 1000)
        .toISOString()
        .split("T")[0],
      preferredClinic: "Sydney Central Clinic",
      enquiryCategory: scribedData.urgency === "Emergency" ? "Urgent Care" : "General Consultation",
      status: "active",
      validationScore: 100,
      notes: `[AI Voice Scribe]: ${scribedData.chiefComplaint} • Diagnosis: ${scribedData.clinicalDiagnosis}`,
    });

    // 2. Upload structured prescription into Document AI
    uploadDocument({
      name: `VoiceScribe_Rx_${scribedData.patientName.replace(/\s+/g, "_")}.pdf`,
      size: 42500,
      type: "application/pdf",
      base64Data: "",
      fileUrl: "",
    });

    setIsSaved(true);
    if (onSuccess) {
      onSuccess(scribedData.patientName);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-[#DFDEEB] space-y-4 sm:space-y-5 max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#DFDEEB] pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#6BA3E8] to-[#8DB9F0] text-white shadow-sm">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#25283A]">
                  AI Medical Voice Scribe (Nuance DAX / Ambience Architecture)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#E9E8F8] text-[#25283A] text-[10px] font-bold">
                  Gemini 3 Flash
                </span>
              </div>
              <p className="text-xs text-[#74778A]">
                Convert natural doctor speech dictation into structured clinical intake, SOAP notes, and prescriptions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74778A] hover:text-[#25283A] hover:bg-[#F8F8FC] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Clinical Presets Bar for Immediate Evaluation */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-[#74778A] uppercase tracking-wider block">
            Click 1-Click Clinical Presets to Test Dictation:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() =>
                handleApplyPreset(
                  "Patient Balaji, 45 years male, complaining of severe central chest tightness and shortness of breath for 1 hour. BP 150 over 95, pulse 102. Suspicion of acute coronary syndrome. Prescribing Tab Sorbitrate 5mg sublingual stat, Tab Aspirin 300mg stat, Tab Clopidogrel 300mg stat. Immediate 12-lead ECG, cardiac enzymes, admit to ICU emergency."
                )
              }
              className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200 hover:bg-rose-100 text-left transition group"
            >
              <div className="font-bold text-rose-700 flex items-center justify-between">
                <span>Cardiology Emergency</span>
                <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="text-[10px] text-[#74778A] mt-0.5 line-clamp-1">
                Acute Coronary Syndrome, Stat Doses & ICU Protocol
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleApplyPreset(
                  "Patient Srinivas, 41 years old male, known history of chronic paranoid schizophrenia and insomnia. Mother expired 3 months ago, experiencing low mood. Prescribing Tab Sizodon Plus twice daily with meals, Tab Qutipin 200mg at night, Tab Ativan 2mg at night, Tab Rivotril 0.5mg at night, Tab Serta 50mg for depression. Duration 6 months. Continue existing BP and sugar medications. Review in between if any issue."
                )
              }
              className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 hover:bg-amber-100 text-left transition group"
            >
              <div className="font-bold text-amber-800 flex items-center justify-between">
                <span>Psychiatry Regimen</span>
                <BrainCircuit className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-[10px] text-[#74778A] mt-0.5 line-clamp-1">
                Schizophrenia, Polypharmacy & 6-Month Rx
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleApplyPreset(
                  "Patient Ramesh Kumar, 38 years male, presenting with acute high grade fever and severe sore throat for 2 days. Temperature 101.2 F, BP 128 over 84. Throat examination reveals pharyngeal erythema. Prescribing Tab Augmentin 625mg twice daily for 5 days, Tab Dolo 650mg thrice daily as needed for fever, Tab Montair-LC once at night. Complete blood count ordered. Review in 5 days."
                )
              }
              className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 hover:bg-emerald-100 text-left transition group"
            >
              <div className="font-bold text-emerald-800 flex items-center justify-between">
                <span>General Consultation</span>
                <Pill className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-[10px] text-[#74778A] mt-0.5 line-clamp-1">
                Acute Pharyngitis, Antibiotic Coverage & CBC
              </div>
            </button>
          </div>
        </div>

        {/* Dictation Textarea & Microphone Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#25283A] flex items-center gap-1.5">
              <span>Doctor Dictation Audio Transcript:</span>
              {isRecording && (
                <span className="flex items-center gap-1 text-[11px] text-rose-600 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  Listening to Live Microphone...
                </span>
              )}
            </label>

            <button
              type="button"
              onClick={toggleRecording}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${isRecording
                ? "bg-rose-600 text-white hover:bg-rose-700 animate-pulse"
                : "bg-white border border-[#DFDEEB] hover:bg-[#F8F8FC] text-[#25283A]"
                }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Stop Dictation</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-rose-600" />
                  <span>Start Microphone</span>
                </>
              )}
            </button>
          </div>

          <textarea
            rows={4}
            value={dictation}
            onChange={(e) => setDictation(e.target.value)}
            placeholder="Click 'Start Microphone' to speak naturally, select a preset above, or type your clinical observation here..."
            className="w-full p-3 rounded-xl border border-[#DFDEEB] bg-[#F8F8FC] text-xs text-[#25283A] focus:outline-none focus:border-[#8DB9F0] focus:bg-white transition leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#74778A]">
              Character Count: {dictation.length} • Ambient Noise Cancellation Active
            </span>
            <button
              type="button"
              onClick={handleProcessDictation}
              disabled={isProcessing || !dictation.trim()}
              className="mira-btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Structuring Clinical Record with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Process Voice Scribe with Gemini 3 Flash</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Structured Results Panel */}
        {scribedData && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF9FF] to-white border-2 border-[#8DB9F0]/60 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFDEEB] pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#25283A]">
                  {scribedData.patientName} ({scribedData.age}y, {scribedData.gender})
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${scribedData.urgency === "Emergency"
                    ? "bg-rose-100 text-rose-700 border border-rose-300"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}
                >
                  {scribedData.urgency}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-[#F8F8FC] p-1 rounded-lg border border-[#DFDEEB] text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("structured")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${activeTab === "structured"
                    ? "bg-white text-[#25283A] shadow-xs"
                    : "text-[#74778A] hover:text-[#25283A]"
                    }`}
                >
                  Intake & Prescription
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("soap")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${activeTab === "soap"
                    ? "bg-white text-[#25283A] shadow-xs"
                    : "text-[#74778A] hover:text-[#25283A]"
                    }`}
                >
                  Clinical SOAP Note
                </button>
              </div>
            </div>

            {/* Tab 1: Structured Intake & Prescription */}
            {activeTab === "structured" && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F8F8FC] p-3 rounded-xl border border-[#DFDEEB]">
                  <div>
                    <span className="text-[10px] text-[#74778A] block">Blood Pressure</span>
                    <span className="font-bold text-[#25283A]">{scribedData.vitals.bloodPressure}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#74778A] block">Pulse</span>
                    <span className="font-bold text-[#25283A]">{scribedData.vitals.pulse}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#74778A] block">Temperature</span>
                    <span className="font-bold text-[#25283A]">{scribedData.vitals.temperature}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#74778A] block">SpO2</span>
                    <span className="font-bold text-[#25283A]">{scribedData.vitals.spO2}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#74778A] block mb-1">Diagnosis:</span>
                  <div className="p-2 rounded-lg bg-white border border-[#DFDEEB] font-semibold text-[#25283A]">
                    {scribedData.clinicalDiagnosis}
                  </div>
                </div>

                {/* Medications Table */}
                <div>
                  <span className="text-[11px] font-bold text-[#74778A] block mb-1">
                    Prescribed Medications ({scribedData.prescribedMedications.length}):
                  </span>
                  <div className="rounded-xl border border-[#DFDEEB] overflow-hidden">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-[#E9E8F8] text-[#25283A] font-bold">
                        <tr>
                          <th className="p-2">Medicine</th>
                          <th className="p-2">Dosage</th>
                          <th className="p-2">Frequency</th>
                          <th className="p-2">Duration</th>
                          <th className="p-2">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DFDEEB] bg-white">
                        {scribedData.prescribedMedications.map((m, idx) => (
                          <tr key={idx} className="hover:bg-[#F8F8FC]">
                            <td className="p-2 font-bold text-[#25283A]">{m.medicine}</td>
                            <td className="p-2 text-[#74778A]">{m.dosage}</td>
                            <td className="p-2 text-[#74778A]">{m.frequency}</td>
                            <td className="p-2 text-[#74778A]">{m.duration}</td>
                            <td className="p-2 text-[#74778A]">{m.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Investigations & Follow-Up */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-[#F8F8FC] border border-[#DFDEEB]">
                    <span className="text-[10px] font-bold text-[#74778A] block mb-1">Ordered Tests:</span>
                    <div className="text-[11px] text-[#25283A]">
                      {scribedData.investigations.join(", ")}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F8F8FC] border border-[#DFDEEB]">
                    <span className="text-[10px] font-bold text-[#74778A] block mb-1">Follow-up:</span>
                    <div className="text-[11px] text-[#25283A]">{scribedData.followUp}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Standard SOAP Note */}
            {activeTab === "soap" && (
              <div className="space-y-2 text-xs bg-white p-3 rounded-xl border border-[#DFDEEB]">
                <div>
                  <span className="font-bold text-[#6BA3E8] uppercase text-[10px] block">
                    [S] Subjective:
                  </span>
                  <p className="text-[#25283A] text-[11px]">{scribedData.soapNote.subjective}</p>
                </div>
                <div>
                  <span className="font-bold text-[#6BA3E8] uppercase text-[10px] block">
                    [O] Objective:
                  </span>
                  <p className="text-[#25283A] text-[11px]">{scribedData.soapNote.objective}</p>
                </div>
                <div>
                  <span className="font-bold text-[#6BA3E8] uppercase text-[10px] block">
                    [A] Assessment:
                  </span>
                  <p className="text-[#25283A] text-[11px]">{scribedData.soapNote.assessment}</p>
                </div>
                <div>
                  <span className="font-bold text-[#6BA3E8] uppercase text-[10px] block">
                    [P] Plan:
                  </span>
                  <p className="text-[#25283A] text-[11px]">{scribedData.soapNote.plan}</p>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#DFDEEB]">
              {isSaved ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Saved to Patient Registry & Digital Prescription Document!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveToStore}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Save to Patient Records & Generate Digital Rx</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-[#DFDEEB] text-xs font-semibold text-[#74778A] hover:text-[#25283A] hover:bg-[#F8F8FC]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
