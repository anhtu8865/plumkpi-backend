import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import DeptsController from './depts.controller';
import DeptsService from './depts.service';
import Dept from './dept.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dept])],
  controllers: [DeptsController],
  providers: [DeptsService],
})
export class DeptsModule {}
