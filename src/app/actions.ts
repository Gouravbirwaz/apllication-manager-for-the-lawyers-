
"use server";

import { analyzeLegalDocument as analyzeLegalDocumentFlow, LegalDocumentAnalysisInput, LegalDocumentAnalysisOutput } from "@/ai/flows/intelligent-document-summary";
import { askLegalAssistant as askLegalAssistantFlow, LegalAssistantInput } from "@/ai/flows/legal-assistant-flow";
import type { Case, AdvocatePayment, Invoice, Task } from "@/lib/types";
import { format } from "date-fns";

export async function analyzeLegalDocumentAction(input: LegalDocumentAnalysisInput): Promise<{ analysis: LegalDocumentAnalysisOutput } | { error: string }> {
  try {
    const output = await analyzeLegalDocumentFlow(input);
    return { analysis: output };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Failed to generate analysis." };
  }
}

export async function askLegalAssistantAction(input: LegalAssistantInput): Promise<{ answer: string } | { error: string }> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/query`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ question: input.question }),
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || "Failed to get answer from assistant.");
    }
    return { answer: result.answer };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Failed to get answer from assistant." };
  }
}

export async function updateCaseStatusAction(caseId: string, status: string): Promise<{ case: Case } | { error: string }> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/cases/${caseId}`;
    const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ status }),
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || "Failed to update case status.");
    }
    return { case: result.case };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Could not update case status." };
  }
}

export async function deleteCaseAction(caseId: string): Promise<{ success: boolean } | { error: string }> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/cases/${caseId}`;
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Failed to delete case.");
    }

    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Could not delete case." };
  }
}

export async function updateCaseAction(caseData: Partial<Case>): Promise<{ case: Case } | { error: string }> {
  if (!caseData.id) return { error: "Case ID is missing." };
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/cases/${caseData.id}`;
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(caseData),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to update case.");
    }
    return { case: result.case };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Could not update case." };
  }
}

export async function updatePaymentStatusAction(paymentIds: string[]): Promise<{ success: boolean; } | { error: string; }> {
    try {
        const updatePromises = paymentIds.map(id => {
            const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/${id}`;
            return fetch(apiUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify({ transaction_status: true }),
            });
        });

        const responses = await Promise.all(updatePromises);

        for (const response of responses) {
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || `Failed to update payment status for one or more payments.`);
            }
        }

        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "Could not update payment statuses." };
    }
}

// Payment CRUD actions
export async function addPaymentAction(paymentData: Omit<AdvocatePayment, 'id' | 'name' | 'email'>): Promise<{ payment: AdvocatePayment } | { error: string }> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify({
              advocate_id: paymentData.advocate_id,
              status: paymentData.status,
              cases: paymentData.case_id,
              billable_hours: paymentData.billable_hours,
              amount: paymentData.total,
              transaction_status: paymentData.status === 'paid',
            }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to add payment.');
        }
        return { payment: result.payment };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Could not add payment.' };
    }
}

export async function updatePaymentAction(paymentId: string, paymentData: Partial<AdvocatePayment>): Promise<{ payment: AdvocatePayment } | { error: string }> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/${paymentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify({
              advocate_id: paymentData.advocate_id,
              status: paymentData.status === 'paid' ? 'paid' : 'pending',
              transaction_status: paymentData.status === 'paid',
              cases: paymentData.case_id,
              billable_hours: paymentData.billable_hours,
              amount: paymentData.total,
            }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to update payment.');
        }
        return { payment: result.payment };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Could not update payment.' };
    }
}

export async function deletePaymentAction(paymentId: string): Promise<{ success: boolean } | { error: string }> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/${paymentId}`, {
            method: 'DELETE',
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Failed to delete payment.');
        }
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Could not delete payment.' };
    }
}

export async function uploadDocumentsAction(caseId: string, formData: FormData): Promise<{ files?: string[] } | { error: string }> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/${caseId}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'File upload failed.');
    }
    return { files: result.files };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Could not upload files.' };
  }
}

export async function deleteDocumentAction(docId: number): Promise<{ success: boolean } | { error: string }> {
    try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/documents/${docId}`;
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Failed to delete document.');
        }
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Could not delete document.' };
    }
}

export async function createInvoiceAction(invoiceData: Partial<Invoice>): Promise<{ invoice: Invoice } | { error: string }> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify(invoiceData),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to create invoice.');
        }
        return { invoice: result.invoice };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Could not create invoice.' };
    }
}

export async function sendInvoiceAction(invoiceId: number): Promise<{ success: boolean } | { error: string }> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/send_invoice/${invoiceId}`, {
            method: 'POST',
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to send invoice.');
        }
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Could not send invoice.' };
    }
}

// Task CRUD Actions
export async function createTaskAction(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<{ task: Task } | { error: string }> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify({
              ...taskData,
              due_date: format(new Date(taskData.due_date), 'yyyy-MM-dd'),
            }),
        });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || 'Failed to create task.');
        }
        const task = await response.json();
        return { task };
    } catch (e: any) {
        return { error: e.message || 'Could not create task.' };
    }
}

export async function updateTaskAction(taskId: number, taskData: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<{ task: Task } | { error: string }> {
    try {
        const body = { ...taskData };
        if (body.due_date) {
            body.due_date = format(new Date(body.due_date), 'yyyy-MM-dd');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || 'Failed to update task.');
        }
        const task = await response.json();
        return { task };
    } catch (e: any) {
        return { error: e.message || 'Could not update task.' };
    }
}

export async function deleteTaskAction(taskId: number): Promise<{ success: boolean } | { error: string }> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });
        if (response.status !== 204) {
            const result = await response.json();
            throw new Error(result.message || 'Failed to delete task.');
        }
        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'Could not delete task.' };
    }
}
