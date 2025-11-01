import type { Timestamp } from "firebase/firestore";

export type UserRole = "lawyer" | "client" | "assistant" | "admin";

export interface User {
  uid: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  bar_id?: string;
  created_at: Date;
  profile_pic: string;
  last_login: Date;
}

export type CaseType = "civil" | "criminal" | "corporate" | "property" | "family";
export type CaseStatus = "open" | "in-progress" | "closed";

export interface Case {
  case_id: string;
  title: string;
  case_type: CaseType;
  status: CaseStatus;
  lawyer_id: string; // Reference to users.uid
  client_id: string; // Reference to users.uid
  court_name: string;
  filing_date: Date;
  next_hearing?: Date;
  description: string;
  created_at: Date;
  last_updated: Date;
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
