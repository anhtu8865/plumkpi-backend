import { KpiCategoriesModule } from './../kpiCategories/kpiCategories.module';
import PlanKpiCategories from 'src/plans/planKpiCategories.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import PlansController from './plans.controller';
import PlansService from './plans.service';
import Plan from './plan.entity';

@Module({
  imports: [
    KpiCategoriesModule,
    TypeOrmModule.forFeature([Plan, PlanKpiCategories]),
  ],
  controllers: [PlansController],
  providers: [PlansService],
})
export class PlansModule {}
