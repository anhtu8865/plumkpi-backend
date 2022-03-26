import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import CrudsService from './cruds.service';
import { CreateCrudDto, UpdateCrudDto } from './dto/crud.dto';
import { CrudIdParam, CrudNameParam } from './params/crudParams';

@Controller('cruds')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthenticationGuard)
export default class CrudsController {
  constructor(private readonly crudsService: CrudsService) {}

  @Post()
  async createCrud(
    @Body() { crud_name, description }: CreateCrudDto,
    @Req() request: RequestWithUser,
  ) {
    return this.crudsService.createCrud(
      {
        crud_name,
        description,
      },
      request.user.user_id,
    );
  }

  @Put('crud')
  async updateCrud(
    @Query() { crud_id }: CrudIdParam,
    @Body() { crud_name, description }: UpdateCrudDto,
    @Req() request: RequestWithUser,
  ) {
    const user_id = request.user.user_id;
    crud_id = Number(crud_id);
    return this.crudsService.updateCrud(
      { crud_name, description },
      crud_id,
      user_id,
    );
  }

  @Delete('crud')
  async deleteCrud(
    @Query() { crud_id }: CrudIdParam,
    @Req() request: RequestWithUser,
  ) {
    const user_id = request.user.user_id;
    crud_id = Number(crud_id);
    return this.crudsService.deleteCrud(crud_id, user_id);
  }

  @Get()
  async getCruds(
    @Req() request: RequestWithUser,
    @Query() { crud_name }: CrudNameParam,
  ) {
    const user_id = request.user.user_id;
    return this.crudsService.getCruds(user_id, crud_name);
  }
}
