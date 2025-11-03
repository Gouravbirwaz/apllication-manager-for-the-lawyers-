import type { Timestamp } from "firebase/firestore";

export type UserRole = "lawyer" | "client" | "assistant" | "admin";

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  organization?: string;
  created_at: string;
  updated_at: string;
  // Fields from old mock data, can be cleaned up later
  role?: UserRole;
  photo_url?: string;
  profile_pic?: string;
  uid?: string;
  bar_id?: string;
  last_login?: Date;
  name?: string;
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
}

export interface Document {
  doc_id: string;
  case_id: string; // Reference to cases.case_id
  uploaded_by: string; // Reference to users.uid
  title: string;
  file_url: string;
  file_type: "pdf" | "docx" | "image";
  uploaded_at: Date;
  version: number;
  summary?: string;
  case_title?: string;
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
  name: string;
  email: string;
  cases: number;
  hours: number;
  rate: number;
  total: number;
  status: 'pending' | 'paid';
}
