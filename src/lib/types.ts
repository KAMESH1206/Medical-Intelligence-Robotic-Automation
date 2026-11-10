export type State = "QLD" | "NSW" | "VIC" | "SA" | "WA" | "TAS" | "NT" | "ACT";

export type PracticeStatus =
  | "new"
  | "contacted"
  | "replied"
  | "not_interested";

export type TeamSize = "solo" | "small" | "medium" | "large";

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
  teamSizeEstimate?: TeamSize;
  telehealth?: boolean;
  bulkBilling?: boolean;
  specialties?: string[];
  practitionerCount?: number;
  yearEstablished?: number;
  fitScore?: number; // 0-100
  scoreReason?: string;
  lastContacted?: string; // ISO date
  notes?: string;
  status: PracticeStatus;
  draftEmail?: string;
};

export type ScoredPractice = Practice & {
  fitScore: number;
  scoreReason: string;
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
  highFit: number; // score >= 70
};
