import { Prop, Schema } from "@nestjs/mongoose";

@Schema({ _id: false })
export class MediaRef {
  @Prop({ required: true })
  key: string;

  @Prop()
  mimeType?: string;

  @Prop()
  size?: number;
}