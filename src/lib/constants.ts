import type { Role } from "./types";

// ============================================
// MIRA Ops Intelligence — Constants & Defaults
// ============================================

export const BRAND_COLORS = {
  primary: "#8DB9F0",       // Powder Blue
  primaryDark: "#6BA3E8",
  primaryLight: "#C5DBFA",
  secondary: "#E9E8F8",     // Soft Lavender White
  accent: "#F5B69E",        // Warm Sunset Peach
  accentDark: "#EE9478",
  background: "#F8F8FC",
  surface: "#FFFFFF",
  text: "#25283A",
  muted: "#74778A",
  subtle: "#9699AA",
  border: "#DFDEEB",
  success: "#248A63",
  warning: "#D99035",
  error: "#D65B62",
} as const;

export const ROLES = [
  { value: "super_admin", label: "Super Admin", badge: "mira-badge-peach" },
  { value: "healthcare_admin", label: "Healthcare Administrator", badge: "mira-badge-blue" },
  { value: "data_coordinator", label: "Data Coordinator", badge: "mira-badge-green" },
  { value: "operations_executive", label: "Operations Executive", badge: "mira-badge-yellow" },
  { value: "viewer", label: "Viewer", badge: "mira-badge-gray" },
] as const;

export interface RolePermissionConfig {
  label: string;
  badge: string;
  color: string;
  scopeSummary: string;
  allowedRoutes: string[];
  canAddPatient: boolean;
  canDeletePatient: boolean;
  canApproveDocument: boolean;
  canResolveDuplicates: boolean;
  canExecuteWorkflows: boolean;
  canRunPromptTests: boolean;
  canEditSettings: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissionConfig> = {
  super_admin: {
    label: "Super Admin",
    badge: "mira-badge-peach",
    color: "#EE9478",
    scopeSummary: "Full Unrestricted Access • Clinical, Robotic & Prompt Lab Authority",
    allowedRoutes: [
      "/dashboard",
      "/patients",
      "/documents",
      "/data-quality",
      "/appointments",
      "/providers",
      "/ai-assistant",
      "/automation",
      "/analytics",
      "/prompt-lab",
      "/audit-logs",
      "/settings",
    ],
    canAddPatient: true,
    canDeletePatient: true,
    canApproveDocument: true,
    canResolveDuplicates: true,
    canExecuteWorkflows: true,
    canRunPromptTests: true,
    canEditSettings: true,
  },
  healthcare_admin: {
    label: "Healthcare Administrator",
    badge: "mira-badge-blue",
    color: "#6BA3E8",
    scopeSummary: "Clinical Operations Lead • Patient Intake & Medical Document Approvals",
    allowedRoutes: [
      "/dashboard",
      "/patients",
      "/documents",
      "/data-quality",
      "/appointments",
      "/providers",
      "/ai-assistant",
      "/automation",
      "/analytics",
      "/audit-logs",
      "/settings",
    ],
    canAddPatient: true,
    canDeletePatient: false,
    canApproveDocument: true,
    canResolveDuplicates: true,
    canExecuteWorkflows: true,
    canRunPromptTests: false,
    canEditSettings: false,
  },
  data_coordinator: {
    label: "Data Coordinator",
    badge: "mira-badge-green",
    color: "#248A63",
    scopeSummary: "Data Quality Specialist • Duplicate Reconciliation & Directory Curation",
    allowedRoutes: [
      "/dashboard",
      "/patients",
      "/documents",
      "/data-quality",
      "/appointments",
      "/providers",
      "/ai-assistant",
      "/analytics",
    ],
    canAddPatient: true,
    canDeletePatient: false,
    canApproveDocument: false,
    canResolveDuplicates: true,
    canExecuteWorkflows: false,
    canRunPromptTests: false,
    canEditSettings: false,
  },
  operations_executive: {
    label: "Operations Executive",
    badge: "mira-badge-yellow",
    color: "#D99035",
    scopeSummary: "Robotic Automation Lead • Workflow Execution & Scheduling",
    allowedRoutes: [
      "/dashboard",
      "/patients",
      "/appointments",
      "/providers",
      "/ai-assistant",
      "/automation",
      "/analytics",
    ],
    canAddPatient: false,
    canDeletePatient: false,
    canApproveDocument: false,
    canResolveDuplicates: false,
    canExecuteWorkflows: true,
    canRunPromptTests: false,
    canEditSettings: false,
  },
  viewer: {
    label: "Viewer",
    badge: "mira-badge-gray",
    color: "#74778A",
    scopeSummary: "Read-Only Compliance Auditor • Zero Modification Rights",
    allowedRoutes: [
      "/dashboard",
      "/patients",
      "/documents",
      "/data-quality",
      "/appointments",
      "/providers",
      "/ai-assistant",
      "/automation",
      "/analytics",
      "/audit-logs",
    ],
    canAddPatient: false,
    canDeletePatient: false,
    canApproveDocument: false,
    canResolveDuplicates: false,
    canExecuteWorkflows: false,
    canRunPromptTests: false,
    canEditSettings: false,
  },
};

export const DEFAULT_USER = {
  id: "usr_001",
  name: "Dr. Sarah Mitchell",
  email: "sarah.mitchell@miraops.health",
  role: "healthcare_admin" as const,
  avatar: "SM",
  lastLogin: "2026-11-10T08:00:00Z",
};

export const CLINIC_LOCATIONS = [
  "Sydney Central Clinic",
  "Melbourne Health Hub",
  "Brisbane City Medical",
  "Adelaide Care Centre",
  "Perth General Practice",
  "Hobart Family Health",
  "Darwin Community Clinic",
  "Canberra Medical Centre",
];

export const ENQUIRY_CATEGORIES = [
  "New Patient Registration",
  "General Consultation",
  "Chronic Disease Management",
  "Specialist Referral",
  "Telehealth Appointment",
  "Prescription Renewal",
  "Health Assessment",
  "Allied Health Services",
];

export const SERVICE_TYPES = [
  "General Consultation",
  "Specialist Referral",
  "Telehealth Appointment",
  "Chronic Disease Management",
  "Prescription Renewal",
  "Health Assessment & Screening",
  "Cardiology Review",
  "Allied Health / Physiotherapy",
  "Dental Care Examination",
  "Pediatric Consultation",
];
