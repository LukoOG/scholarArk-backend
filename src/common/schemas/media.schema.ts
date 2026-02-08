import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";

export enum MediaProvider {
  S3 = 's3',
  CLOUDINARY = 'cloudinary',
  EXTERNAL = 'external',
}

@Schema({ _id: false })
export class MediaRef {
  @Prop({ required: true })
  key: string;

  @Prop()
  url?: string;

  @Prop()
  mimeType?: string;

  @Prop()
  size?: number;

  @Prop({
    enum: MediaProvider,
    default: MediaProvider.EXTERNAL
  })
  provider: MediaProvider
}