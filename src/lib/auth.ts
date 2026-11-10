import fs from "fs";
import path from "path";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "healthcare_admin" | "data_coordinator" | "operations_executive" | "viewer";
  avatar: string;
  organization?: string;
  createdAt?: string;
};

export type StoredUser = AuthUser & {
  password?: string;
  passwordHash?: string;
};

const USERS_FILE_PATH = path.join(process.cwd(), "data", "users.json");

export const INITIAL_ACCOUNTS: StoredUser[] = [
  {
    id: "usr_001",
    name: "Dr. Alexander Wright",
    email: "admin@miraops.health",
    password: "Password123!",
    role: "super_admin",
    avatar: "AW",
    organization: "St. Vincent Health Network",
    createdAt: "2026-11-01T08:00:00Z",
  },
  {
    id: "usr_002",
    name: "Dr. Sarah Mitchell",
    email: "sarah.mitchell@miraops.health",
    password: "Password123!",
    role: "healthcare_admin",
    avatar: "SM",
    organization: "Royal Melbourne Hospital",
    createdAt: "2026-11-02T09:00:00Z",
  },
  {
    id: "usr_003",
    name: "Elena Rostova",
    email: "coordinator@miraops.health",
    password: "Password123!",
    role: "data_coordinator",
    avatar: "ER",
    organization: "Sydney Health Sciences Center",
    createdAt: "2026-11-03T10:00:00Z",
  },
  {
    id: "usr_004",
    name: "Marcus Sterling",
    email: "ops.lead@miraops.health",
    password: "Password123!",
    role: "operations_executive",
    avatar: "MS",
    organization: "Brisbane Metropolitan Health",
    createdAt: "2026-11-04T11:00:00Z",
  },
];

export function getStoredUsers(): StoredUser[] {
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const data = fs.readFileSync(USERS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback if file read error
  }
  return INITIAL_ACCOUNTS;
}

export function saveStoredUsers(users: StoredUser[]): boolean {
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const normalized = email.trim().toLowerCase();
  const users = getStoredUsers();
  return users.find((u) => u.email.toLowerCase() === normalized);
}

export function createStoredUser(data: {
  name: string;
  email: string;
  password: string;
  role: AuthUser["role"];
  organization?: string;
}): AuthUser {
  const users = getStoredUsers();
  const normalized = data.email.trim().toLowerCase();

  const existing = users.find((u) => u.email.toLowerCase() === normalized);
  if (existing) {
    throw new Error("A healthcare operator with this email address is already registered.");
  }

  // Generate initials for avatar
  const parts = data.name.trim().split(" ").filter(Boolean);
  const avatar =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : (parts[0]?.slice(0, 2) || "MD").toUpperCase();

  const newUser: StoredUser = {
    id: `usr_${Date.now()}`,
    name: data.name.trim(),
    email: normalized,
    password: data.password,
    role: data.role,
    avatar,
    organization: data.organization?.trim() || "Independent Healthcare Provider",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveStoredUsers(users);

  // Return user without password
  const { password: _, ...cleanUser } = newUser;
  return cleanUser;
}
