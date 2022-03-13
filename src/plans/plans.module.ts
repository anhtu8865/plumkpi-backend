import { KpiTemplatesModule } from './../kpiTemplates/kpiTemplates.module';
import { KpiCategoriesModule } from './../kpiCategories/kpiCategories.module';
import PlanKpiCategory from 'src/plans/planKpiCategory.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import PlansController from './plans.controller';
import PlansService from './plans.service';
import Plan from './plan.entity';
import PlanKpiTemplate from './planKpiTemplate.entity';
import { PlanKpiTemplateDept } from './planKpiTemplateDept.entity';
import { PlanKpiTemplateUser } from './planKpiTemplateUser.entity';

@Module({
  imports: [
    KpiCategoriesModule,
    KpiTemplatesModule,
    TypeOrmModule.forFeature([
      Plan,
      PlanKpiCategory,
      PlanKpiTemplate,
      PlanKpiTemplateDept,
      PlanKpiTemplateUser,
    ]),
  ],
  controllers: [PlansController],
  providers: [PlansService],
})
export class PlansModule {}
