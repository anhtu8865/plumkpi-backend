import User from 'src/users/user.entity';
import { KpiTemplateParams } from './../utils/types/kpiTemplateParams';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import CreateKpiTemplateDto from './dto/createKpiTemplate.dto';
import KpiTemplate from './kpiTemplate.entity';
import UpdateKpiTemplateDto from './dto/updateKpiTemplate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { CustomBadRequestException } from 'src/utils/exception/BadRequest.exception';
import { CustomInternalServerException } from 'src/utils/exception/InternalServer.exception';
import PostgresErrorCodes from 'src/database/postgresErrorCodes.enum';
import { CustomNotFoundException } from 'src/utils/exception/NotFound.exception';
import Role from 'src/users/role.enum';
import PlansService from 'src/plans/plans.service';

@Injectable()
export default class KpiTemplatesService {
  constructor(
    @InjectRepository(KpiTemplate)
    private kpiTemplatesRepository: Repository<KpiTemplate>,

    @Inject(forwardRef(() => PlansService))
    private readonly plansService: PlansService,
  ) {}

  async getKpiTemplatesOfCategory(params: KpiTemplateParams) {
    const { offset, limit, name, kpi_category_id } = params;

    const whereCondition = {
      kpi_template_name: name ? Like(`%${name}%`) : undefined,
      kpi_category: kpi_category_id ? { kpi_category_id } : undefined,
    };
    Object.keys(whereCondition).forEach(
      (key) => whereCondition[key] === undefined && delete whereCondition[key],
    );

    const [items, count] = await this.kpiTemplatesRepository.findAndCount({
      where: [whereCondition],
      order: { createdAt: 'ASC' },
      skip: offset,
      take: limit,
    });

    return {
      items,
      count,
    };
  }

  async getPersonalKpiTemplates(
    offset: number,
    limit: number,
    name: string,
    plan_id: number,
    user: User,
  ) {
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
      order: { createdAt: 'ASC' },
      skip: offset,
      take: limit,
    });

    const role = user.role;
    let registeredKpis = [];
    if (role === Role.Manager) {
      const dept_id = user.manage.dept_id;
      registeredKpis = await this.plansService.getPersonalKpisByManager(
        plan_id,
        dept_id,
      );
    } else {
      const user_id = user.user_id;
      registeredKpis = await this.plansService.getPersonalKpisByEmployee(
        plan_id,
        user_id,
      );
    }

    const registeredKpis_id = registeredKpis.map(
      (item) => item.plan_kpi_template.kpi_template.kpi_template_id,
    );
    for (const item of items) {
      if (registeredKpis_id.includes(item.kpi_template_id)) {
        item['registered'] = true;
      } else {
        item['registered'] = false;
      }
    }
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
      const newKpiTemplate = await this.kpiTemplatesRepository.create({
        ...data,
        measures: { items: data.measures ? data.measures : [] },
      });
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
      const temp = {
        ...data,
        measures: data.measures ? { items: data.measures } : undefined,
        kpi_template_id: id,
      };
      Object.keys(temp).forEach(
        (key) => temp[key] === undefined && delete temp[key],
      );

      await this.kpiTemplatesRepository.save(temp);
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
    try {
      const deleteResponse = await this.kpiTemplatesRepository.delete(id);
      if (!deleteResponse.affected) {
        throw new CustomNotFoundException(
          `KPI template id ${id} không tồn tại`,
        );
      }
    } catch (error) {
      if (error?.constraint === 'FK_b5ae39ca0e0b31ed88a7f950058') {
        throw new CustomBadRequestException(`KPI đang được sử dụng`);
      }
      throw error;
    }
  }

  async getKpiTemplates(ids: number[]) {
    return this.kpiTemplatesRepository.find({
      where: {
        kpi_template_id: In(ids),
      },
      order: { createdAt: 'ASC' },
    });
  }
}
