import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PackStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type MediaType = 'IMAGE' | 'VIDEO' | 'PDF' | 'AUDIO';
export type PowertrainType = 'EV' | 'HYBRID' | 'PHEV' | 'ICE';
export type ConditionOperator = 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS';

export type BrandPackDocument = BrandPack & Document;

@Schema({ _id: false })
export class VehicleRules {
  @Prop({ type: Boolean, default: true })
  vinRequired!: boolean;

  @Prop({ type: Boolean, default: true })
  vinOcrEnabled!: boolean;

  @Prop({ type: Boolean, default: true })
  odometerRequired!: boolean;

  @Prop({ type: Boolean, default: true })
  frontPhotoRequired!: boolean;

  @Prop({
    type: [String],
    enum: ['EV', 'HYBRID', 'PHEV', 'ICE'],
    default: ['EV', 'HYBRID', 'PHEV', 'ICE'],
  })
  supportedPowertrains!: PowertrainType[];

  @Prop({ type: Boolean, default: true })
  decodeVin!: boolean;
}

export const VehicleRulesSchema = SchemaFactory.createForClass(VehicleRules);

@Schema({ _id: false })
export class QualityRules {
  @Prop({ type: String })
  minimumResolution?: string;

  @Prop({ type: Number })
  maximumVideoDuration?: number;

  @Prop({ type: Number })
  minimumVideoDuration?: number;

  @Prop({ type: Boolean, default: false })
  requireAudio?: boolean;

  @Prop({ type: Boolean, default: false })
  allowMultiple?: boolean;

  @Prop({ type: Boolean, default: false })
  ocrRequired?: boolean;

  @Prop({ type: Boolean, default: false })
  barcodeRequired?: boolean;
}

export const QualityRulesSchema = SchemaFactory.createForClass(QualityRules);

@Schema({ _id: false })
export class EvidenceRule {
  @Prop({ required: true, uppercase: true, trim: true })
  key!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ type: String, trim: true, default: '' })
  description!: string;

  @Prop({ type: Boolean, default: true })
  required!: boolean;

  @Prop({
    type: String,
    required: true,
    enum: ['IMAGE', 'VIDEO', 'PDF', 'AUDIO'],
    default: 'IMAGE',
  })
  mediaType!: MediaType;

  @Prop({ type: Number, required: true, default: 1, min: 1 })
  minimumCount!: number;

  @Prop({ type: Number, required: true, default: 1, min: 1 })
  maximumCount!: number;

  @Prop({ type: String, trim: true, default: '' })
  instructions!: string;

  @Prop({ type: String })
  exampleImageUrl?: string;

  @Prop({ type: Number, default: 0 })
  order!: number;

  @Prop({ type: QualityRulesSchema, default: () => ({}) })
  qualityRules!: QualityRules;
}

export const EvidenceRuleSchema = SchemaFactory.createForClass(EvidenceRule);

@Schema({ _id: false })
export class FaultType {
  @Prop({ required: true, uppercase: true, trim: true })
  key!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: String, trim: true, default: '' })
  description!: string;

  @Prop({
    type: String,
    enum: ['TIER_1', 'TIER_2'],
    default: 'TIER_2',
  })
  tier!: string;

  @Prop({ type: Boolean, default: true })
  active!: boolean;

  @Prop({ type: Number, default: 0 })
  order!: number;

  @Prop({ type: String, trim: true })
  annexReference?: string;

  @Prop({ type: String, trim: true })
  annexSection?: string;

  @Prop({ type: [EvidenceRuleSchema], default: [] })
  tier2Items!: EvidenceRule[];
}

export const FaultTypeSchema = SchemaFactory.createForClass(FaultType);

@Schema({ _id: false })
export class RuleCondition {
  @Prop({ required: true, trim: true })
  field!: string;

  @Prop({
    type: String,
    required: true,
    enum: ['EQUALS', 'NOT_EQUALS', 'CONTAINS'],
    default: 'EQUALS',
  })
  operator!: ConditionOperator;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  value!: unknown;
}

export const RuleConditionSchema = SchemaFactory.createForClass(RuleCondition);

@Schema({ _id: false })
export class RuleAction {
  @Prop({ type: String, required: true, default: 'REQUIRE_EVIDENCE' })
  type!: string;

  @Prop({ required: true, uppercase: true, trim: true })
  evidenceKey!: string;

  @Prop({ type: String, trim: true })
  reason?: string;
}

export const RuleActionSchema = SchemaFactory.createForClass(RuleAction);

@Schema({ _id: false })
export class ConditionalRule {
  @Prop({ required: true, trim: true })
  id!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: RuleConditionSchema, required: true })
  condition!: RuleCondition;

  @Prop({ type: [RuleActionSchema], default: [] })
  actions!: RuleAction[];
}

export const ConditionalRuleSchema = SchemaFactory.createForClass(ConditionalRule);

@Schema({ _id: false })
export class NamingRule {
  @Prop({ required: true, uppercase: true, trim: true })
  evidenceKey!: string;

  @Prop({ required: true, trim: true })
  template!: string;

  @Prop({ required: true, trim: true })
  descriptor!: string;

  @Prop({ type: String, trim: true })
  extension?: string;

  @Prop({ type: String, trim: true, default: 'STATIC' })
  sequenceStrategy?: string;
}

export const NamingRuleSchema = SchemaFactory.createForClass(NamingRule);

@Schema({
  timestamps: true,
  collection: 'brand_packs',
})
export class BrandPack {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Brand', required: true, index: true })
  brandId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, uppercase: true, trim: true, index: true })
  brandCode!: string;

  @Prop({ required: true, trim: true })
  version!: string;

  @Prop({
    type: String,
    required: true,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT',
    index: true,
  })
  status!: PackStatus;

  @Prop({ type: String, trim: true, default: '' })
  description!: string;

  @Prop({ type: [String], default: [] })
  applicableSites!: string[];

  @Prop({ type: VehicleRulesSchema, default: () => ({}) })
  vehicleRules!: VehicleRules;

  @Prop({ type: [EvidenceRuleSchema], default: [] })
  tier1Items!: EvidenceRule[];

  @Prop({ type: [FaultTypeSchema], default: [] })
  faultTypes!: FaultType[];

  @Prop({ type: [ConditionalRuleSchema], default: [] })
  conditionalRules!: ConditionalRule[];

  @Prop({ type: [NamingRuleSchema], default: [] })
  namingRules!: NamingRule[];

  @Prop({ required: true, trim: true })
  createdBy!: string;

  @Prop({ type: String, trim: true })
  publishedBy?: string;

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ type: String, trim: true })
  changelog?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const BrandPackSchema = SchemaFactory.createForClass(BrandPack);
BrandPackSchema.index({ brandId: 1, version: 1 }, { unique: true });
BrandPackSchema.index({ brandCode: 1, status: 1 });
