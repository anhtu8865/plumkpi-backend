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
import { CustomInternalServerException } from 'src/utils/exception/InternalServer.exception';

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
      order: { createdAt: 'ASC' },
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
      order: { createdAt: 'ASC' },
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

  async getAllDeptsWithEmployees() {
    const depts = await this.deptsRepository.find({
      select: ['dept_id', 'dept_name', 'users'],
      relations: ['users'],
      order: { createdAt: 'ASC' },
    });
    return depts.map((dept) => {
      return {
        dept_id: dept.dept_id,
        dept_name: dept.dept_name,
        users: dept.users.map((user) => {
          return {
            user_id: user.user_id,
            user_name: user.user_name,
            avatar: user.avatar,
            role: user.role,
          };
        }),
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
    throw new CustomNotFoundException(`Ph??ng ban id ${id} kh??ng t???n t???i`);
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
          `Ph??ng ban ${dept_name} ???? t???n t???i`,
        );
      }
      throw new CustomInternalServerException();
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
          `T??n ph??ng ban ${data?.dept_name} ???? t???n t???i`,
        );
      } else if (error?.constraint === 'REL_74948b4b9d61132c17b9ff2edb') {
        throw new CustomBadRequestException(
          `Ng?????i d??ng ${manager.user_name} ??ang qu???n l?? ph??ng ban ${manager.manage.dept_name}`,
        );
      }
      throw new CustomInternalServerException();
    } finally {
      await queryRunner.release();
    }
  }

  async deleteDept(id: number) {
    try {
      const deleteResponse = await this.deptsRepository.delete(id);
      if (!deleteResponse.affected) {
        throw new CustomNotFoundException(`Ph??ng ban id ${id} kh??ng t???n t???i`);
      }
    } catch (error) {
      if (error?.constraint === 'FK_8f95099ca7134ed69d2238f533b') {
        throw new CustomBadRequestException(`Ph??ng ban ??ang c?? ng?????i d??ng`);
      }
      if (error?.constraint === 'FK_1e5a58a4cbda2e681fd29df825e') {
        throw new CustomBadRequestException(`Ph??ng ban ??ang v???n h??nh`);
      }
      throw error;
    }
  }
}
