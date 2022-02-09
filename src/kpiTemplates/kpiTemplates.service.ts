import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import CreateKpiTemplateDto from './dto/createKpiTemplate.dto';
import KpiTemplate from './kpiTemplate.entity';
import UpdateKpiTemplateDto from './dto/updateKpiTemplate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export default class KpiTemplatesService {
  constructor(
    @InjectRepository(KpiTemplate)
    private kpiTemplatesRepository: Repository<KpiTemplate>,
  ) {}

  async getAllKpiTemplates(offset?: number, limit?: number) {
    const [items, count] = await this.kpiTemplatesRepository.findAndCount({
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
