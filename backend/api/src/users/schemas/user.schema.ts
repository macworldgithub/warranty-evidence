import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserRole = 'ADMIN' | 'OPERATIONS';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User {
  @Prop({ required: true, unique: true, index: true })
  supabaseUserId!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({
    type: String,
    required: true,
    enum: ['ADMIN', 'OPERATIONS'],
    default: 'OPERATIONS',
  })
  role!: UserRole;

  @Prop({
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE',
  })
  status!: UserStatus;

  @Prop()
  lastLoginAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
