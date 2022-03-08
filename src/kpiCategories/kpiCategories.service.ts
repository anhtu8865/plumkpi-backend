import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import CreateKpiCategoryDto from './dto/createKpiCategory.dto';
import KpiCategory from './kpiCategory.entity';
import UpdateKpiCategoryDto from './dto/updateKpiCategory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CustomBadRequestException } from 'src/utils/exception/BadRequest.exception';
import PostgresErrorCodes from 'src/database/postgresErrorCodes.enum';
import { CustomNotFoundException } from 'src/utils/exception/NotFound.exception';

@Injectable()
export default class KpiCategoriesService {
  constructor(
    @InjectRepository(KpiCategory)
    private kpiCategoriesRepository: Repository<KpiCategory>,
  ) {}

  async getKpiCategories(offset: number, limit: number, name?: string) {
    const [items, count] = await this.kpiCategoriesRepository.findAndCount({
      where: [{ kpi_category_name: Like(`%${name ? name : ''}%`) }],
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

  async getPersonalKpis() {
    const kpiCategory = await this.kpiCategoriesRepository.findOne(
      { kpi_category_name: 'Cá nhân' },
      {
        relations: ['kpi_templates'],
      },
    );
    if (kpiCategory) {
      return kpiCategory;
    }
    throw new HttpException('Kpi category not found', HttpStatus.NOT_FOUND);
  }

  async getKpiCategoryById(id: number) {
    const kpiCategory = await this.kpiCategoriesRepository.findOne(id, {
      relations: ['kpi_templates'],
    });
    if (kpiCategory) {
      return kpiCategory;
    }
    throw new CustomNotFoundException(`Danh mục KPI id ${id} không tồn tại`);
  }

  async createKpiCategory(kpiCategory: CreateKpiCategoryDto) {
    try {
      const newKpiCategory = await this.kpiCategoriesRepository.create(
        kpiCategory,
      );
      await this.kpiCategoriesRepository.save(newKpiCategory);
      return newKpiCategory;
    } catch (error) {
      if (error?.code === PostgresErrorCodes.UniqueViolation) {
        throw new CustomBadRequestException(
          `Tên danh mục ${kpiCategory.kpi_category_name} đã tồn tại`,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateKpiCategory(id: number, data: UpdateKpiCategoryDto) {
    await this.getKpiCategoryById(id);
    try {
      await this.kpiCategoriesRepository.save({
        ...data,
        kpi_category_id: id,
      });
      const updateKpiCategory = await this.getKpiCategoryById(id);
      return updateKpiCategory;
    } catch (error) {
      if (error?.code === PostgresErrorCodes.UniqueViolation) {
        throw new CustomBadRequestException(
          `Tên danh mục ${data.kpi_category_name} đã tồn tại`,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteKpiCategory(id: number) {
    const deleteResponse = await this.kpiCategoriesRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new CustomNotFoundException(`Danh mục KPI id ${id} không tồn tại`);
    }
  }
}
