import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { Types } from 'mongoose';
import { CategoryDocument } from './category.schema';

@Schema({ versionKey: false })
export class ReservationDocument extends AbstractDocument {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: CategoryDocument.name
  })
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
