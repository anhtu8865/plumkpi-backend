import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import CreateDeptDto from './dto/createDept.dto';
import Dept from './dept.entity';
import UpdateDeptDto from './dto/updateDept.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Like, Repository } from 'typeorm';
import User from 'src/users/user.entity';
import { CustomNotFoundException } from 'src/utils/exception/NotFound.exception';
import { CustomBadRequestException } from 'src/utils/exception/BadRequest.exception';
import PostgresErrorCodes from 'src/database/postgresErrorCodes.enum';
import { UsersService } from 'src/users/users.service';
import Role from 'src/users/role.enum';

@Injectable()
export default class DeptsService {
  constructor(
    @InjectRepository(Dept)
    private deptsRepository: Repository<Dept>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private connection: Connection,
  ) {}

  async getDepts(offset: number, limit: number, name?: string) {
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

  async getAllDepts() {
    const depts = await this.deptsRepository.find({
      select: ['dept_id', 'dept_name', 'manager'],
      relations: ['manager'],
    });
    return depts.map((dept) => {
      return {
        dept_id: dept.dept_id,
        dept_name: dept.dept_name,
        manager: dept.manager
          ? {
              user_id: dept.manager.user_id,
              user_name: dept.manager.user_name,
              avatar: dept.manager.avatar,
            }
          : null,
      };
    });
  }

  async getDeptById(id: number) {
    const dept = await this.deptsRepository.findOne(id, {
      relations: ['users', 'manager'],
    });
    if (dept) {
      return dept;
    }
    throw new CustomNotFoundException(`Phòng ban id ${id} không tồn tại`);
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

  async createDept(dept_name: string, description: string) {
    try {
      const newDept = await this.deptsRepository.create({
        dept_name,
        description,
      });
      await this.deptsRepository.save(newDept);
      return newDept;
    } catch (error) {
      if (error?.code === PostgresErrorCodes.UniqueViolation) {
        throw new CustomBadRequestException(
          `Phòng ban ${dept_name} đã tồn tại`,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateDept(id: number, data: UpdateDeptDto) {
    const queryRunner = this.connection.createQueryRunner();
    const dept = await this.getDeptById(id);
    const manager = data.manager
      ? await this.usersService.getById(data.manager.user_id)
      : data.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if ((manager || manager === null) && dept.manager) {
      await this.usersService.updateRole(
        dept.manager.user_id,
        Role.Employee,
        queryRunner,
      );
    }

    if (manager) {
      await this.usersService.updateRole(
        manager.user_id,
        Role.Manager,
        queryRunner,
      );
      await this.usersService.updateDept(manager.user_id, dept, queryRunner);
    }

    try {
      await queryRunner.manager.save(Dept, { ...data, dept_id: id });
      await queryRunner.commitTransaction();
      const updateDept = await this.deptsRepository.findOne(id, {
        relations: ['manager'],
      });
      return updateDept;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error?.constraint === 'UQ_8a367b88085d359eb2fc3f4d2e6') {
        throw new CustomBadRequestException(
          `Tên phòng ban ${data?.dept_name} đã tồn tại`,
        );
      } else if (error?.constraint === 'REL_74948b4b9d61132c17b9ff2edb') {
        throw new CustomBadRequestException(
          `Người dùng ${manager.user_name} đang quản lý phòng ban ${manager.manage.dept_name}`,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteDept(id: number) {
    try {
      const deleteResponse = await this.deptsRepository.delete(id);
      if (!deleteResponse.affected) {
        throw new CustomNotFoundException(`Phòng ban id ${id} không tồn tại`);
      }
    } catch (error) {
      if (error?.constraint === 'FK_8f95099ca7134ed69d2238f533b') {
        throw new CustomBadRequestException(`Phòng ban đang có người dùng`);
      }
      throw error;
    }
  }
}
