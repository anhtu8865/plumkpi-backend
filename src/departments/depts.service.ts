import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import CreateDeptDto from './dto/createDept.dto';
import Dept from './dept.entity';
import UpdateDeptDto from './dto/updateDept.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import User from 'src/users/user.entity';

@Injectable()
export default class DeptsService {
  constructor(
    @InjectRepository(Dept)
    private deptsRepository: Repository<Dept>,
  ) {}

  async getAllDepts(offset?: number, limit?: number, name?: string) {
    const [items, count] = await this.deptsRepository.findAndCount({
      where: [{ dept_name: Like(`%${name ? name : ''}%`) }],
      order: {
        dept_id: 'ASC',
      },
      skip: offset,
      take: limit,
      relations: ['manager'],
    });

    return {
      items,
      count,
    };
  }

  async getDeptById(id: number) {
    const dept = await this.deptsRepository.findOne(id, {
      relations: ['users', 'manager'],
    });
    if (dept) {
      return dept;
    }
    throw new HttpException('Dept not found', HttpStatus.NOT_FOUND);
  }

  async getDeptByManager(user: User) {
    const dept = await this.deptsRepository.findOne(
      {
        manager: user,
      },
      { relations: ['users'] },
    );
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
      relations: ['manager'],
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
