import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import KpiTemplatesController from './kpiTemplates.controller';
import KpiTemplatesService from './kpiTemplates.service';
import KpiTemplate from './kpiTemplate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KpiTemplate])],
  controllers: [KpiTemplatesController],
  providers: [KpiTemplatesService],
})
export class KpiTemplatesModule {}
