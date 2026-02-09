import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";

export enum MediaProvider {
  S3 = 's3',
  CLOUDINARY = 'cloudinary',
  EXTERNAL = 'external',
}

@Schema({ _id: false })
export class MediaRef {
  @Prop()
  key?: string;

  @Prop()
  url?: string;

  @Prop()
  mimeType?: string;

  @Prop()
  size?: number;

  @Prop({
    enum: MediaProvider,
    default: MediaProvider.S3,
    required: true
  })
  provider: MediaProvider
}