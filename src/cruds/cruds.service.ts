import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Crud } from './crud.entity';
import { CreateCrudDto, UpdateCrudDto } from './dto/crud.dto';

@Injectable()
export default class CrudsService {
  constructor(
    @InjectRepository(Crud)
    private crudsRepository: Repository<Crud>,
  ) {}

  async createCrud(data: CreateCrudDto, user_id: number) {
    return this.crudsRepository.save({ ...data, user: { user_id } });
  }

  async deleteCrud(crud_id: number, user_id: number) {
    const crud = await this.crudsRepository.findOne({
      crud_id,
      user: { user_id },
    });
    if (crud) {
      return this.crudsRepository.remove(crud);
    }
    throw new BadRequestException(`Không tìm thấy crud id ${crud_id}`);
  }

  async updateCrud(data: UpdateCrudDto, crud_id: number, user_id: number) {
    const crud = await this.crudsRepository.findOne({
      crud_id,
      user: { user_id },
    });
    if (crud) {
      return this.crudsRepository.save({ ...crud, ...data });
    }
    throw new BadRequestException(`Không tìm thấy crud id ${crud_id}`);
  }

  async getCruds(user_id: number, crud_name: string) {
    return this.crudsRepository.find({
      user: { user_id },
      crud_name: Like(`%${crud_name ? crud_name : ''}%`),
    });
  }
}
