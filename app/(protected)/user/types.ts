"use client";

export type User = {
  id: string;
  employee_id: string;
  email: string;
  is_active: boolean;
  full_name?: string; 
  created_at: string;
  updated_at?: string;
};
