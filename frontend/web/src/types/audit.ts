export type AuditAction =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DEACTIVATED'
  | 'WARRANTY_CREATED'
  | 'WARRANTY_UPDATED'
  | 'CASE_CREATED'
  | 'CASE_STATUS_CHANGED'
  | 'CASE_ASSIGNED'
  | 'EVIDENCE_SUBMITTED'
  | 'EVIDENCE_REVIEWED'
  | 'TASK_ASSIGNED'
  | 'TASK_COMPLETED';

export type AuditEntity =
  | 'USER'
  | 'WARRANTY'
  | 'CASE'
  | 'EVIDENCE'
  | 'REVIEW'
  | 'TASK'
  | 'SYSTEM';

export interface AuditLogEntry {
  id: string;
  userEmail: string;
  userName: string;
  userRole: 'ADMIN' | 'OPERATIONS';
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  description: string;
  ipAddress: string;
  timestamp: string;
}
