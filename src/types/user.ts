export type UserRole = "ADMIN" | "HR" | "ENDUSER";

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: UserRole;
}

export const roleColors: Record<UserRole, { bg: string; text: string }> = {
  ADMIN: { bg: "bg-purple-100", text: "text-purple-800" },
  HR: { bg: "bg-blue-100", text: "text-blue-800" },
  ENDUSER: { bg: "bg-gray-100", text: "text-gray-800" },
};

export const roleLabels: Record<UserRole, string> = {
  ADMIN: "총관리자",
  HR: "인사관리자",
  ENDUSER: "직원",
};
