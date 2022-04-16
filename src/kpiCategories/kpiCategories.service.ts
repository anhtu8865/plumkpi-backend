import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import CreateKpiCategoryDto from './dto/createKpiCategory.dto';
import KpiCategory from './kpiCategory.entity';
import UpdateKpiCategoryDto from './dto/updateKpiCategory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CustomBadRequestException } from 'src/utils/exception/BadRequest.exception';
import PostgresErrorCodes from 'src/database/postgresErrorCodes.enum';
import { CustomNotFoundException } from 'src/utils/exception/NotFound.exception';
import { CustomInternalServerException } from 'src/utils/exception/InternalServer.exception';

@Injectable()
export default class KpiCategoriesService {
  constructor(
    @InjectRepository(KpiCategory)
    private kpiCategoriesRepository: Repository<KpiCategory>,
  ) {}

  async getKpiCategories(offset: number, limit: number, name?: string) {
    const [items, count] = await this.kpiCategoriesRepository.findAndCount({
      where: [{ kpi_category_name: Like(`%${name ? name : ''}%`) }],
      order: { createdAt: 'ASC' },
      skip: offset,
      take: limit,
    });

    return {
      items,
      count,
    };
  }

  async getAllKpiCategories() {
    return this.kpiCategoriesRepository.find({
      select: ['kpi_category_id', 'kpi_category_name'],
      order: { createdAt: 'ASC' },
    });
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
    const kpiCategory = await this.kpiCategoriesRepository.findOne(id);
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
      throw new CustomInternalServerException();
    }
  }

  async updateKpiCategory(id: number, data: UpdateKpiCategoryDto) {
    try {
      let kpiCategory = await this.getKpiCategoryById(id);
      if (kpiCategory.kpi_category_name === 'Cá nhân')
        throw new CustomBadRequestException(
          `Không thể thay đổi danh mục KPI cá nhân`,
        );

      kpiCategory = await this.kpiCategoriesRepository.save({
        ...kpiCategory,
        ...data,
      });
      return kpiCategory;
    } catch (error) {
      if (error?.code === PostgresErrorCodes.UniqueViolation) {
        throw new CustomBadRequestException(
          `Tên danh mục ${data.kpi_category_name} đã tồn tại`,
        );
      }
      throw error;
    }
  }

  async deleteKpiCategory(id: number) {
    try {
      const kpiCategory = await this.getKpiCategoryById(id);
      if (kpiCategory.kpi_category_name === 'Cá nhân')
        throw new CustomBadRequestException(
          `Không thể xoá danh mục KPI cá nhân`,
        );
      const deleteResponse = await this.kpiCategoriesRepository.delete(id);
      if (!deleteResponse.affected) {
        throw new CustomNotFoundException(
          `Danh mục KPI id ${id} không tồn tại`,
        );
      }
    } catch (error) {
      if (error?.constraint === 'FK_dc334a26590d292708f5ea7b9b7') {
        throw new CustomBadRequestException(
          `Danh mục KPI này đang có KPI template`,
        );
      }
      throw error;
    }
  }
}
