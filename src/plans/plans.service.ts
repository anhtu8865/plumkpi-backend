import { UpdateKpiCategoryDto } from './../plans/dto/updateKpiCategory.dto';
import PlanKpiCategories from 'src/plans/planKpiCategories.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Plan from './plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import CreatePlanDto from './dto/createPlan.dto';
import UpdatePlanDto from './dto/updatePlan.dto';
import AddKpiCategoryDto from './dto/addKpiCategory.dto';

@Injectable()
export default class PlansService {
  constructor(
    @InjectRepository(Plan)
    private plansRepository: Repository<Plan>,

    @InjectRepository(PlanKpiCategories)
    private plansKpiCategories: Repository<PlanKpiCategories>,
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

  async addKpiCategory(kpiCategory: AddKpiCategoryDto) {
    const temp = await this.plansKpiCategories.create(kpiCategory);
    await this.plansKpiCategories.save(temp);
  }

  async deleteKpiCategory(plan_id: number, kpi_category_id: number) {
    const temp = await this.plansKpiCategories.findOne({
      where: { plans: plan_id, kpi_categories: kpi_category_id },
      relations: ['plans'],
    });
    if (!temp) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    await this.plansKpiCategories.remove(temp);
  }

  async updateKpiCategory(kpiCategory: UpdateKpiCategoryDto) {
    const UpdatedPlan = await this.plansKpiCategories.findOne({
      where: {
        plans: kpiCategory.plan_id,
        kpi_categories: kpiCategory.kpi_category_id,
      },
      relations: ['plans'],
    });

    if (UpdatedPlan) {
      UpdatedPlan.weight = kpiCategory.weight;
      await this.plansKpiCategories.save(UpdatedPlan);
      return UpdatedPlan;
    }
    throw new HttpException('Plan not found', HttpStatus.NOT_FOUND);
  }
}
