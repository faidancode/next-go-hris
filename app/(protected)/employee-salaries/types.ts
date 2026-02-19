"use client";

export type EmployeeSalary = {
  id: string;
  company_id?: string;
  employee_id: string;
  employee_name?: string;
  base_salary: number;
  effective_date: string;
  created_at?: string;
  updated_at?: string;
};

