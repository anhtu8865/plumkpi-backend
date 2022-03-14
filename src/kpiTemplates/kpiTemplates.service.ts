import { KpiTemplateParams } from './../utils/types/kpiTemplateParams';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import CreateKpiTemplateDto from './dto/createKpiTemplate.dto';
import KpiTemplate from './kpiTemplate.entity';
import UpdateKpiTemplateDto from './dto/updateKpiTemplate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CustomBadRequestException } from 'src/utils/exception/BadRequest.exception';
import { CustomInternalServerException } from 'src/utils/exception/InternalServer.exception';
import PostgresErrorCodes from 'src/database/postgresErrorCodes.enum';
import { CustomNotFoundException } from 'src/utils/exception/NotFound.exception';

@Injectable()
export default class KpiTemplatesService {
  constructor(
    @InjectRepository(KpiTemplate)
    private kpiTemplatesRepository: Repository<KpiTemplate>,
  ) {}

  async getKpiTemplates(params: KpiTemplateParams) {
    const { offset, limit, name, kpi_category_id } = params;

    const whereCondition = {
      kpi_template_name: name ? Like(`%${name}%`) : undefined,
      kpi_category: { kpi_category_id },
    };
    Object.keys(whereCondition).forEach(
      (key) => whereCondition[key] === undefined && delete whereCondition[key],
    );

    const [items, count] = await this.kpiTemplatesRepository.findAndCount({
      where: [whereCondition],
      order: {
        kpi_template_id: 'ASC',
      },
      skip: offset,
      take: limit,
    });

    return {
      items,
      count,
    };
  }

  async getPersonalKpiTemplates(offset: number, limit: number, name: string) {
    const whereCondition = {
      kpi_template_name: name ? Like(`%${name}%`) : undefined,
      kpi_category: { kpi_category_name: 'Cá nhân' },
    };
    Object.keys(whereCondition).forEach(
      (key) => whereCondition[key] === undefined && delete whereCondition[key],
    );

    const [items, count] = await this.kpiTemplatesRepository.findAndCount({
      where: [whereCondition],
      relations: ['kpi_category'],
      order: {
        kpi_template_id: 'ASC',
      },
      skip: offset,
      take: limit,
    });

    return {
      items,
      count,
    };
  }

  async getKpiTemplateById(id: number) {
    const kpiTemplate = await this.kpiTemplatesRepository.findOne(id);
    if (kpiTemplate) {
      return kpiTemplate;
    }
    throw new CustomNotFoundException(`KPI template id ${id} không tồn tại`);
  }

  async createKpiTemplate(data: CreateKpiTemplateDto) {
    try {
      const newKpiTemplate = await this.kpiTemplatesRepository.create(data);
      await this.kpiTemplatesRepository.save(newKpiTemplate);
      return newKpiTemplate;
    } catch (error) {
      if (error?.code === PostgresErrorCodes.UniqueViolation) {
        throw new CustomBadRequestException(
          `Tên KPI ${data.kpi_template_name} đã tồn tại`,
        );
      }
      throw new CustomInternalServerException();
    }
  }

  async updateKpiTemplate(id: number, data: UpdateKpiTemplateDto) {
    await this.getKpiTemplateById(id);
    try {
      await this.kpiTemplatesRepository.save({ ...data, kpi_template_id: id });
      const UpdatedKpiTemplate = await this.kpiTemplatesRepository.findOne(id);
      return UpdatedKpiTemplate;
    } catch (error) {
      if (error?.code === PostgresErrorCodes.UniqueViolation) {
        throw new CustomBadRequestException(
          `Tên KPI ${data.kpi_template_name} đã tồn tại`,
        );
      }
      throw new CustomInternalServerException();
    }
  }

  async deleteKpiTemplate(id: number) {
    const deleteResponse = await this.kpiTemplatesRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new CustomNotFoundException(`KPI template id ${id} không tồn tại`);
    }
  }
}
