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
