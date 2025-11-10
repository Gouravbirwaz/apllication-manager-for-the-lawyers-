

import type { Timestamp } from "firebase/firestore";

export type UserRole = "lawyer" | "client" | "assistant" | "admin" | "main";

export interface User {
  id: number;
  name: string; 
  email: string;
  phone_number: string; 
  address?: string;
  organization?: string;
  created_at: string;
  updated_at: string;
  total_case_handled?: number;
  role?: UserRole;
  photo_url?: string;
  // Fields from old mock data, can be cleaned up later
  profile_pic?: string; // Covered by photo_url
  uid?: string; // Covered by id
  bar_id?: string;
  last_login?: Date;
  full_name?: string; // Covered by name
}


export type CaseType = "civil" | "criminal" | "corporate" | "property" | "family" | "Civil";
export type CaseStatus = "open" | "in-progress" | "closed";

export interface Case {
  id: number;
  case_title: string;
  case_type: CaseType;
  status: CaseStatus;
  next_hearing?: Date;
  created_at: string;
  updated_at: string;
  client: User;
  lawyer_id?: number;
  // Fields for component compatibility
  case_id: string; // for compatibility with existing components
  title: string; // for compatibility with existing components
  filing_date: Date; // for compatibility
  description?: string;
  lawyer?: User; // This will be populated manually after fetching
  advocate_id?: number;
}

export interface Document {
  id: number;
  filename: string;
  url: string; // This will be the download/preview URL
}

export interface Hearing {
  hearing_id: string;
  case_id: string; // Reference to cases.case_id
  date: Date;
  court_room: string;
  remarks: string;
  notified: boolean;
  case_title?: string; // Denormalized for easier display
}

export type TaskStatus = "pending" | "in-progress" | "done";

export interface Task {
  task_id: string;
  assigned_to: string; // Reference to users.uid
  case_id: string; // Reference to cases.case_id
  title: string;
  description: string;
  status: TaskStatus;
  due_date: Date;
  created_at: Date;
  case_title?: string; // Denormalized for easier display
}

export interface Notification {
  notif_id: string;
  user_id: string; // Reference to users.uid
  title: string;
  message: string;
  type: "hearing" | "document" | "system";
  timestamp: Date;
  read: boolean;
}


export interface AdvocatePayment {
  id: string;
  advocate_id: string;
  name: string; // Denormalized from User
  email: string; // Denormalized from User
  cases: number;
  billable_hours: number;
  total: number; // Corresponds to `amount` from backend
  status: 'pending' | 'paid';
  case_id?: number; // Added to link payment to a specific case/client
  client_id?: number;
}

export interface Invoice {
  id: number;
  client_id: number;
  case_id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  status: "Pending" | "Paid" | "Overdue";
  description?: string;
  client?: User; // Optional, to be populated on the frontend
}
