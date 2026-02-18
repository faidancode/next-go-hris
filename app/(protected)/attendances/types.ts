"use client";

export type Attendance = {
  id: string;
  company_id: string;
  employee_id: string;
  attendance_date: string;
  clock_in: string;
  clock_out?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  source: string;
  external_ref?: string | null;
  notes?: string | null;
};

