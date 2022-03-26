import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Crud } from './crud.entity';
import CrudsController from './cruds.controller';
import CrudsService from './cruds.service';

@Module({
  imports: [TypeOrmModule.forFeature([Crud])],
  controllers: [CrudsController],
  providers: [CrudsService],
})
export class CrudsModule {}
