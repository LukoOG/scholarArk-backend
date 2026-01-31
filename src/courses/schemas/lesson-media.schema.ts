import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export enum LessonMediaStatus {
    PROCESSING = 'processing',
    UPLOADED = 'uploaded',
    FAILED = 'failed'
}

// @Schema({ _id: false })
// export class LessonMedia {
//     @Prop({ required: true })
//     s3key: string;

//     @Prop({ enum: LessonMediaStatus, default: LessonMediaStatus.PROCESSING})
//     status: LessonMediaStatus;

//     @Prop()
//     duration?: number; //duration in minutes

//     @Prop()
//     size?: number;

//     @Prop()
//     mimeType: string;
// }

@Schema({ _id: false })
export class LessonMedia {
  @Prop({ required: true })
  s3key: string;

  @Prop({ enum: LessonMediaStatus, default: LessonMediaStatus.PROCESSING })
  status: LessonMediaStatus;

  @Prop()
  duration?: number; // duration in minutes

  @Prop()
  size?: number;

  @Prop()
  mimeType: string;

  // ------------------- DEMO FIELDS -------------------
  @Prop({ type: Object })
  demo?: {
    videoUrl?: string; // Cloudinary MP4 URL
    hlsUrl?: string;   // Cloudinary HLS URL
    publicId?: string;
    status: LessonMediaStatus
  };
}


export type LessonMediaDocument = HydratedDocument<LessonMedia>;
export const LessonMediaSchema = SchemaFactory.createForClass(LessonMedia);