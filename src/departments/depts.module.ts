import { Module } from '@nestjs/common';
import DeptsController from './depts.controller';
import DeptsService from './depts.service';

@Module({
  imports: [],
  controllers: [DeptsController],
  providers: [DeptsService],
})
export class DeptsModule {}
