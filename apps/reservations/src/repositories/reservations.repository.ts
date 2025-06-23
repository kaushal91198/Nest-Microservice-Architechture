import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { ReservationDocument } from '../models/reservation.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class ReservationsRepository extends AbstractRepository<ReservationDocument> {
  protected readonly logger = new (Logger as any)(ReservationsRepository.name);

  constructor(
    @InjectModel(ReservationDocument.name)
    reservationModel: Model<ReservationDocument>,
  ) {
    super(reservationModel);
  }

  async findAllWithCategory(filterQuery: FilterQuery<ReservationDocument> = {}): Promise<ReservationDocument[]> {
    try {
      const productsWithCategory = await this.model
        .find(filterQuery)
        .populate('category_id', 'name') // Only get the name field of the category
        .lean()
        .exec();
      return productsWithCategory;
    } catch (error) {
      this.logger.error('Error fetching products with category', error);
      throw error;
    }
  }

}
