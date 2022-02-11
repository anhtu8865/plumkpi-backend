import { KpiTemplateParams } from './../utils/types/kpiTemplateParams';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import CreateKpiTemplateDto from './dto/createKpiTemplate.dto';
import KpiTemplate from './kpiTemplate.entity';
import UpdateKpiTemplateDto from './dto/updateKpiTemplate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

@Injectable()
export default class KpiTemplatesService {
  constructor(
    @InjectRepository(KpiTemplate)
    private kpiTemplatesRepository: Repository<KpiTemplate>,
  ) {}

  async getAllKpiTemplates(kpiTemplateParams?: KpiTemplateParams) {
    const whereCondition = {
      ...kpiTemplateParams,
      kpi_template_name: Like(
        `%${
          kpiTemplateParams.kpi_template_name
            ? kpiTemplateParams.kpi_template_name
            : ''
        }%`,
      ),
    };
    delete whereCondition.offset;
    delete whereCondition.limit;
    const [items, count] = await this.kpiTemplatesRepository.findAndCount({
      where: [whereCondition],
      order: {
        kpi_template_id: 'ASC',
      },
      skip: kpiTemplateParams.offset,
      take: kpiTemplateParams.limit,
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
    throw new HttpException('Kpi template not found', HttpStatus.NOT_FOUND);
  }

  async createKpiTemplate(kpiTemplate: CreateKpiTemplateDto) {
    const newKpiTemplate = await this.kpiTemplatesRepository.create(
      kpiTemplate,
    );
    await this.kpiTemplatesRepository.save(newKpiTemplate);
    return newKpiTemplate;
  }

  async updateKpiTemplate(id: number, kpiTemplate: UpdateKpiTemplateDto) {
    await this.kpiTemplatesRepository.update(id, kpiTemplate);
    const UpdatedKpiTemplate = await this.kpiTemplatesRepository.findOne(id);
    if (UpdatedKpiTemplate) {
      return UpdatedKpiTemplate;
    }
    throw new HttpException('Kpi template not found', HttpStatus.NOT_FOUND);
  }

  async deleteKpiTemplate(id: number) {
    const deleteResponse = await this.kpiTemplatesRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Kpi template not found', HttpStatus.NOT_FOUND);
    }
  }
}
