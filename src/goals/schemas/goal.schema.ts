import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GoalDocument = Goal & Document;

@Schema({ timestamps: true })
export class Goal {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
