import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false })
export class LoginHistoryDocument extends AbstractDocument {
  @Prop()
  userId: string;

  @Prop()
  sessionId: string;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop({ default: () => new Date() })
  loginTime: Date;
}

export const LoginHistorySchema =
  SchemaFactory.createForClass(LoginHistoryDocument);
