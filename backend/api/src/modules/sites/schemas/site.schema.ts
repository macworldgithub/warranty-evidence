import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SiteStatus = 'ACTIVE' | 'INACTIVE';
export type SiteDocument = Site & Document;

@Schema({ _id: false })
export class SiteAddress {
  @Prop({ required: true, trim: true })
  street!: string;

  @Prop({ required: true, trim: true })
  suburb!: string;

  @Prop({ required: true, trim: true })
  state!: string;

  @Prop({ required: true, trim: true })
  postcode!: string;
}

export const SiteAddressSchema = SchemaFactory.createForClass(SiteAddress);

@Schema({
  timestamps: true,
  collection: 'sites',
})
export class Site {
  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  code!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: SiteAddressSchema, required: true })
  address!: SiteAddress;

  @Prop({
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
    index: true,
  })
  status!: SiteStatus;

  @Prop({ type: [String], default: [] })
  brands!: string[];

  @Prop({ type: String, trim: true })
  phone?: string;

  @Prop({ type: String, trim: true })
  email?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const SiteSchema = SchemaFactory.createForClass(Site);
SiteSchema.index({ code: 1, status: 1 });
