"use client";

export type LeaveType = "ANNUAL" | "SICK" | "UNPAID";
export type LeaveStatus =
  | "PENDING"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type Leave = {
  id: string;
  employee_id: string;
  employee_name?: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  total_days?: number;
  reason?: string;
  status: LeaveStatus;
  approved_by?: string | null;
  rejection_reason?: string | null;
};
