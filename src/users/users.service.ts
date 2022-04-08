import { UserParams } from './../utils/types/userParams';
import Role from 'src/users/role.enum';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, QueryRunner, Repository } from 'typeorm';
import User from './user.entity';
import CreateUserDto from './dto/createUser.dto';
import UpdateUserDto from './dto/updateUser.dto';
import * as bcrypt from 'bcrypt';
import PostgresErrorCodes from 'src/database/postgresErrorCodes.enum';
import { FilesService } from 'src/files/files.service';
import Dept from 'src/departments/dept.entity';
import { CustomBadRequestException } from 'src/utils/exception/BadRequest.exception';
import DeptsService from 'src/departments/depts.service';
import { CustomNotFoundException } from 'src/utils/exception/NotFound.exception';
import UpdateInfoDto from './dto/updateInfo.dto';
import { CustomInternalServerException } from 'src/utils/exception/InternalServer.exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly filesService: FilesService,
    @Inject(forwardRef(() => DeptsService))
    private readonly deptsService: DeptsService,
  ) {}

  async getAllUsers(userParams: UserParams) {
    const whereCondition = {
      ...userParams,
      user_name: Like(`%${userParams.user_name ? userParams.user_name : ''}%`),
      email: Like(`%${userParams.email ? userParams.email : ''}%`),
      phone: userParams.phone ? Like(`%${userParams.phone}%`) : undefined,
    };

    delete whereCondition.offset;
    delete whereCondition.limit;
    Object.keys(whereCondition).forEach(
      (key) => whereCondition[key] === undefined && delete whereCondition[key],
    );

    const [items, count] = await this.usersRepository.findAndCount({
      where: [whereCondition],
      order: { createdAt: 'ASC' },
      skip: userParams.offset,
      take: userParams.limit,
    });

    return {
      items,
      count,
    };
  }

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOne({ email });
    if (user) {
      return user;
    }
    throw new CustomNotFoundException(`Email hoặc Password không chính xác`);
  }

  async getById(user_id: number) {
    const user = await this.usersRepository.findOne(
      {
        user_id,
      },
      // { relations: ['manage'] },
    );
    if (user) {
      return user;
    }
    throw new CustomNotFoundException(`Người dùng id ${user_id} không tồn tại`);
  }

  async createAdminAndDirector() {
    const hashedPassword = await bcrypt.hash('123456', 10);
    try {
      const admin = await this.usersRepository.create({
        user_name: 'Admin',
        email: 'admin@plumkpi.me',
        role: Role.Admin,
        password: hashedPassword,
      });
      await this.usersRepository.save(admin);

      const director = await this.usersRepository.create({
        user_name: 'Director',
        email: 'director@plumkpi.me',
        role: Role.Director,
        password: hashedPassword,
      });
      await this.usersRepository.save(director);
      return [admin, director];
    } catch (error) {
      throw error;
    }
  }

  async createUser(user_name: string, email: string, dept: Dept) {
    await this.deptsService.getDeptById(dept.dept_id);
    const hashedPassword = await bcrypt.hash('123456', 10);
    try {
      const newUser = await this.usersRepository.create({
        user_name,
        email,
        dept,
        password: hashedPassword,
      });
      await this.usersRepository.save(newUser);
      const result = await this.getById(newUser.user_id);
      return result;
    } catch (error) {
      if (error?.code === PostgresErrorCodes.UniqueViolation) {
        throw new CustomBadRequestException(`Email ${email} đã tồn tại`);
      }
      throw new CustomInternalServerException();
    }
  }

  async updateRole(id: number, role: Role, queryRunner: QueryRunner) {
    await queryRunner.manager.save(User, { role, user_id: id });
  }

  async updateDept(id: number, dept: Dept, queryRunner: QueryRunner) {
    await queryRunner.manager.save(User, { dept, user_id: id });
  }

  async updateUser(id: number, user: UpdateUserDto) {
    const userInDB = await this.getById(id);
    if (userInDB.role === Role.Manager && user.dept) {
      throw new CustomBadRequestException(
        'Không thể thay đổi phòng ban của quản lý',
      );
    }

    if (user?.password) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
    }
    try {
      await this.usersRepository.save({ ...user, user_id: id });
      const UpdatedUser = await this.getById(id);
      if (UpdatedUser) {
        return UpdatedUser;
      }
    } catch (error) {
      if (error?.code === PostgresErrorCodes.UniqueViolation) {
        throw new CustomBadRequestException(`Email ${user?.email} đã tồn tại`);
      }
      throw new CustomInternalServerException();
    }
  }

  async updateInfo(id: number, data: UpdateInfoDto) {
    try {
      await this.usersRepository.save({ ...data, user_id: id });
      return this.getById(id);
    } catch (error) {
      if (error?.constraint === 'UQ_a000cca60bcf04454e727699490') {
        throw new CustomBadRequestException(
          `Số điện thoại ${data.phone} đã tồn tại`,
        );
      }
    }
  }

  async deleteUser(id: number) {
    const user = await this.getById(id);
    try {
      const deleteResponse = await this.usersRepository.delete(id);
      if (!deleteResponse.affected) {
        throw new CustomNotFoundException(`Người dùng id ${id} không tồn tại`);
      }
    } catch (error) {
      if (error?.constraint === 'FK_74948b4b9d61132c17b9ff2edb6') {
        throw new CustomBadRequestException(
          `Người dùng ${user.user_name} đang quản lý phòng ban ${user.manage.dept_name}`,
        );
      }
      throw error;
    }
  }

  async addAvatar(userId: number, imageBuffer: Buffer, filename: string) {
    const user = await this.getById(userId);
    if (user.avatar) {
      await this.usersRepository.save({
        ...user,
        avatar: null,
      });
      await this.filesService.deletePublicFile(user.avatar.id);
    }
    const avatar = await this.filesService.uploadPublicFile(
      imageBuffer,
      filename,
    );
    await this.usersRepository.save({
      ...user,
      avatar,
    });
    return avatar;
  }

  async deleteAvatar(userId: number) {
    const user = await this.getById(userId);
    console.log(
      '🚀 ~ file: users.service.ts ~ line 182 ~ UsersService ~ deleteAvatar ~ user',
      user,
    );

    const fileId = user.avatar?.id;
    if (fileId) {
      await this.usersRepository.save({
        ...user,
        avatar: null,
      });
      await this.filesService.deletePublicFile(fileId);
    }
  }

  async getAllEmployees() {
    return this.usersRepository.find({
      select: ['user_id', 'user_name', 'email', 'avatar'],
      where: { role: Role.Employee },
      order: { createdAt: 'ASC' },
    });
  }

  async getEmployeesInDept(dept_id: number) {
    return this.usersRepository.find({
      where: { dept: { dept_id }, role: Role.Employee },
      select: ['user_id', 'user_name', 'email', 'avatar'],
      order: { createdAt: 'ASC' },
    });
  }

  async getEmployeesInDeptInfo(
    dept_id: number,
    offset: number,
    limit: number,
    user_name: string,
    email: string,
    phone: string,
  ) {
    const whereCondition = {
      offset,
      limit,
      user_name: Like(`%${user_name ? user_name : ''}%`),
      email: Like(`%${email ? email : ''}%`),
      phone: phone ? Like(`%${phone}%`) : undefined,
      dept: { dept_id },
      role: Role.Employee,
    };

    delete whereCondition.offset;
    delete whereCondition.limit;
    Object.keys(whereCondition).forEach(
      (key) => whereCondition[key] === undefined && delete whereCondition[key],
    );

    const [items, count] = await this.usersRepository.findAndCount({
      where: [whereCondition],
      relations: ['dept'],
      order: { createdAt: 'ASC' },
      skip: offset,
      take: limit,
    });

    for (const item of items) {
      delete item.manage;
      delete item.dept;
    }

    return {
      items,
      count,
    };
  }
}
