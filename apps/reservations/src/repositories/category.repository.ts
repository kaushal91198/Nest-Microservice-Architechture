import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryDocument } from '../models/category.schema';

@Injectable()
export class CategoryRepository extends AbstractRepository<CategoryDocument> {
  protected readonly logger = new (Logger as any)(CategoryRepository.name);

  constructor(
    @InjectModel(CategoryDocument.name)
    categoryModel: Model<CategoryDocument>,
  ) {
    super(categoryModel);
  }
}
