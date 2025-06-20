import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false })
export class CategoryDocument extends AbstractDocument {
  @Prop({ required: true })
  name: string;
}

export const CategorySchema =
  SchemaFactory.createForClass(CategoryDocument);
