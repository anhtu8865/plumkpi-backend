import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './user.entity';
import UsersController from './users.controller';
import { FilesModule } from 'src/files/files.module';
import { DeptsModule } from 'src/departments/depts.module';
import Time from './time.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Time]),
    FilesModule,
    forwardRef(() => DeptsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
