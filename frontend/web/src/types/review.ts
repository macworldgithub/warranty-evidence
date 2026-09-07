export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'INFO_REQUESTED';

export interface EvidenceReview {
  id: string;
  evidenceId: string;
  evidenceRequirement: string;
  caseId: string;
  caseNumber: string;
  customerName: string;
  vehicleSummary: string;
  submittedBy: string;
  submittedAt: string;
  status: ReviewStatus;
  reviewerName?: string;
  reviewedAt?: string;
  notes?: string;
  decisionReason?: string;
  attachmentCount: number;
}
