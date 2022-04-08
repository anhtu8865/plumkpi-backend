import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import KpiTemplatesController from './kpiTemplates.controller';
import KpiTemplatesService from './kpiTemplates.service';
import KpiTemplate from './kpiTemplate.entity';
import { PlansModule } from 'src/plans/plans.module';

@Module({
  imports: [PlansModule, TypeOrmModule.forFeature([KpiTemplate])],
  controllers: [KpiTemplatesController],
  providers: [KpiTemplatesService],
  exports: [KpiTemplatesService],
})
export class KpiTemplatesModule {}
