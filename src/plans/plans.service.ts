import PlanKpiCategories from 'src/plans/planKpiCategories.entity';
import Plan from './plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, In, Like, Not, Repository } from 'typeorm';
import CreatePlanDto from './dto/createPlan.dto';
import UpdatePlanDto from './dto/updatePlan.dto';
import KpiCategoriesService from 'src/kpiCategories/kpiCategories.service';
import PlanKpiTemplates from './planKpiTemplates.entity';
import KpiTemplatesService from 'src/kpiTemplates/kpiTemplates.service';
import { CustomBadRequestException } from 'src/utils/exception/BadRequest.exception';
import { CustomInternalServerException } from 'src/utils/exception/InternalServer.exception';
import { CustomNotFoundException } from 'src/utils/exception/NotFound.exception';
import { KpiCategoriesDto } from './dto/registerKpiCategories.dto';
import { Injectable } from '@nestjs/common';
import { KpisDto } from './dto/registerKpis.dto';

@Injectable()
export default class PlansService {
  constructor(
    @InjectRepository(Plan)
    private plansRepository: Repository<Plan>,

    @InjectRepository(PlanKpiCategories)
    private plansKpiCategories: Repository<PlanKpiCategories>,

    private readonly kpiCategoriesService: KpiCategoriesService,

    @InjectRepository(PlanKpiTemplates)
    private planKpiTemplates: Repository<PlanKpiTemplates>,

    private readonly kpiTemplatesService: KpiTemplatesService,

    private connection: Connection,
  ) {}

  async createPlan(data: CreatePlanDto) {
    try {
      const newPlan = await this.plansRepository.create(data);
      await this.plansRepository.save(newPlan);
      return newPlan;
    } catch (error) {
      if (error?.constraint === 'UQ_0b3866daf36d0d6520c9d1f5ef3') {
        throw new CustomBadRequestException(
          `Tên kế hoạch ${data.plan_name} đã tồn tại`,
        );
      }
      if (error?.constraint === 'UQ_8d17b2be5eac04d0afa1ebb449a') {
        throw new CustomBadRequestException(
          `Năm kế hoạch ${data.year} đã tồn tại`,
        );
      }
      throw new CustomInternalServerException();
    }
  }
  async getPlanById(id: number) {
    try {
      const plan = await this.plansRepository.findOne(id);
      if (plan) {
        return plan;
      }
      throw new CustomNotFoundException(`Kế hoạch id ${id} không tồn tại`);
    } catch (error) {
      throw error;
    }
  }

  async getPlanKpiCategories(plan_id: number) {
    try {
      const result = await this.plansKpiCategories.find({
        where: { plan: { plan_id } },
        relations: ['kpi_category'],
      });
      if (result) {
        return result;
      }
      throw new CustomNotFoundException(`Kế hoạch id ${plan_id} không tồn tại`);
    } catch (error) {
      throw error;
    }
  }

  async updatePlan(id: number, data: UpdatePlanDto) {
    await this.getPlanById(id);
    try {
      await this.plansRepository.save({ ...data, plan_id: id });
      const UpdatedPlan = await this.plansRepository.findOne(id);
      return UpdatedPlan;
    } catch (error) {
      if (error?.constraint === 'UQ_0b3866daf36d0d6520c9d1f5ef3') {
        throw new CustomBadRequestException(
          `Tên kế hoạch ${data.plan_name} đã tồn tại`,
        );
      }
      if (error?.constraint === 'UQ_8d17b2be5eac04d0afa1ebb449a') {
        throw new CustomBadRequestException(
          `Năm kế hoạch ${data.year} đã tồn tại`,
        );
      }
      throw new CustomInternalServerException();
    }
  }

  async deletePlan(id: number) {
    try {
      const deleteResponse = await this.plansRepository.delete(id);
      if (!deleteResponse.affected) {
        throw new CustomNotFoundException(`Kế hoạch id ${id} không tồn tại`);
      }
    } catch (error) {
      throw error;
    }
  }

  async getPlans(offset: number, limit: number, name?: string) {
    const [items, count] = await this.plansRepository.findAndCount({
      where: [{ plan_name: Like(`%${name ? name : ''}%`) }],
      order: {
        year: 'DESC',
      },
      skip: offset,
      take: limit,
    });

    return {
      items,
      count,
    };
  }

  async registerKpiCategories(
    plan_id: number,
    kpiCategories: KpiCategoriesDto[],
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const sum = kpiCategories.reduce((result, item) => {
        return result + item.weight;
      }, 0);
      if (sum !== 100 && kpiCategories.length !== 0) {
        throw new CustomBadRequestException(
          `Tổng trọng số các danh mục KPI phải bằng 100%`,
        );
      }

      const kpiCategoriesInDB = await queryRunner.manager.find(
        PlanKpiCategories,
        {
          where: { plan: { plan_id } },
          relations: ['kpi_category'],
        },
      );
      const kpiCategoriesIdInDB = kpiCategoriesInDB.map(
        (item) => item.kpi_category.kpi_category_id,
      );
      const kpiCategoriesId = kpiCategories.map((item) => item.kpi_category_id);
      const deleteKpiCategoriesId = kpiCategoriesIdInDB.filter(
        (item) => !kpiCategoriesId.includes(item),
      );
      const kpisInDB = await queryRunner.manager.find(PlanKpiTemplates, {
        where: {
          plan: { plan_id },
          kpi_template: {
            kpi_category: { kpi_category_id: In(deleteKpiCategoriesId) },
          },
        },
        relations: ['kpi_template'],
      });
      if (kpisInDB.length > 0) {
        throw new CustomBadRequestException(
          `Không thể xoá danh mục KPI do vẫn còn KPI mẫu thuộc danh mục này trong kế hoạch`,
        );
      }

      await queryRunner.manager.delete(PlanKpiCategories, {
        plan: { plan_id },
        kpi_category: { kpi_category_id: In(deleteKpiCategoriesId) },
      });

      for (const kpiCategory of kpiCategories) {
        const { kpi_category_id, weight } = kpiCategory;
        await queryRunner.manager.save(PlanKpiCategories, {
          kpi_category: { kpi_category_id },
          plan: { plan_id },
          weight,
        });
      }

      const plan = await queryRunner.manager.find(PlanKpiCategories, {
        where: { plan: { plan_id } },
        relations: ['kpi_category'],
      });
      await queryRunner.commitTransaction();
      return plan;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async registerKpis(
    plan_id: number,
    kpi_category_id: number,
    kpis: KpisDto[],
  ) {
    const sum = kpis.reduce((result, item) => {
      return result + item.weight;
    }, 0);
    if (sum !== 100 && kpis.length !== 0) {
      throw new CustomBadRequestException(
        `Tổng trọng số các KPIs phải bằng 100%`,
      );
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const kpisInDB = await queryRunner.manager.find(PlanKpiTemplates, {
        where: { kpi_template: { kpi_category: { kpi_category_id } } },
        relations: ['kpi_template'],
      });
      const kpisIdInDB = [];
      for (const kpi of kpisInDB) {
        kpisIdInDB.push(kpi.kpi_template.kpi_template_id);
      }
      const kpisId = [];
      for (const kpi of kpis) {
        kpisId.push(kpi.kpi_template_id);
      }
      const deleteKpisId = kpisIdInDB.filter((item) => !kpisId.includes(item));
      await queryRunner.manager.delete(PlanKpiTemplates, {
        kpi_template: { kpi_template_id: In(deleteKpisId) },
      });

      const result = [];
      for (const kpi of kpis) {
        const { kpi_template_id, weight } = kpi;
        const temp = await queryRunner.manager.save(PlanKpiTemplates, {
          plan: { plan_id },
          kpi_template: { kpi_template_id },
          weight,
        });
        result.push(temp);
      }
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getKpisOfOneCategory(
    plan_id: number,
    offset: number,
    limit: number,
    name: string,
    kpi_category_id: number,
  ) {
    const [items, count] = await this.planKpiTemplates.findAndCount({
      where: {
        plan: { plan_id },
        kpi_template: {
          kpi_category: { kpi_category_id },
          kpi_template_name: Like(`%${name ? name : ''}%`),
        },
      },
      relations: ['kpi_template'],
      order: {
        kpi_template: 'ASC',
      },
      skip: offset,
      take: limit,
    });
    for (const item of items) {
      delete item.kpi_template.kpi_category;
    }
    return {
      items,
      count,
    };
  }
  /* 

  async getAllPlansOfUser(
    user: User,
    offset?: number,
    limit?: number,
    name?: string,
  ) {
    const [items, count] = await this.plansRepository.findAndCount({
      where: [{ plan_name: Like(`%${name ? name : ''}%`), user }],
      order: {
        plan_id: 'ASC',
      },
      skip: offset,
      take: limit,
    });

    return {
      items,
      count,
    };
  }

  

  async getPlanOfUserById(id: number, user: User) {
    const plan = await this.plansRepository.findOne({
      where: { plan_id: id, user: user },
      relations: ['user', 'plan_kpi_categories', 'plan_kpi_templates'],
    });
    if (plan) {
      return plan;
    }
    throw new HttpException('Plan not found', HttpStatus.NOT_FOUND);
  }

  



  
  async deleteKpiCategory(plan_id: number, kpi_category_id: number) {
    const temp = await this.plansKpiCategories.findOne({
      where: { plan: plan_id, kpi_category: kpi_category_id },
      relations: ['plan'],
    });
    if (!temp) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    await this.plansKpiCategories.remove(temp);
  }

  async addKpiCategories(body: AddKpiCategoriesDto) {
    const sumCategories = body.kpi_categories.reduce(function (result, item) {
      return result + item.weight;
    }, 0);
    if (sumCategories !== 100 && body.kpi_categories.length !== 0) {
      throw new HttpException(
        'Sum Of categories must be 100',
        HttpStatus.BAD_REQUEST,
      );
    }
    for (const temp of body.kpi_categories) {
      const sumTemplates = temp?.kpi_templates.reduce(function (result, item) {
        return result + item.weight;
      }, 0);
      if (sumTemplates !== 100) {
        throw new HttpException(
          'Sum Of templates must be 100',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    await this.planKpiTemplates.delete({
      plan: { plan_id: body.plan_id },
    });
    await this.plansKpiCategories.delete({
      plan: { plan_id: body.plan_id },
    });

    for (const temp of body.kpi_categories) {
      const plan = await this.getPlanById(body.plan_id);
      const kpi_category = await this.kpiCategoriesService.getKpiCategoryById(
        temp.kpi_category_id,
      );

      const newRecord = await this.plansKpiCategories.create({
        weight: temp.weight,
        plan: plan,
        kpi_category: kpi_category,
      });
      await this.plansKpiCategories.save(newRecord);

      for (const temp2 of temp.kpi_templates) {
        const kpi_template = await this.kpiTemplatesService.getKpiTemplateById(
          temp2.kpi_template_id,
        );

        const newRecord = await this.planKpiTemplates.create({
          weight: temp2.weight,
          plan: plan,
          kpi_template: kpi_template,
        });
        await this.planKpiTemplates.save(newRecord);
      }
    }
  }

  async registerKpi(body: RegisterKpi) {
    if (body.parent_target) {
      const sumTarget = body.children.reduce(function (result, item) {
        return result + item.target;
      }, 0);
      if (sumTarget !== body.parent_target) {
        throw new HttpException(
          'Sum Of categories must be the same as parent target',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      body.parent_target = null;
    }

    // TODO: update target of parent plan
    const planKpiTemplate = await this.planKpiTemplates.findOne({
      where: {
        plan: { plan_id: body.parent_plan_id },
        kpi_template: { kpi_template_id: body.kpi_template_id },
      },
      relations: ['plan', 'kpi_template'],
    });
    await this.planKpiTemplates.save({
      ...planKpiTemplate,
      target: body.parent_target,
    });

    // TODO: create child plan if it doest not exist for managers and assign kpi template
    const parent_plan = await this.getPlanById(body.parent_plan_id);
    const children_plan = await this.plansRepository.find({
      parent_plan: parent_plan,
    });
    for (const child of children_plan) {
      await this.planKpiTemplates.delete({
        plan: child,
        kpi_template: { kpi_template_id: body.kpi_template_id },
      });
    }

    for (const child of body.children) {
      let child_plan = await this.plansRepository.findOne({
        where: { parent_plan: parent_plan, user: { user_id: child.user_id } },
        relations: ['user', 'plan_kpi_categories', 'plan_kpi_templates'],
      });
      if (!child_plan) {
        const createPlanDto = {
          plan_name: parent_plan.plan_name,
          description: parent_plan.description,
          start_date: parent_plan.start_date,
          end_date: parent_plan.end_date,
          user: { user_id: child.user_id },
          parent_plan: parent_plan,
        };
        child_plan = await this.createPlan(createPlanDto);
      }

      const newRecord = await this.planKpiTemplates.create({
        target: child.target,
        plan: child_plan,
        kpi_template: { kpi_template_id: body.kpi_template_id },
      });

      await this.planKpiTemplates.save(newRecord);
    }
  }

  async registerPersonalKpi(body: RegisterPersonalKpiDto) {
    const newRecord = await this.planKpiTemplates.create({
      ...body,
      approve_registration: ApproveRegistration.Pending,
    });
    await this.planKpiTemplates.save(newRecord);
    return newRecord;
  }

  async deletePersonalKpi(plan_id: number, kpi_template_id: number) {
    const temp = await this.planKpiTemplates.findOne({
      where: { plan: plan_id, kpi_template: kpi_template_id },
      relations: ['plan'],
    });
    if (!temp) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    await this.planKpiTemplates.remove(temp);
  }

  async getInfoRegisterKpi(plan_id: number, kpi_template_id: number) {
    const parent_plan_id = plan_id;
    const result = await this.planKpiTemplates.find({
      select: ['target'],
      relations: ['plan', 'plan.user'],
      where: {
        plan: { parent_plan: { plan_id: parent_plan_id } },
        kpi_template: { kpi_template_id: kpi_template_id },
      },
    });
    for (const record of result) {
      delete record.kpi_template;
    }
    return result;
  }

  async getPersonalKpis(
    parent_plan_id: number,
    offset?: number,
    limit?: number,
    name?: string,
  ) {
    const [items, count] = await this.planKpiTemplates.findAndCount({
      where: {
        approve_registration: Not(ApproveRegistration.None),
        plan: { parent_plan: { plan_id: parent_plan_id } },
      },
      relations: ['plan', 'plan.user'],
      skip: offset,
      take: limit,
    });

    return {
      items,
      count,
    };
  }

  async approvePersonalKpis(id: number, body: ApprovePersonalKpisDto) {
    for (const row of body.rows) {
      // const updateRow = await this.planKpiTemplates.findOne(row);
      // console.log(
      //   '🚀 ~ file: plans.service.ts ~ line 311 ~ PlansService ~ approvePersonalKpis ~ updateRow',
      //   updateRow,
      // );
      // photoToUpdate.name = 'Me, my friends and polar bears';

      await this.planKpiTemplates.save(row);
    }
  } */
}
