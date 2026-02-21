import { apiClient } from "./client";

export type RegisterCompanyRequest = {
  company_name: string;
  company_email: string;
  admin_name: string;
  admin_email: string;
  password: string;
};

export async function registerCompany(data: RegisterCompanyRequest) {
  return apiClient.post("/auth/register-company", data);
}
