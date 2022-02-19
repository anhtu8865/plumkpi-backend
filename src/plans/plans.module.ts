import { KpiTemplatesModule } from './../kpiTemplates/kpiTemplates.module';
import { KpiCategoriesModule } from './../kpiCategories/kpiCategories.module';
import PlanKpiCategories from 'src/plans/planKpiCategories.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import PlansController from './plans.controller';
import PlansService from './plans.service';
import Plan from './plan.entity';
import PlanKpiTemplates from './planKpiTemplates.entity';

@Module({
  imports: [
    KpiCategoriesModule,
    KpiTemplatesModule,
    TypeOrmModule.forFeature([Plan, PlanKpiCategories, PlanKpiTemplates]),
  ],
  controllers: [PlansController],
  providers: [PlansService],
})
export class PlansModule {}
