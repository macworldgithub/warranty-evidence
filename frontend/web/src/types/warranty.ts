export type WarrantyStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'CLAIM_IN_PROGRESS'
  | 'SUSPENDED'
  | 'VOIDED';

export type WarrantyCoverageType =
  | 'COMPREHENSIVE'
  | 'POWERTRAIN'
  | 'DRIVETRAIN'
  | 'ELECTRICAL_HYBRID';

export interface VehicleDetails {
  vin: string;
  make: string;
  model: string;
  year: number;
  odometerKm: number;
  engineNumber?: string;
  registrationPlate?: string;
}

export interface CustomerDetails {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
}

export interface Warranty {
  id: string;
  warrantyNumber: string;
  customer: CustomerDetails;
  vehicle: VehicleDetails;
  coverageType: WarrantyCoverageType;
  status: WarrantyStatus;
  startDate: string;
  endDate: string;
  maxClaimLimitAud: number;
  deductibleAud: number;
  dealershipName: string;
  activeClaimsCount: number;
  createdAt: string;
  notes?: string;
}
