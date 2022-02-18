import PlanKpiCategories from 'src/plans/planKpiCategories.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Plan from './plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import CreatePlanDto from './dto/createPlan.dto';
import UpdatePlanDto from './dto/updatePlan.dto';
import KpiCategoriesService from 'src/kpiCategories/kpiCategories.service';
import AddKpiCategoriesDto from './dto/addKpiCategories.dto';

@Injectable()
export default class PlansService {
  constructor(
    @InjectRepository(Plan)
    private plansRepository: Repository<Plan>,

    @InjectRepository(PlanKpiCategories)
    private plansKpiCategories: Repository<PlanKpiCategories>,

    private readonly kpiCategoriesService: KpiCategoriesService,
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

  async getPlanById(id: number) {
    const plan = await this.plansRepository.findOne(id, {
      relations: ['user', 'plan_kpi_categories'],
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
    await this.plansKpiCategories.delete({
      plan: { plan_id: body.plan_id },
    });
    const sum = body.kpi_categories.reduce(function (result, item) {
      return result + item.weight;
    }, 0);

    if (sum !== 100) {
      throw new HttpException('Sum must be 100', HttpStatus.BAD_REQUEST);
    }

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
    }
  }
}
