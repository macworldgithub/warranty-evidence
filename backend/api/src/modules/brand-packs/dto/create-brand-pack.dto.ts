import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import type {
  MediaType,
  PowertrainType,
  ConditionOperator,
} from '../schemas/brand-pack.schema.js';

export class VehicleRulesDto {
  @IsBoolean()
  @IsOptional()
  vinRequired?: boolean;

  @IsBoolean()
  @IsOptional()
  vinOcrEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  odometerRequired?: boolean;

  @IsBoolean()
  @IsOptional()
  frontPhotoRequired?: boolean;

  @IsArray()
  @IsEnum(['EV', 'HYBRID', 'PHEV', 'ICE'], { each: true })
  @IsOptional()
  supportedPowertrains?: PowertrainType[];

  @IsBoolean()
  @IsOptional()
  decodeVin?: boolean;
}

export class QualityRulesDto {
  @IsString()
  @IsOptional()
  minimumResolution?: string;

  @IsNumber()
  @IsOptional()
  maximumVideoDuration?: number;

  @IsNumber()
  @IsOptional()
  minimumVideoDuration?: number;

  @IsBoolean()
  @IsOptional()
  requireAudio?: boolean;

  @IsBoolean()
  @IsOptional()
  allowMultiple?: boolean;

  @IsBoolean()
  @IsOptional()
  ocrRequired?: boolean;

  @IsBoolean()
  @IsOptional()
  barcodeRequired?: boolean;
}

export class EvidenceRuleDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsEnum(['IMAGE', 'VIDEO', 'PDF', 'AUDIO'])
  @IsOptional()
  mediaType?: MediaType;

  @IsNumber()
  @Min(1)
  @IsOptional()
  minimumCount?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maximumCount?: number;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsString()
  @IsOptional()
  exampleImageUrl?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @ValidateNested()
  @Type(() => QualityRulesDto)
  @IsOptional()
  qualityRules?: QualityRulesDto;
}

export class FaultTypeDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  tier?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  annexReference?: string;

  @IsString()
  @IsOptional()
  annexSection?: string;

  @ValidateNested({ each: true })
  @Type(() => EvidenceRuleDto)
  @IsArray()
  @IsOptional()
  tier2Items?: EvidenceRuleDto[];
}

export class RuleConditionDto {
  @IsString()
  @IsNotEmpty()
  field!: string;

  @IsEnum(['EQUALS', 'NOT_EQUALS', 'CONTAINS'])
  @IsNotEmpty()
  operator!: ConditionOperator;

  @IsNotEmpty()
  value!: unknown;
}

export class RuleActionDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsNotEmpty()
  evidenceKey!: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class ConditionalRuleDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested()
  @Type(() => RuleConditionDto)
  @IsNotEmpty()
  condition!: RuleConditionDto;

  @ValidateNested({ each: true })
  @Type(() => RuleActionDto)
  @IsArray()
  @IsNotEmpty()
  actions!: RuleActionDto[];
}

export class NamingRuleDto {
  @IsString()
  @IsNotEmpty()
  evidenceKey!: string;

  @IsString()
  @IsNotEmpty()
  template!: string;

  @IsString()
  @IsNotEmpty()
  descriptor!: string;

  @IsString()
  @IsOptional()
  extension?: string;

  @IsString()
  @IsOptional()
  sequenceStrategy?: string;
}

export class CreateBrandPackDto {
  @IsString()
  @IsNotEmpty()
  brandId!: string;

  @IsString()
  @IsNotEmpty()
  version!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableSites?: string[];

  @ValidateNested()
  @Type(() => VehicleRulesDto)
  @IsOptional()
  vehicleRules?: VehicleRulesDto;

  @ValidateNested({ each: true })
  @Type(() => EvidenceRuleDto)
  @IsArray()
  @IsOptional()
  tier1Items?: EvidenceRuleDto[];

  @ValidateNested({ each: true })
  @Type(() => FaultTypeDto)
  @IsArray()
  @IsOptional()
  faultTypes?: FaultTypeDto[];

  @ValidateNested({ each: true })
  @Type(() => ConditionalRuleDto)
  @IsArray()
  @IsOptional()
  conditionalRules?: ConditionalRuleDto[];

  @ValidateNested({ each: true })
  @Type(() => NamingRuleDto)
  @IsArray()
  @IsOptional()
  namingRules?: NamingRuleDto[];

  @IsString()
  @IsOptional()
  changelog?: string;
}
