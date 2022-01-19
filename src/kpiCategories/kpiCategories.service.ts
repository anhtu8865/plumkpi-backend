import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import CreateKpiCategoryDto from './dto/createKpiCategory.dto';
import KpiCategory from './kpiCategory.entity';
import UpdateKpiCategoryDto from './dto/updateKpiCategory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export default class KpiCategoriesService {
  constructor(
    @InjectRepository(KpiCategory)
    private kpiCategoriesRepository: Repository<KpiCategory>,
  ) {}

  async getAllKpiCategories(offset?: number, limit?: number) {
    const [items, count] = await this.kpiCategoriesRepository.findAndCount({
      order: {
        kpi_category_id: 'ASC',
      },
      skip: offset,
      take: limit,
    });

    return {
      items,
      count,
    };
  }

  async getKpiCategoryById(id: number) {
    const kpiCategory = await this.kpiCategoriesRepository.findOne(id);
    if (kpiCategory) {
      return kpiCategory;
    }
    throw new HttpException('Kpi category not found', HttpStatus.NOT_FOUND);
  }

  async createKpiCategory(kpiCategory: CreateKpiCategoryDto) {
    const newKpiCategory = await this.kpiCategoriesRepository.create(
      kpiCategory,
    );
    await this.kpiCategoriesRepository.save(newKpiCategory);
    return newKpiCategory;
  }

  async updateKpiCategory(id: number, kpiCategory: UpdateKpiCategoryDto) {
    await this.kpiCategoriesRepository.update(id, kpiCategory);
    const UpdatedKpiCategory = await this.kpiCategoriesRepository.findOne(id);
    if (UpdatedKpiCategory) {
      return UpdatedKpiCategory;
    }
    throw new HttpException('Kpi category not found', HttpStatus.NOT_FOUND);
  }

  async deleteKpiCategory(id: number) {
    const deleteResponse = await this.kpiCategoriesRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Kpi category not found', HttpStatus.NOT_FOUND);
    }
  }
}
