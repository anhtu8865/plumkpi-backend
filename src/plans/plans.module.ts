import { KpiTemplatesModule } from './../kpiTemplates/kpiTemplates.module';
import { KpiCategoriesModule } from './../kpiCategories/kpiCategories.module';
import PlanKpiCategory from 'src/plans/planKpiCategory.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import PlansController from './plans.controller';
import PlansService from './plans.service';
import Plan from './plan.entity';
import PlanKpiTemplate from './planKpiTemplate.entity';
import { PlanKpiTemplateDept } from './planKpiTemplateDept.entity';
import { PlanKpiTemplateUser } from './planKpiTemplateUser.entity';
import PlanKpiCategoryDept from './planKpiCategoryDept.entity';
import PlanKpiCategoryUser from './planKpiCategoryUser.entity';
import { FilesModule } from 'src/files/files.module';
import { NotifsModule } from 'src/notifications/notifs.module';
import { ChartsModule } from 'src/charts/charts.module';

@Module({
  imports: [
    KpiCategoriesModule,
    FilesModule,
    NotifsModule,
    forwardRef(() => ChartsModule),
    forwardRef(() => KpiTemplatesModule),
    TypeOrmModule.forFeature([
      Plan,
      PlanKpiCategory,
      PlanKpiCategoryDept,
      PlanKpiCategoryUser,
      PlanKpiTemplate,
      PlanKpiTemplateDept,
      PlanKpiTemplateUser,
    ]),
  ],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
