import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import DeptsController from './depts.controller';
import DeptsService from './depts.service';
import Dept from './dept.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Dept]), forwardRef(() => UsersModule)],
  controllers: [DeptsController],
  providers: [DeptsService],
  exports: [DeptsService],
})
export class DeptsModule {}
