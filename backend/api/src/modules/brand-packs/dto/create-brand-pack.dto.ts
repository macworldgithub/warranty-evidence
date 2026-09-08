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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  MediaType,
  PowertrainType,
  ConditionOperator,
} from '../schemas/brand-pack.schema.js';

export class VehicleRulesDto {
  @ApiPropertyOptional({ description: 'Whether VIN capture is mandatory', default: true })
  @IsBoolean()
  @IsOptional()
  vinRequired?: boolean;

  @ApiPropertyOptional({ description: 'Whether OCR VIN scanning is enabled', default: true })
  @IsBoolean()
  @IsOptional()
  vinOcrEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Whether vehicle odometer cluster photo is mandatory', default: true })
  @IsBoolean()
  @IsOptional()
  odometerRequired?: boolean;

  @ApiPropertyOptional({ description: 'Whether front 45-degree vehicle photo is mandatory', default: true })
  @IsBoolean()
  @IsOptional()
  frontPhotoRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Permitted powertrain architectures',
    enum: ['EV', 'HYBRID', 'PHEV', 'ICE'],
    isArray: true,
    example: ['EV', 'PHEV'],
  })
  @IsArray()
  @IsEnum(['EV', 'HYBRID', 'PHEV', 'ICE'], { each: true })
  @IsOptional()
  supportedPowertrains?: PowertrainType[];

  @ApiPropertyOptional({ description: 'Whether VIN should be decoded for trim and engine specs', default: true })
  @IsBoolean()
  @IsOptional()
  decodeVin?: boolean;
}

export class QualityRulesDto {
  @ApiPropertyOptional({ description: 'Minimum image resolution', example: '1920x1080' })
  @IsString()
  @IsOptional()
  minimumResolution?: string;

  @ApiPropertyOptional({ description: 'Maximum video length in seconds', example: 60 })
  @IsNumber()
  @IsOptional()
  maximumVideoDuration?: number;

  @ApiPropertyOptional({ description: 'Minimum video length in seconds', example: 5 })
  @IsNumber()
  @IsOptional()
  minimumVideoDuration?: number;

  @ApiPropertyOptional({ description: 'Whether audio track is mandatory on video evidence', default: false })
  @IsBoolean()
  @IsOptional()
  requireAudio?: boolean;

  @ApiPropertyOptional({ description: 'Whether multiple files can be uploaded for this evidence rule', default: false })
  @IsBoolean()
  @IsOptional()
  allowMultiple?: boolean;

  @ApiPropertyOptional({ description: 'Whether OCR text extraction is required', default: false })
  @IsBoolean()
  @IsOptional()
  ocrRequired?: boolean;

  @ApiPropertyOptional({ description: 'Whether 1D/2D barcode scanning is required', default: false })
  @IsBoolean()
  @IsOptional()
  barcodeRequired?: boolean;
}

export class EvidenceRuleDto {
  @ApiProperty({ description: 'Unique evidence identifier key', example: 'VIN_PLATE_PHOTO' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ description: 'Human-readable title', example: 'VIN Plate Photo' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Detailed instruction or explanation' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether evidence is mandatory to submit claim', default: true })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional({ enum: ['IMAGE', 'VIDEO', 'PDF', 'AUDIO'], default: 'IMAGE' })
  @IsEnum(['IMAGE', 'VIDEO', 'PDF', 'AUDIO'])
  @IsOptional()
  mediaType?: MediaType;

  @ApiPropertyOptional({ description: 'Minimum number of media attachments required', default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  minimumCount?: number;

  @ApiPropertyOptional({ description: 'Maximum number of media attachments allowed', default: 2 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maximumCount?: number;

  @ApiPropertyOptional({ description: 'Technician capture prompt guidelines' })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Reference sample image URL' })
  @IsString()
  @IsOptional()
  exampleImageUrl?: string;

  @ApiPropertyOptional({ description: 'UI display order sequence', default: 1 })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ description: 'Quality validation thresholds', type: () => QualityRulesDto })
  @ValidateNested()
  @Type(() => QualityRulesDto)
  @IsOptional()
  qualityRules?: QualityRulesDto;
}

export class FaultTypeDto {
  @ApiProperty({ description: 'Unique fault category key', example: 'HIGH_VOLTAGE_BATTERY' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ description: 'Defect category display name', example: 'High Voltage Traction Battery & BMS' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Category scope and diagnostic description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Warranty tier level', default: 'TIER_2' })
  @IsString()
  @IsOptional()
  tier?: string;

  @ApiPropertyOptional({ description: 'Whether defect category is enabled', default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Display order sequence', default: 1 })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ description: 'OEM warranty manual annex reference' })
  @IsString()
  @IsOptional()
  annexReference?: string;

  @ApiPropertyOptional({ description: 'OEM warranty manual annex section' })
  @IsString()
  @IsOptional()
  annexSection?: string;

  @ApiPropertyOptional({
    description: 'Tier 2 fault-specific evidence items required when this defect is selected',
    type: [EvidenceRuleDto],
  })
  @ValidateNested({ each: true })
  @Type(() => EvidenceRuleDto)
  @IsArray()
  @IsOptional()
  tier2Items?: EvidenceRuleDto[];
}

export class RuleConditionDto {
  @ApiProperty({ description: 'Trigger state field', example: 'partBeingReplaced' })
  @IsString()
  @IsNotEmpty()
  field!: string;

  @ApiProperty({ enum: ['EQUALS', 'NOT_EQUALS', 'CONTAINS'], example: 'EQUALS' })
  @IsEnum(['EQUALS', 'NOT_EQUALS', 'CONTAINS'])
  @IsNotEmpty()
  operator!: ConditionOperator;

  @ApiProperty({ description: 'Target value to trigger rule', example: true })
  @IsNotEmpty()
  value!: unknown;
}

export class RuleActionDto {
  @ApiPropertyOptional({ description: 'Action type', default: 'REQUIRE_EVIDENCE' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ description: 'Key of evidence rule required when condition met', example: 'OLD_PART_WITH_TAG' })
  @IsString()
  @IsNotEmpty()
  evidenceKey!: string;

  @ApiPropertyOptional({ description: 'Audit reason for requiring this evidence' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ConditionalRuleDto {
  @ApiProperty({ description: 'Unique rule ID', example: 'COND_PART_REPLACEMENT' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ description: 'Rule name', example: 'Part Replacement Condition' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Description of trigger logic' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Evaluation condition', type: () => RuleConditionDto })
  @ValidateNested()
  @Type(() => RuleConditionDto)
  @IsNotEmpty()
  condition!: RuleConditionDto;

  @ApiProperty({ description: 'Actions enforced when condition is satisfied', type: [RuleActionDto] })
  @ValidateNested({ each: true })
  @Type(() => RuleActionDto)
  @IsArray()
  @IsNotEmpty()
  actions!: RuleActionDto[];
}

export class NamingRuleDto {
  @ApiProperty({ description: 'Evidence item key this naming rule targets', example: 'VIN_PLATE_PHOTO' })
  @IsString()
  @IsNotEmpty()
  evidenceKey!: string;

  @ApiProperty({ description: 'Filename template pattern', example: '{RO}VIN.{ext}' })
  @IsString()
  @IsNotEmpty()
  template!: string;

  @ApiProperty({ description: 'Descriptor tag used in OEM naming', example: 'VIN' })
  @IsString()
  @IsNotEmpty()
  descriptor!: string;

  @ApiPropertyOptional({ description: 'Forced file extension override' })
  @IsString()
  @IsOptional()
  extension?: string;

  @ApiPropertyOptional({ description: 'Multi-file sequence numbering strategy' })
  @IsString()
  @IsOptional()
  sequenceStrategy?: string;
}

export class CreateBrandPackDto {
  @ApiProperty({ description: 'MongoDB ObjectId of the Brand entity', example: '65f1a2b3c4d5e6f7a8b9c0d1' })
  @IsString()
  @IsNotEmpty()
  brandId!: string;

  @ApiProperty({ description: 'Version tag string', example: 'v1.0' })
  @IsString()
  @IsNotEmpty()
  version!: string;

  @ApiPropertyOptional({ description: 'Pack specification summary', example: 'Official Warranty Evidence Capture Rules' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Specific dealership site codes where this pack applies (empty = all sites)',
    example: ['CRANBOURNE'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableSites?: string[];

  @ApiPropertyOptional({ description: 'Vehicle identification requirements', type: () => VehicleRulesDto })
  @ValidateNested()
  @Type(() => VehicleRulesDto)
  @IsOptional()
  vehicleRules?: VehicleRulesDto;

  @ApiPropertyOptional({ description: 'Tier 1 baseline mandatory evidence requirements', type: [EvidenceRuleDto] })
  @ValidateNested({ each: true })
  @Type(() => EvidenceRuleDto)
  @IsArray()
  @IsOptional()
  tier1Items?: EvidenceRuleDto[];

  @ApiPropertyOptional({ description: 'Fault defect categories and Tier 2 rules', type: [FaultTypeDto] })
  @ValidateNested({ each: true })
  @Type(() => FaultTypeDto)
  @IsArray()
  @IsOptional()
  faultTypes?: FaultTypeDto[];

  @ApiPropertyOptional({ description: 'Conditional dynamic evidence rules', type: [ConditionalRuleDto] })
  @ValidateNested({ each: true })
  @Type(() => ConditionalRuleDto)
  @IsArray()
  @IsOptional()
  conditionalRules?: ConditionalRuleDto[];

  @ApiPropertyOptional({ description: 'OEM file naming templates', type: [NamingRuleDto] })
  @ValidateNested({ each: true })
  @Type(() => NamingRuleDto)
  @IsArray()
  @IsOptional()
  namingRules?: NamingRuleDto[];

  @ApiPropertyOptional({ description: 'Version changelog notes' })
  @IsString()
  @IsOptional()
  changelog?: string;
}
