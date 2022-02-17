import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Plan from './plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import CreatePlanDto from './dto/createPlan.dto';
import UpdatePlanDto from './dto/updatePlan.dto';

@Injectable()
export default class PlansService {
  constructor(
    @InjectRepository(Plan)
    private plansRepository: Repository<Plan>,
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
      relations: ['user'],
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
    const UpdatedPlan = await this.plansRepository.findOne(id, {
      relations: ['user'],
    });
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
}
