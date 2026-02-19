"use client";

export type PayrollStatus = "draft" | "approved" | "paid" | "void";

export type PayrollComponent = {
  id: string;
  component_type: string;
  component_name: string;
  quantity: number;
  unit_amount: number;
  total_amount: number;
  notes?: string;
};

export type Payroll = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_name?: string;
  period_start: string;
  period_end: string;
  base_salary: number;
  total_allowance: number;
  overtime_hours: number;
  overtime_rate: number;
  total_overtime: number;
  total_deduction: number;
  allowance: number;
  deduction: number;
  net_salary: number;
  status: PayrollStatus;
  created_by: string;
  paid_at?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  payslip_url?: string | null;
  payslip_generated_at?: string | null;
  components?: PayrollComponent[];
};

export type PayrollBreakdownLine = {
  label: string;
  quantity?: number;
  unit_amount?: number;
  amount: number;
  notes?: string;
};

export type PayrollBreakdown = {
  payroll_id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  status: PayrollStatus;
  base_salary: PayrollBreakdownLine;
  allowances: PayrollBreakdownLine[];
  allowance_total: number;
  overtime: PayrollBreakdownLine;
  deductions: PayrollBreakdownLine[];
  deduction_total: number;
  net_salary: number;
};

export type CreatePayrollRequest = {
  employee_id: string;
  period_start: string;
  period_end: string;
  base_salary: number;
  allowance?: number;
  overtime_hours?: number;
  overtime_rate?: number;
  deduction?: number;
  allowance_items?: {
    component_name: string;
    quantity: number;
    unit_amount: number;
    notes?: string;
  }[];
  deduction_items?: {
    component_name: string;
    quantity: number;
    unit_amount: number;
    notes?: string;
  }[];
};

export type RegeneratePayrollRequest = Omit<
  CreatePayrollRequest,
  "employee_id" | "period_start" | "period_end"
>;


