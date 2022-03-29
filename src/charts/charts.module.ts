import { KpiTemplatesModule } from './../kpiTemplates/kpiTemplates.module';
import { UsersModule } from 'src/users/users.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardsModule } from 'src/dashboards/dashboards.module';
import { PlansModule } from 'src/plans/plans.module';
import { Chart } from './chart.entity';
import ChartsController from './charts.controller';
import ChartsService from './charts.service';
import { DeptsModule } from 'src/departments/depts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chart]),
    PlansModule,
    DashboardsModule,
    UsersModule,
    DeptsModule,
    KpiTemplatesModule,
  ],
  controllers: [ChartsController],
  providers: [ChartsService],
})
export class ChartsModule {}
