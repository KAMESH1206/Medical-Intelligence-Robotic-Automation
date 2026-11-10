// --- Legacy & Compatibility Types ---
export type State = "QLD" | "NSW" | "VIC" | "SA" | "WA" | "TAS" | "NT" | "ACT";
export type PracticeStatus = "new" | "contacted" | "replied" | "not_interested";
export type Practice = {
  id: string;
  name: string;
  suburb: string;
  state: State;
  postcode: string;
  phone?: string;
  email?: string;
  website?: string;
  lat?: number;
  lng?: number;
  services?: string[];
  teamSizeEstimate?: "solo" | "small" | "medium" | "large";
  telehealth?: boolean;
  bulkBilling?: boolean;
  specialties?: string[];
  practitionerCount?: number;
  yearEstablished?: number;
  fitScore?: number;
  scoreReason?: string;
  notes?: string;
  status: PracticeStatus;
};
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
export type DashboardStats = {
  total: number;
  avgScore: number;
  contacted: number;
  replied: number;
  highFit: number;
};


// --- Auth & Users ---
export type Role =
  | "super_admin"
  | "healthcare_admin"
  | "data_coordinator"
  | "operations_executive"
  | "viewer";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  lastLogin?: string;
};

// --- Dashboard ---
export type DashboardMetric = {
  label: string;
  value: number;
  change?: number;  // % change vs previous period
  changeType?: "increase" | "decrease" | "neutral";
  icon?: string;
};

export type ActivityItem = {
  id: string;
  type:
  | "patient_enquiry"
  | "document_processed"
  | "validation_error"
  | "workflow_executed"
  | "appointment_created"
  | "duplicate_detected"
  | "ai_extraction";
  message: string;
  timestamp: string;
  status?: "success" | "warning" | "error" | "info";
  userId?: string;
};

// --- Patients ---
export type PatientStatus = "active" | "pending_review" | "incomplete" | "rejected";

export type Patient = {
  id: string;
  referenceId: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  preferredClinic?: string;
  enquiryCategory?: string;
  notes?: string;
  status: PatientStatus;
  validationScore?: number;
  missingFields?: string[];
  createdAt: string;
  updatedAt: string;
  isDemoData?: boolean;
};

// --- Documents ---
export type DocumentStatus =
  | "uploaded"
  | "processing"
  | "completed"
  | "needs_review"
  | "failed"
  | "rejected";

export type Document = {
  id: string;
  filename: string;
  fileType: "pdf" | "png" | "jpg" | "jpeg";
  fileSize: number;
  status: DocumentStatus;
  uploadedAt: string;
  processedAt?: string;
  patientId?: string;
  extractedData?: Record<string, unknown>;
  confidence?: number;
  ocrText?: string;
  missingFields?: string[];
  errorMessage?: string;
  isDemoData?: boolean;
};

// --- Data Quality ---
export type ValidationSeverity = "error" | "warning" | "info";

export type ValidationIssue = {
  id: string;
  recordId: string;
  recordType: "patient" | "document" | "appointment" | "provider";
  field: string;
  issue: string;
  severity: ValidationSeverity;
  value?: string;
  resolvedAt?: string;
  resolvedBy?: string;
};

export type DuplicateCandidate = {
  id: string;
  record1Id: string;
  record1Name: string;
  record2Id: string;
  record2Name: string;
  similarityScore: number;
  matchFields: string[];
  status: "pending" | "confirmed_duplicate" | "not_duplicate";
  createdAt: string;
};

export type QualitySummary = {
  total: number;
  valid: number;
  invalid: number;
  duplicateCandidates: number;
  missingFields: number;
  validationErrors: number;
};

// --- Appointments ---
export type AppointmentStatus =
  | "requested"
  | "pending_approval"
  | "confirmed"
  | "rescheduled"
  | "cancelled"
  | "completed";

export type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  clinicId?: string;
  clinicName?: string;
  preferredDate: string;
  preferredTime?: string;
  appointmentType?: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  isDemoData?: boolean;
};

// --- Providers ---
export type Provider = {
  id: string;
  clinicName: string;
  providerName?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  category?: string;
  state?: string;
  suburb?: string;
  sourceUrl?: string;
  collectedAt: string;
  status: "active" | "pending_review" | "inactive";
  isDemoData?: boolean;
};

// --- AI & Prompts ---
export type ConfidenceLevel = "high" | "medium" | "low" | "unknown";

export type AIExtraction = {
  field: string;
  value: string | null;
  confidence: number; // 0-1
  confidenceLevel: ConfidenceLevel;
  reasoning?: string;
  missing: boolean;
};

export type PromptVersion = {
  id: string;
  name: string;
  version: number;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  category: "intake" | "document" | "classification" | "summary" | "email";
  createdAt: string;
  isActive: boolean;
};

export type PromptExecution = {
  id: string;
  promptId: string;
  promptVersion: number;
  input: string;
  output: string;
  isValidJson: boolean;
  fieldsExtracted: number;
  fieldsMissing: number;
  processingMs: number;
  tokensUsed?: number;
  createdAt: string;
};

export type PromptEvaluation = {
  promptId: string;
  promptVersion: number;
  totalRuns: number;
  validJsonRate: number;
  avgFieldsExtracted: number;
  avgFieldsMissing: number;
  avgProcessingMs: number;
  successRate: number;
};

// --- Workflows ---
export type WorkflowTrigger =
  | "new_patient_enquiry"
  | "document_uploaded"
  | "duplicate_detected"
  | "missing_information"
  | "appointment_requested"
  | "document_processing_failed"
  | "pending_approval";

export type WorkflowActionType =
  | "ai_classify"
  | "ai_summarize"
  | "ai_extract"
  | "send_email"
  | "send_whatsapp"
  | "create_task"
  | "validate_record"
  | "log_audit"
  | "notify_admin"
  | "human_review";

export type WorkflowStep = {
  id: string;
  order: number;
  actionType: WorkflowActionType;
  config: Record<string, unknown>;
  retryable: boolean;
};

export type WorkflowStatus = "active" | "inactive" | "draft";
export type ExecutionStatus = "running" | "success" | "failed" | "pending_human";

export type Workflow = {
  id: string;
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  createdAt: string;
  lastExecutedAt?: string;
  totalExecutions: number;
  successfulExecutions: number;
};

export type WorkflowExecution = {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  triggeredBy: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  stepResults: Array<{
    stepId: string;
    action: WorkflowActionType;
    status: "success" | "failed" | "skipped";
    output?: unknown;
    errorMessage?: string;
  }>;
  error?: string;
};

// --- Email ---
export type EmailStatus = "sent" | "failed" | "pending" | "bounced";

export type EmailLog = {
  id: string;
  to: string;
  subject: string;
  templateId?: string;
  status: EmailStatus;
  sentAt?: string;
  errorMessage?: string;
  workflowId?: string;
};

// --- Audit ---
export type AuditAction =
  | "user_login"
  | "user_logout"
  | "record_created"
  | "record_updated"
  | "record_deleted"
  | "document_uploaded"
  | "document_approved"
  | "ai_execution"
  | "workflow_executed"
  | "export_csv"
  | "settings_changed";

export type AuditLog = {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
};

// --- API Responses ---
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type PaginationParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
