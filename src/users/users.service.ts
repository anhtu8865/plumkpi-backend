import { UserParams } from './../utils/types/userParams';
import Role from 'src/users/role.enum';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import User from './user.entity';
import CreateUserDto from './dto/createUser.dto';
import UpdateUserDto from './dto/updateUser.dto';
import * as bcrypt from 'bcrypt';
import PostgresErrorCodes from 'src/database/postgresErrorCodes.enum';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly filesService: FilesService,
  ) {}

  async getAllUsers(userParams?: UserParams) {
    const whereCondition = {
      ...userParams,
      user_name: Like(`%${userParams.user_name ? userParams.user_name : ''}%`),
      email: Like(`%${userParams.email ? userParams.email : ''}%`),
    };
    delete whereCondition.offset;
    delete whereCondition.limit;

    const [items, count] = await this.usersRepository.findAndCount({
      where: [whereCondition],
      order: {
        user_id: 'ASC',
      },
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
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getById(user_id: number) {
    const user = await this.usersRepository.findOne(
      {
        user_id,
      },
      { relations: ['manage'] },
    );
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async createUser(userData: CreateUserDto) {
    if (
      [Role.Admin, Role.Director].includes(userData.role) &&
      (userData?.dept || userData?.manage)
    ) {
      throw new HttpException(
        'Admin or Director does not belong to any deparments',
        HttpStatus.BAD_REQUEST,
      );
    } else if (
      [Role.Manager, Role.Employee].includes(userData.role) &&
      !userData.dept
    ) {
      throw new HttpException(
        'Manager or Employee must belong to a deparment',
        HttpStatus.BAD_REQUEST,
      );
    } else if (
      userData.role === Role.Manager &&
      userData.dept?.dept_id !== userData.manage?.dept_id
    ) {
      throw new HttpException(
        'Dept and Manage are different',
        HttpStatus.BAD_REQUEST,
      );
    } else if (userData.role === Role.Employee && userData.manage) {
      throw new HttpException(
        'Employee do not manage any departments',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    try {
      const newUser = await this.usersRepository.create({
        ...userData,
        password: hashedPassword,
      });
      await this.usersRepository.save(newUser);
      const result = await this.getById(newUser.user_id);
      return result;
    } catch (error) {
      if (error?.code === PostgresErrorCodes.UniqueViolation) {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(id: number, user: UpdateUserDto) {
    if (user?.password) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
    }

    await this.usersRepository.save({ ...user, user_id: id });
    const UpdatedUser = await this.getById(id);
    if (UpdatedUser) {
      return UpdatedUser;
    }
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async deleteUser(id: number) {
    const deleteResponse = await this.usersRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  async addAvatar(userId: number, imageBuffer: Buffer, filename: string) {
    const user = await this.getById(userId);
    if (user.avatar) {
      await this.usersRepository.update(userId, {
        ...user,
        avatar: null,
      });
      await this.filesService.deletePublicFile(user.avatar.id);
    }
    const avatar = await this.filesService.uploadPublicFile(
      imageBuffer,
      filename,
    );
    await this.usersRepository.update(userId, {
      ...user,
      avatar,
    });
    return avatar;
  }

  async deleteAvatar(userId: number) {
    const user = await this.getById(userId);
    const fileId = user.avatar?.id;
    if (fileId) {
      await this.usersRepository.update(userId, {
        ...user,
        avatar: null,
      });
      await this.filesService.deletePublicFile(fileId);
    }
  }
}
