import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardsModule } from 'src/dashboards/dashboards.module';
import { PlansModule } from 'src/plans/plans.module';
import { Chart } from './chart.entity';
import ChartsController from './charts.controller';
import ChartsService from './charts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Chart]), PlansModule, DashboardsModule],
  controllers: [ChartsController],
  providers: [ChartsService],
})
export class ChartsModule {}
