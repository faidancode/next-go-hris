// src/constants/auth.ts
export const AUTH_COOKIES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  AUTH_USER_COOKIE: "auth_user",
  COOKIE_MAX_AGE: 60 * 60 * 24 * 7, // 7 days in seconds
} as const;
