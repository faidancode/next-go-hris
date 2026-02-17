// lib/hydrate-auth.ts

import { AuthUser } from "@/types";
import { apiRequest, unwrapEnvelope } from "./api/fetcher";

export async function fetchMe(): Promise<AuthUser> {
  const res = await apiRequest<AuthUser>("/auth/me");
  return unwrapEnvelope(res);
}
