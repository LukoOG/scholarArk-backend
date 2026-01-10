import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export enum LessonMediaStatus {
    PENDING = 'pending',
    UPLOADED = 'uploaded',
    READY = 'ready'
}

@Schema({ _id: false })
export class LessonMedia {
    @Prop({ required: true })
    s3key: string;

    @Prop({ enum: LessonMediaStatus, default: LessonMediaStatus.PENDING })
    status: LessonMediaStatus;

    @Prop()
    duration?: number;

    @Prop()
    size?: number;

    @Prop()
    mimeType: string;
}

export type LessonMediaDocument = HydratedDocument<LessonMedia>;
export const LessonMediaSchema = SchemaFactory.createForClass(LessonMedia);