export const ADMIN_ROLES = ["ADMIN", "SUPERADMIN", "GUESTADMIN"] as const;
export const SUPERADMIN_ONLY = ["SUPERADMIN"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];
