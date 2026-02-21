export type UserRole = "Admin" | "QC" | "Maintenance" | "Supervisor" | "Staff";

export interface AuthUser {
  id: string;
  organizationId: string;
  factoryId: string | null;
  role: UserRole;
  email: string;
}
