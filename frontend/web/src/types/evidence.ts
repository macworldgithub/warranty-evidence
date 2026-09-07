export type EvidenceStatus =
  | 'REQUIRED'
  | 'PENDING'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export type EvidenceType = 'PHOTO' | 'VIDEO' | 'DOCUMENT' | 'DIAGNOSTIC_LOG';

export interface EvidenceAttachment {
  id: string;
  fileName: string;
  fileSizeKb: number;
  fileType: string;
  uploadDate: string;
  thumbnailUrl?: string;
  previewUrl?: string;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  caseNumber: string;
  requirementName: string;
  description: string;
  evidenceType: EvidenceType;
  status: EvidenceStatus;
  capturedBy?: string;
  capturedAt?: string;
  notes?: string;
  attachments: EvidenceAttachment[];
  reviewNotes?: string;
  createdAt: string;
}
