import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrandStatus = 'ACTIVE' | 'INACTIVE';
export type BrandDocument = Brand & Document;

@Schema({
  timestamps: true,
  collection: 'brands',
})
export class Brand {
  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  code!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  manufacturer!: string;

  @Prop({
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
    index: true,
  })
  status!: BrandStatus;

  @Prop({ type: [String], default: [] })
  applicableSites!: string[];

  @Prop({ type: String })
  activePackVersion?: string;

  @Prop({ type: String })
  logoUrl?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
BrandSchema.index({ code: 1, status: 1 });
