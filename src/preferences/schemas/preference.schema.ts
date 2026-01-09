import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PreferenceDocument = Preference & Document;

@Schema({ timestamps: true })
export class Preference {
  @Prop({ required: true, unique: true })
  key: string; // e.g "learning_style"

  @Prop({ required: true })
  label: string; // e.g "Video Based Learning"

  @Prop({ default: '' })
  description?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const PreferenceSchema = SchemaFactory.createForClass(Preference);
