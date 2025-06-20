import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  mixin,
} from '@nestjs/common';
import * as multer from 'multer';
import { diskStorage } from 'multer';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';
import { extname } from 'path';
import { Field } from 'multer';

export interface MulterConfig {
  fields: Field[];
  maxFileSizeInMB?: number;
  allowedMimeTypes?: string[];
}

export function CustomMulterInterceptor(config: MulterConfig): any {
  const {
    fields,
    allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    maxFileSizeInMB = 5,
  } = config;

  const storage = diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
    },
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: maxFileSizeInMB * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error(`File type not allowed: ${file.mimetype}`), false);
      }
      cb(null, true);
    },
  }).fields(fields);

  class MixinInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const ctx = context.switchToHttp();
      const req = ctx.getRequest<Request>();
      const res = ctx.getResponse<Response>();

      return new Observable((subscriber) => {
        upload(req, res, (err) => {
          if (err) {
            res.status(400).json({ message: err.message });
            subscriber.complete();
          } else {
            next.handle().subscribe({
              next: (val) => subscriber.next(val),
              error: (err) => subscriber.error(err),
              complete: () => subscriber.complete(),
            });
          }
        });
      });
    }
  }

  return mixin(MixinInterceptor);
}
