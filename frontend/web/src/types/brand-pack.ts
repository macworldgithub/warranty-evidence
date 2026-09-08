export type PackStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type MediaType = 'IMAGE' | 'VIDEO' | 'PDF' | 'AUDIO';
export type PowertrainType = 'EV' | 'HYBRID' | 'PHEV' | 'ICE';
export type ConditionOperator = 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS';

export interface VehicleRules {
  vinRequired: boolean;
  vinOcrEnabled: boolean;
  odometerRequired: boolean;
  frontPhotoRequired: boolean;
  supportedPowertrains: PowertrainType[];
  decodeVin: boolean;
}

export interface QualityRules {
  minimumResolution?: string;
  maximumVideoDuration?: number;
  minimumVideoDuration?: number;
  requireAudio?: boolean;
  allowMultiple?: boolean;
  ocrRequired?: boolean;
  barcodeRequired?: boolean;
}

export interface EvidenceRule {
  key: string;
  title: string;
  description: string;
  required: boolean;
  mediaType: MediaType;
  minimumCount: number;
  maximumCount: number;
  instructions: string;
  exampleImageUrl?: string;
  order: number;
  qualityRules?: QualityRules;
}

export interface FaultType {
  key: string;
  name: string;
  description: string;
  tier: string;
  active: boolean;
  order: number;
  annexReference?: string;
  annexSection?: string;
  tier2Items?: EvidenceRule[];
}

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
}

export interface RuleAction {
  type: string;
  evidenceKey: string;
  reason?: string;
}

export interface ConditionalRule {
  id: string;
  name: string;
  description?: string;
  condition: RuleCondition;
  actions: RuleAction[];
}

export interface NamingRule {
  evidenceKey: string;
  template: string;
  descriptor: string;
  extension?: string;
  sequenceStrategy?: string;
}

export interface BrandPack {
  _id?: string;
  id?: string;
  brandId: string;
  brandCode: string;
  version: string;
  status: PackStatus;
  description: string;
  applicableSites: string[];
  vehicleRules: VehicleRules;
  tier1Items: EvidenceRule[];
  faultTypes: FaultType[];
  conditionalRules: ConditionalRule[];
  namingRules: NamingRule[];
  createdBy: string;
  publishedBy?: string;
  publishedAt?: string;
  changelog?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  _id?: string;
  id?: string;
  code: string;
  name: string;
  manufacturer: string;
  status: 'ACTIVE' | 'INACTIVE';
  applicableSites: string[];
  activePackVersion?: string;
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteAddress {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
}

export interface Site {
  _id?: string;
  id?: string;
  code: string;
  name: string;
  address: SiteAddress;
  status: 'ACTIVE' | 'INACTIVE';
  brands: string[];
  phone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  issues: ValidationIssue[];
}
