export type Role = "ADMIN" | "SUPERADMIN" | "GUESTADMIN";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type AuthMeData = {
  userId: string;
  name: string;
  email: string;
  role: Role;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};
