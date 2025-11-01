import type { User, Case, Document, Hearing, Task } from './types';

export const mockUsers: User[] = [
  {
    uid: 'user-lawyer-1',
    full_name: 'Aditi Sharma',
    email: 'a.sharma@nyayadeep.pro',
    role: 'lawyer',
    phone: '123-456-7890',
    bar_id: 'AS12345',
    created_at: new Date('2022-01-15T09:00:00Z'),
    profile_pic: 'https://picsum.photos/seed/avatar1/200/200',
    last_login: new Date(),
  },
  {
    uid: 'user-client-1',
    full_name: 'Rohan Mehta',
    email: 'r.mehta@example.com',
    role: 'client',
    phone: '098-765-4321',
    created_at: new Date('2023-03-20T14:30:00Z'),
    profile_pic: 'https://picsum.photos/seed/avatar2/200/200',
    last_login: new Date(),
  },
  {
    uid: 'user-assistant-1',
    full_name: 'Priya Singh',
    email: 'p.singh@nyayadeep.pro',
    role: 'assistant',
    phone: '111-222-3333',
    created_at: new Date('2022-02-01T11:00:00Z'),
    profile_pic: 'https://picsum.photos/seed/avatar3/200/200',
    last_login: new Date(),
  },
  {
    uid: 'user-admin-1',
    full_name: 'Vikram Rao',
    email: 'v.rao@nyayadeep.pro',
    role: 'admin',
    phone: '444-555-6666',
    created_at: new Date('2022-01-10T10:00:00Z'),
    profile_pic: 'https://picsum.photos/seed/avatar4/200/200',
    last_login: new Date(),
  },
];

const now = new Date();

export const mockCases: Case[] = [
  {
    case_id: 'case-001',
    title: 'Mehta v. Sharma',
    case_type: 'civil',
    status: 'in-progress',
    lawyer_id: 'user-lawyer-1',
    client_id: 'user-client-1',
    court_name: 'High Court of Delhi',
    filing_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    next_hearing: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    description: 'A complex civil litigation case concerning intellectual property rights of a new technology.',
    created_at: new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000),
    last_updated: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    case_id: 'case-002',
    title: 'State v. Gupta',
    case_type: 'criminal',
    status: 'open',
    lawyer_id: 'user-lawyer-1',
    client_id: 'user-client-1',
    court_name: 'District Court, Mumbai',
    filing_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    next_hearing: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    description: 'Criminal defense case involving alleged corporate fraud.',
    created_at: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
    last_updated: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    case_id: 'case-003',
    title: 'Patel Properties Dispute',
    case_type: 'property',
    status: 'closed',
    lawyer_id: 'user-lawyer-1',
    client_id: 'user-client-1',
    court_name: 'Property Court, Bangalore',
    filing_date: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000),
    description: 'A property dispute that was successfully settled out of court.',
    created_at: new Date(now.getTime() - 201 * 24 * 60 * 60 * 1000),
    last_updated: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
  },
];

export const mockDocuments: Document[] = [
  {
    doc_id: 'doc-001',
    case_id: 'case-001',
    uploaded_by: 'user-assistant-1',
    title: 'Initial Complaint Filing',
    file_url: '#',
    file_type: 'pdf',
    uploaded_at: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000),
    version: 1,
    summary: 'The initial complaint outlines the plaintiff\'s claims against the defendant regarding copyright infringement and seeks damages and injunctive relief. The document details the history of the intellectual property in question and provides evidence of the alleged infringement.'
  },
  {
    doc_id: 'doc-002',
    case_id: 'case-001',
    uploaded_by: 'user-client-1',
    title: 'Evidence Exhibit A',
    file_url: '#',
    file_type: 'image',
    uploaded_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    version: 1,
  },
  {
    doc_id: 'doc-003',
    case_id: 'case-002',
    uploaded_by: 'user-lawyer-1',
    title: 'Motion to Dismiss',
    file_url: '#',
    file_type: 'docx',
    uploaded_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    version: 2,
  },
];

export const mockHearings: Hearing[] = [
  {
    hearing_id: 'hear-001',
    case_id: 'case-001',
    date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    court_room: '5B',
    remarks: 'Preliminary hearing on motions.',
    notified: true,
    case_title: 'Mehta v. Sharma'
  },
  {
    hearing_id: 'hear-002',
    case_id: 'case-002',
    date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    court_room: '3A',
    remarks: 'Arraignment.',
    notified: false,
    case_title: 'State v. Gupta'
  },
   {
    hearing_id: 'hear-003',
    case_id: 'case-001',
    date: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
    court_room: '5B',
    remarks: 'Discovery conference.',
    notified: false,
    case_title: 'Mehta v. Sharma'
  },
];

export const mockTasks: Task[] = [
  {
    task_id: 'task-001',
    assigned_to: 'user-assistant-1',
    case_id: 'case-001',
    title: 'Draft witness statements',
    description: 'Interview key witnesses and draft their initial statements for review.',
    status: 'in-progress',
    due_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    case_title: 'Mehta v. Sharma'
  },
  {
    task_id: 'task-002',
    assigned_to: 'user-lawyer-1',
    case_id: 'case-001',
    title: 'Review opposition\'s motion',
    description: 'Analyze the motion to dismiss filed by the opposition and prepare a response strategy.',
    status: 'pending',
    due_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    case_title: 'Mehta v. Sharma'
  },
  {
    task_id: 'task-003',
    assigned_to: 'user-assistant-1',
    case_id: 'case-002',
    title: 'File discovery requests',
    description: 'Prepare and file formal discovery requests with the prosecution.',
    status: 'done',
    due_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    case_title: 'State v. Gupta'
  },
];
