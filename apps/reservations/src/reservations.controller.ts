import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { CustomMulterInterceptor, JwtAuthGuard, Roles, UserDto } from '@app/common';

@Controller('products')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    CustomMulterInterceptor({
      fields: [
        { name: 'images', maxCount: 5 }
      ],
      maxFileSizeInMB: 10,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    }),
  )
  async create(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    await this.reservationsService.create(createReservationDto, request['files'].images);
    return response.status(200).json({ message: 'Product created successfully.' });
  }

  @Get('category')
  @UseGuards(JwtAuthGuard)
  async getAllCategories(@Res({ passthrough: true }) response: Response) {
    const categories = await this.reservationsService.findCateories();
    return response.status(200).json({ data: categories, message: 'Category fetched successfully.' });

  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllProducts(@Res({ passthrough: true }) response: Response) {
    const categories = await this.reservationsService.findProducts();
    return response.status(200).json({ data: categories, message: 'Products fetched successfully.' });

  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.reservationsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('Admin', 'Owner')
  async remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}
