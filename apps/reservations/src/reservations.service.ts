import { HttpException, Inject, Injectable } from '@nestjs/common';
import { PAYMENTS_SERVICE, UserDto } from '@app/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsRepository } from './repositories/reservations.repository';
import { ClientProxy } from '@nestjs/microservices';
import { map } from 'rxjs';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    private readonly categoryRepository: CategoryRepository,

    @Inject(PAYMENTS_SERVICE) private readonly paymentsService: ClientProxy,
  ) { }

  async create(
    createReservationDto: CreateReservationDto,
    files: any[],
  ) {
    try {
      const images = files.map((file) => {
        return file.path
      })
      await this.reservationsRepository.create({ ...createReservationDto, images });
    } catch (error) {
      throw new HttpException("Something went wrong", 400)
    }
    // return this.paymentsService
    //   .send('create_charge', {
    //     ...createReservationDto.charge,
    //     email,
    //   })
    //   .pipe(
    //     map((res) => {
    //       return this.reservationsRepository.create({
    //         ...createReservationDto,
    //         invoiceId: res.id,
    //         timestamp: new Date(),
    //         userId,
    //       });
    //     }),
    //   );
  }

  async findAll() {
    return this.reservationsRepository.find({});
  }

  async findCateories() {
    return this.categoryRepository.find({});
  }

  async findProducts() {
    return this.reservationsRepository.findAllWithCategory({});
  }

  async findOne(_id: string) {
    return this.reservationsRepository.findOne({ _id });
  }

  async update(_id: string, updateReservationDto: UpdateReservationDto) {
    return this.reservationsRepository.findOneAndUpdate(
      { _id },
      { $set: updateReservationDto },
    );
  }

  async remove(_id: string) {
    return this.reservationsRepository.findOneAndDelete({ _id });
  }
}
