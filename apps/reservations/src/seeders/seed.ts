import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { addCategories } from './category.seed';


@Injectable()
export class SeederService {
    constructor(
        private categoryRepository: CategoryRepository
    ) { }

    async seed() {
        addCategories(this.categoryRepository)
    }
}
