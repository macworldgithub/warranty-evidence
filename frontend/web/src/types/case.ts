export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'CLOSED';

export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type DefectCategory =
  | 'ENGINE_MECHANICAL'
  | 'TRANSMISSION_GEARBOX'
  | 'ELECTRICAL_SENSOR'
  | 'COOLING_HEATING'
  | 'BRAKING_SYSTEM'
  | 'SUSPENSION_STEERING'
  | 'BATTERY_HYBRID';

export interface CaseAssignee {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERATIONS';
}

export interface WarrantyCase {
  id: string;
  caseNumber: string;
  warrantyId: string;
  warrantyNumber: string;
  customerName: string;
  vehicleSummary: string; // e.g., "2022 Ford Ranger Wildtrak (VIN: ...)"
  category: DefectCategory;
  title: string;
  description: string;
  priority: CasePriority;
  status: CaseStatus;
  assignedTo: CaseAssignee;
  estimatedCostAud?: number;
  approvedAmountAud?: number;
  evidenceCount: number;
  tasksCount: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
}
