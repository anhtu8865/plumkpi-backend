import User from 'src/users/user.entity';
import PlanKpiCategories from 'src/plans/planKpiCategories.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Plan from './plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import CreatePlanDto from './dto/createPlan.dto';
import UpdatePlanDto from './dto/updatePlan.dto';
import KpiCategoriesService from 'src/kpiCategories/kpiCategories.service';
import AddKpiCategoriesDto from './dto/addKpiCategories.dto';
import PlanKpiTemplates from './planKpiTemplates.entity';
import KpiTemplatesService from 'src/kpiTemplates/kpiTemplates.service';
import AssignKpi from './dto/assignKpi.dto';

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
  ) {}

  async getAllPlans(offset?: number, limit?: number, name?: string) {
    const [items, count] = await this.plansRepository.findAndCount({
      where: [{ plan_name: Like(`%${name ? name : ''}%`) }],
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

  async getPlanById(id: number) {
    const plan = await this.plansRepository.findOne(id, {
      relations: ['user', 'plan_kpi_categories', 'plan_kpi_templates'],
    });
    if (plan) {
      return plan;
    }
    throw new HttpException('Plan not found', HttpStatus.NOT_FOUND);
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

  async createPlan(plan: CreatePlanDto) {
    const newPlan = await this.plansRepository.create(plan);
    await this.plansRepository.save(newPlan);
    return newPlan;
  }

  async updatePlan(id: number, plan: UpdatePlanDto) {
    await this.plansRepository.update(id, plan);
    const UpdatedPlan = await this.plansRepository.findOne(id);
    if (UpdatedPlan) {
      return UpdatedPlan;
    }
    throw new HttpException('Plan not found', HttpStatus.NOT_FOUND);
  }

  async deletePlan(id: number) {
    const deleteResponse = await this.plansRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Plan not found', HttpStatus.NOT_FOUND);
    }
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
    const sumCategories = body?.kpi_categories.reduce(function (result, item) {
      return result + item.weight;
    }, 0);
    if (sumCategories !== 100) {
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

  async assignKpi(body: AssignKpi) {
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
      plan_parent: parent_plan,
    });
    for (const child of children_plan) {
      await this.planKpiTemplates.delete({
        plan: child,
        kpi_template: { kpi_template_id: body.kpi_template_id },
      });
    }

    for (const child of body.children) {
      let child_plan = await this.plansRepository.findOne({
        where: { plan_parent: parent_plan, user: { user_id: child.user_id } },
        relations: ['user', 'plan_kpi_categories', 'plan_kpi_templates'],
      });
      if (!child_plan) {
        const createPlanDto = {
          plan_name: parent_plan.plan_name,
          description: parent_plan.description,
          start_date: parent_plan.start_date,
          end_date: parent_plan.end_date,
          user: { user_id: child.user_id },
          plan_parent: parent_plan,
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
}
