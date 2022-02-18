import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import KpiCategoriesController from './kpiCategories.controller';
import KpiCategoriesService from './kpiCategories.service';
import KpiCategory from './kpiCategory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KpiCategory])],
  controllers: [KpiCategoriesController],
  providers: [KpiCategoriesService],
  exports: [KpiCategoriesService],
})
export class KpiCategoriesModule {}
