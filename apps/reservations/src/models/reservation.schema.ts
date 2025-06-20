import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false })
export class ReservationDocument extends AbstractDocument {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  category_id: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ type: Number })
  offerprice?: number;

  @Prop({ type: [String], default: [] })
  images: string[];
}

export const ReservationSchema =
  SchemaFactory.createForClass(ReservationDocument);
