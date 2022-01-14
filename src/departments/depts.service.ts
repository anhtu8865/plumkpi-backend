import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import CreateDeptDto from './dto/createDept.dto';
import Dept from './dept.entity';
import UpdateDeptDto from './dto/updateDept.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export default class DeptsService {
  constructor(
    @InjectRepository(Dept)
    private deptsRepository: Repository<Dept>,
  ) {}

  getAllDepts() {
    return this.deptsRepository.find();
  }

  async getDeptById(id: number) {
    const dept = await this.deptsRepository.findOne(id, {
      relations: ['users'],
    });
    if (dept) {
      return dept;
    }
    throw new HttpException('Dept not found', HttpStatus.NOT_FOUND);
  }

  async createDept(dept: CreateDeptDto) {
    const newDept = await this.deptsRepository.create(dept);
    await this.deptsRepository.save(newDept);
    return newDept;
  }

  async updateDept(id: number, dept: UpdateDeptDto) {
    await this.deptsRepository.update(id, dept);
    const UpdatedDept = await this.deptsRepository.findOne(id, {
      relations: ['users'],
    });
    if (UpdatedDept) {
      return UpdatedDept;
    }
    throw new HttpException('Dept not found', HttpStatus.NOT_FOUND);
  }

  async deleteDept(id: number) {
    const deleteResponse = await this.deptsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Dept not found', HttpStatus.NOT_FOUND);
    }
  }
}
