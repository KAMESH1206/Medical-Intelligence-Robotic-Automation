"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  User,
  Role,
  Patient,
  Document,
  Appointment,
  Provider,
  ValidationIssue,
  DuplicateCandidate,
  Workflow,
  WorkflowExecution,
  PromptVersion,
  PromptExecution,
  AuditLog,
} from "./types";
import {
  SEED_PATIENTS,
  SEED_DOCUMENTS,
  SEED_APPOINTMENTS,
  SEED_VALIDATION_ISSUES,
  SEED_DUPLICATE_CANDIDATES,
  SEED_WORKFLOWS,
  SEED_PROMPT_VERSIONS,
  SEED_PROMPT_EXECUTIONS,
  SEED_AUDIT_LOGS,
} from "./demoData";
import { DEFAULT_USER } from "./constants";

interface MiraStoreContextType {
  currentUser: User;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    organization?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setRole: (role: Role) => void;
  // Patients
  patients: Patient[];
  addPatient: (patient: Omit<Patient, "id" | "referenceId" | "createdAt" | "updatedAt">) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  // Documents
  documents: Document[];
  uploadDocument: (file: { name: string; size: number; type: string }) => Document;
  processDocument: (id: string) => Promise<Document>;
  approveDocument: (id: string) => void;
  rejectDocument: (id: string) => void;
  // Appointments
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => Appointment;
  updateAppointmentStatus: (id: string, status: Appointment["status"]) => void;
  // Quality & Duplicates
  validationIssues: ValidationIssue[];
  resolveValidationIssue: (id: string) => void;
  duplicateCandidates: DuplicateCandidate[];
  resolveDuplicate: (id: string, status: "confirmed_duplicate" | "not_duplicate") => void;
  // Providers
  providers: Provider[];
  collectProviders: (sourceUrl?: string) => Promise<number>;
  // Workflows
  workflows: Workflow[];
  workflowExecutions: WorkflowExecution[];
  runWorkflow: (workflowId: string) => Promise<WorkflowExecution>;
  // Prompt Lab
  promptVersions: PromptVersion[];
  promptExecutions: PromptExecution[];
  runPromptTest: (versionId: string, testInput: string) => Promise<PromptExecution>;
  // Audit Logs
  auditLogs: AuditLog[];
  logAudit: (action: AuditLog["action"], resourceType?: string, resourceId?: string, details?: Record<string, unknown>) => void;
  // Reset
  resetDemoData: () => void;
}

const MiraStoreContext = createContext<MiraStoreContextType | null>(null);

const STORAGE_KEY = "mira_ops_store_v1";

export function MiraStoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [patients, setPatients] = useState<Patient[]>(SEED_PATIENTS);
  const [documents, setDocuments] = useState<Document[]>(SEED_DOCUMENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(SEED_APPOINTMENTS);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>(SEED_VALIDATION_ISSUES);
  const [duplicateCandidates, setDuplicateCandidates] = useState<DuplicateCandidate[]>(SEED_DUPLICATE_CANDIDATES);
  const [providers, setProviders] = useState<Provider[]>([
    {
      id: "prv_001",
      clinicName: "Sydney Premier Health",
      providerName: "Dr. Andrew Wong",
      address: "124 Pitt Street, Sydney NSW 2000",
      phone: "(02) 9234 5678",
      email: "info@sydneypremierhealth.com.au",
      website: "https://sydneypremierhealth.com.au",
      category: "General Practice",
      state: "NSW",
      suburb: "Sydney",
      sourceUrl: "https://healthengine.com.au/sydney/gp",
      collectedAt: "2026-11-08T08:00:00Z",
      status: "active",
      isDemoData: true,
    },
    {
      id: "prv_002",
      clinicName: "Melbourne Specialists Care",
      providerName: "Dr. Fiona Campbell",
      address: "450 Collins St, Melbourne VIC 3000",
      phone: "(03) 9876 5432",
      email: "admin@melbournespecialists.com.au",
      website: "https://melbournespecialists.com.au",
      category: "Endocrinology",
      state: "VIC",
      suburb: "Melbourne",
      sourceUrl: "https://hotdoc.com.au/melbourne",
      collectedAt: "2026-11-09T08:00:00Z",
      status: "active",
      isDemoData: true,
    },
  ]);
  const [workflows, setWorkflows] = useState<Workflow[]>(SEED_WORKFLOWS);
  const [workflowExecutions, setWorkflowExecutions] = useState<WorkflowExecution[]>([]);
  const [promptVersions] = useState<PromptVersion[]>(SEED_PROMPT_VERSIONS);
  const [promptExecutions, setPromptExecutions] = useState<PromptExecution[]>(SEED_PROMPT_EXECUTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(SEED_AUDIT_LOGS);

  // Initialize from localStorage if present
  useEffect(() => {
    try {
      const isLoggedOut = localStorage.getItem("mira_logged_out") === "true";
      const savedUser = localStorage.getItem("mira_auth_user");
      if (savedUser && !isLoggedOut) {
        try {
          const u = JSON.parse(savedUser);
          if (u && u.email) {
            setCurrentUser(u);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.patients) setPatients(parsed.patients);
        if (parsed.documents) setDocuments(parsed.documents);
        if (parsed.appointments) setAppointments(parsed.appointments);
        if (parsed.validationIssues) setValidationIssues(parsed.validationIssues);
        if (parsed.duplicateCandidates) setDuplicateCandidates(parsed.duplicateCandidates);
        if (parsed.providers) setProviders(parsed.providers);
        if (parsed.workflows) setWorkflows(parsed.workflows);
        if (parsed.workflowExecutions) setWorkflowExecutions(parsed.workflowExecutions);
        if (parsed.promptExecutions) setPromptExecutions(parsed.promptExecutions);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      }
    } catch {
      // fallback to initial state
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Authentication failed" };
      }
      const u: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        avatar: data.user.avatar,
      };
      setCurrentUser(u);
      setIsAuthenticated(true);
      localStorage.removeItem("mira_logged_out");
      localStorage.setItem("mira_auth_user", JSON.stringify(u));
      logAudit("user_login", "user", u.id, { email: u.email, role: u.role });
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error occurred",
      };
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    organization?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || "Failed to create account" };
      }
      const u: User = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        avatar: result.user.avatar,
      };
      setCurrentUser(u);
      setIsAuthenticated(true);
      localStorage.removeItem("mira_logged_out");
      localStorage.setItem("mira_auth_user", JSON.stringify(u));
      logAudit("user_login", "user", u.id, {
        email: u.email,
        role: u.role,
        action: "registered_new_account",
      });
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error occurred",
      };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    logAudit("user_logout", "user", currentUser.id, { email: currentUser.email });
    setIsAuthenticated(false);
    localStorage.setItem("mira_logged_out", "true");
    localStorage.removeItem("mira_auth_user");
  };

  // Save changes
  const saveState = (updated: Record<string, unknown>) => {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      const parsed = current ? JSON.parse(current) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, ...updated }));
    } catch {
      // storage unavailable
    }
  };

  const setRole = (role: Role) => {
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    logAudit("settings_changed", "user", currentUser.id, { newRole: role });
  };

  const logAudit = (
    action: AuditLog["action"],
    resourceType?: string,
    resourceId?: string,
    details?: Record<string, unknown>
  ) => {
    const newLog: AuditLog = {
      id: `aud_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      resourceType,
      resourceId,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      saveState({ auditLogs: updated });
      return updated;
    });
  };

  const addPatient = (patientData: Omit<Patient, "id" | "referenceId" | "createdAt" | "updatedAt">) => {
    const nextNum = patients.length + 1;
    const refId = `MIRA-2026-${String(nextNum).padStart(3, "0")}`;
    const newPat: Patient = {
      ...patientData,
      id: `pat_${Date.now()}`,
      referenceId: refId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemoData: false,
    };
    setPatients((prev) => {
      const updated = [newPat, ...prev];
      saveState({ patients: updated });
      return updated;
    });
    logAudit("record_created", "patient", newPat.id, { name: newPat.name });
    return newPat;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
      saveState({ patients: updated });
      return updated;
    });
    logAudit("record_updated", "patient", id, updates);
  };

  const deletePatient = (id: string) => {
    setPatients((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveState({ patients: updated });
      return updated;
    });
    logAudit("record_deleted", "patient", id);
  };

  const uploadDocument = (file: { name: string; size: number; type: string }) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const newDoc: Document = {
      id: `doc_${Date.now()}`,
      filename: file.name,
      fileType: (["pdf", "png", "jpg", "jpeg"].includes(ext) ? ext : "pdf") as Document["fileType"],
      fileSize: file.size,
      status: "uploaded",
      uploadedAt: new Date().toISOString(),
      isDemoData: false,
    };
    setDocuments((prev) => {
      const updated = [newDoc, ...prev];
      saveState({ documents: updated });
      return updated;
    });
    logAudit("document_uploaded", "document", newDoc.id, { filename: newDoc.filename });
    return newDoc;
  };

  const processDocument = async (id: string): Promise<Document> => {
    // Set processing status
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "processing" as const } : d))
    );

    await new Promise((r) => setTimeout(r, 1200));

    // Simulated OCR & AI Extraction
    const mockExtraction = {
      patientName: "Validated Patient",
      dob: "1985-05-20",
      contactNumber: "0412 888 999",
      preferredClinic: "Sydney Central Clinic",
      summary: "Routine referral for allergy and immunology assessment",
      extractedFieldsCount: 5,
    };

    let updatedDoc: Document | undefined;
    setDocuments((prev) => {
      const updated = prev.map((d) => {
        if (d.id === id) {
          updatedDoc = {
            ...d,
            status: "completed" as const,
            processedAt: new Date().toISOString(),
            confidence: 0.94,
            extractedData: mockExtraction,
            ocrText: `REFERRAL LETTER\nDate: 2026-11-10\nPatient: Validated Patient\nDOB: 20/05/1985\nNotes: Referral for ongoing chronic management.`,
          };
          return updatedDoc;
        }
        return d;
      });
      saveState({ documents: updated });
      return updated;
    });

    logAudit("ai_execution", "document", id, { action: "ocr_ai_extraction", confidence: 0.94 });
    return updatedDoc!;
  };

  const approveDocument = (id: string) => {
    setDocuments((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, status: "completed" as const } : d));
      saveState({ documents: updated });
      return updated;
    });
    logAudit("document_approved", "document", id);
  };

  const rejectDocument = (id: string) => {
    setDocuments((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, status: "rejected" as const } : d));
      saveState({ documents: updated });
      return updated;
    });
    logAudit("record_updated", "document", id, { action: "reject" });
  };

  const addAppointment = (aptData: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemoData: false,
    };
    setAppointments((prev) => {
      const updated = [newApt, ...prev];
      saveState({ appointments: updated });
      return updated;
    });
    logAudit("record_created", "appointment", newApt.id, { patient: newApt.patientName });
    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: Appointment["status"]) => {
    setAppointments((prev) => {
      const updated = prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              updatedAt: new Date().toISOString(),
              confirmedAt: status === "confirmed" ? new Date().toISOString() : a.confirmedAt,
              cancelledAt: status === "cancelled" ? new Date().toISOString() : a.cancelledAt,
            }
          : a
      );
      saveState({ appointments: updated });
      return updated;
    });
    logAudit("record_updated", "appointment", id, { newStatus: status });
  };

  const resolveValidationIssue = (id: string) => {
    setValidationIssues((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      saveState({ validationIssues: updated });
      return updated;
    });
    logAudit("record_updated", "validation_issue", id, { action: "resolved" });
  };

  const resolveDuplicate = (id: string, status: "confirmed_duplicate" | "not_duplicate") => {
    setDuplicateCandidates((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, status } : d));
      saveState({ duplicateCandidates: updated });
      return updated;
    });
    logAudit("record_updated", "duplicate_candidate", id, { resolution: status });
  };

  const collectProviders = async (sourceUrl?: string): Promise<number> => {
    await new Promise((r) => setTimeout(r, 1000));
    const newProviders: Provider[] = [
      {
        id: `prv_${Date.now()}_1`,
        clinicName: "Brisbane North Family Medicine",
        providerName: "Dr. Rachel Evans",
        address: "78 Gympie Rd, Chermside QLD 4032",
        phone: "(07) 3350 1122",
        email: "reception@brisbanenorthmed.com.au",
        website: "https://brisbanenorthmed.com.au",
        category: "General Practice",
        state: "QLD",
        suburb: "Chermside",
        sourceUrl: sourceUrl || "https://healthengine.com.au/brisbane/gp",
        collectedAt: new Date().toISOString(),
        status: "active",
        isDemoData: false,
      },
      {
        id: `prv_${Date.now()}_2`,
        clinicName: "Perth West Medical Centre",
        providerName: "Dr. David Tremblay",
        address: "15 Hay Street, Subiaco WA 6008",
        phone: "(08) 9382 7700",
        website: "https://perthwestmedical.com.au",
        category: "General Practice",
        state: "WA",
        suburb: "Subiaco",
        sourceUrl: sourceUrl || "https://hotdoc.com.au/perth",
        collectedAt: new Date().toISOString(),
        status: "active",
        isDemoData: false,
      },
    ];

    setProviders((prev) => {
      const updated = [...newProviders, ...prev];
      saveState({ providers: updated });
      return updated;
    });

    logAudit("record_created", "provider_collection", undefined, { count: newProviders.length, source: sourceUrl });
    return newProviders.length;
  };

  const runWorkflow = async (workflowId: string): Promise<WorkflowExecution> => {
    const wf = workflows.find((w) => w.id === workflowId);
    const execId = `exec_${Date.now()}`;
    const startTime = new Date().toISOString();

    const execution: WorkflowExecution = {
      id: execId,
      workflowId,
      workflowName: wf ? wf.name : "Custom Workflow",
      status: "running",
      triggeredBy: currentUser.name,
      startedAt: startTime,
      stepResults: [],
    };

    setWorkflowExecutions((prev) => [execution, ...prev]);

    await new Promise((r) => setTimeout(r, 1000));

    const completedExecution: WorkflowExecution = {
      ...execution,
      status: "success",
      completedAt: new Date().toISOString(),
      durationMs: 850,
      stepResults: (wf?.steps || []).map((step) => ({
        stepId: step.id,
        action: step.actionType,
        status: "success",
        output: { result: "Executed successfully without exception" },
      })),
    };

    setWorkflowExecutions((prev) => {
      const updated = prev.map((e) => (e.id === execId ? completedExecution : e));
      saveState({ workflowExecutions: updated });
      return updated;
    });

    setWorkflows((prev) => {
      const updated = prev.map((w) =>
        w.id === workflowId
          ? {
              ...w,
              totalExecutions: w.totalExecutions + 1,
              successfulExecutions: w.successfulExecutions + 1,
              lastExecutedAt: new Date().toISOString(),
            }
          : w
      );
      saveState({ workflows: updated });
      return updated;
    });

    logAudit("workflow_executed", "workflow", workflowId, { executionId: execId, status: "success" });
    return completedExecution;
  };

  const runPromptTest = async (versionId: string, testInput: string): Promise<PromptExecution> => {
    const pv = promptVersions.find((p) => p.id === versionId) || promptVersions[2];
    const startTime = Date.now();

    await new Promise((r) => setTimeout(r, 800));

    let output = "";
    let isValidJson = false;
    let fieldsExtracted = 0;
    let fieldsMissing = 0;

    if (pv.version === 1) {
      output = `Extracted info:\nInput: ${testInput.slice(0, 40)}...\nDetected: Patient Name, Clinic Location`;
      isValidJson = false;
      fieldsExtracted = 2;
      fieldsMissing = 4;
    } else if (pv.version === 2) {
      const res = {
        name: "Identified Patient",
        phone: "0412 345 678",
        email: null,
        clinic: "Sydney Central Clinic",
        dob: null,
        category: "General Consultation",
      };
      output = JSON.stringify(res, null, 2);
      isValidJson = true;
      fieldsExtracted = 3;
      fieldsMissing = 3;
    } else {
      const res = {
        patientName: { value: "Identified Patient", confidence: 0.98, missing: false },
        phone: { value: "0412 345 678", confidence: 0.95, missing: false },
        email: { value: null, confidence: 0.0, missing: true },
        dateOfBirth: { value: null, confidence: 0.0, missing: true },
        preferredClinic: { value: "Sydney Central Clinic", confidence: 0.94, missing: false },
        enquiryCategory: { value: "General Consultation", confidence: 0.91, missing: false },
        overallConfidence: 0.945,
        requiresImmediateCare: false,
        extractionReasoning: "High-confidence entity extraction with explicit uncertainty flag for omitted fields.",
      };
      output = JSON.stringify(res, null, 2);
      isValidJson = true;
      fieldsExtracted = 4;
      fieldsMissing = 2;
    }

    const exec: PromptExecution = {
      id: `pe_${Date.now()}`,
      promptId: pv.id,
      promptVersion: pv.version,
      input: testInput,
      output,
      isValidJson,
      fieldsExtracted,
      fieldsMissing,
      processingMs: Date.now() - startTime,
      tokensUsed: pv.version === 1 ? 120 : pv.version === 2 ? 220 : 390,
      createdAt: new Date().toISOString(),
    };

    setPromptExecutions((prev) => {
      const updated = [exec, ...prev];
      saveState({ promptExecutions: updated });
      return updated;
    });

    logAudit("ai_execution", "prompt_lab", pv.id, { version: pv.version, durationMs: exec.processingMs });
    return exec;
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPatients(SEED_PATIENTS);
    setDocuments(SEED_DOCUMENTS);
    setAppointments(SEED_APPOINTMENTS);
    setValidationIssues(SEED_VALIDATION_ISSUES);
    setDuplicateCandidates(SEED_DUPLICATE_CANDIDATES);
    setWorkflows(SEED_WORKFLOWS);
    setWorkflowExecutions([]);
    setPromptExecutions(SEED_PROMPT_EXECUTIONS);
    setAuditLogs(SEED_AUDIT_LOGS);
    logAudit("settings_changed", "system", undefined, { action: "reset_to_seed_data" });
  };

  return (
    <MiraStoreContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAuthLoading,
        login,
        signup,
        logout,
        setRole,
        patients,
        addPatient,
        updatePatient,
        deletePatient,
        documents,
        uploadDocument,
        processDocument,
        approveDocument,
        rejectDocument,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        validationIssues,
        resolveValidationIssue,
        duplicateCandidates,
        resolveDuplicate,
        providers,
        collectProviders,
        workflows,
        workflowExecutions,
        runWorkflow,
        promptVersions,
        promptExecutions,
        runPromptTest,
        auditLogs,
        logAudit,
        resetDemoData,
      }}
    >
      {children}
    </MiraStoreContext.Provider>
  );
}

export function useMiraStore() {
  const ctx = useContext(MiraStoreContext);
  if (!ctx) throw new Error("useMiraStore must be used within MiraStoreProvider");
  return ctx;
}
