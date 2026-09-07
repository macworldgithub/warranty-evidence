export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface CaseTask {
  id: string;
  title: string;
  description: string;
  caseId: string;
  caseNumber: string;
  assignedToName: string;
  assignedToEmail: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  completedAt?: string;
  checklist?: { id: string; text: string; done: boolean }[];
  createdAt: string;
}
