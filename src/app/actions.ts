
"use server";

import { analyzeLegalDocument as analyzeLegalDocumentFlow, LegalDocumentAnalysisInput, LegalDocumentAnalysisOutput } from "@/ai/flows/intelligent-document-summary";
import { askLegalAssistant as askLegalAssistantFlow, LegalAssistantInput } from "@/ai/flows/legal-assistant-flow";
import type { Case, AdvocatePayment } from "@/lib/types";

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
    const output = await askLegalAssistantFlow(input);
    return { answer: output.answer };
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
              cases: paymentData.cases,
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
              // Map frontend fields to backend fields
              ...paymentData.advocate_id && { advocate_id: paymentData.advocate_id },
              ...paymentData.status && { transaction_status: paymentData.status === 'paid' },
              ...paymentData.cases && { cases: paymentData.cases },
              ...paymentData.billable_hours && { billable_hours: paymentData.billable_hours },
              ...paymentData.total && { amount: paymentData.total },
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
