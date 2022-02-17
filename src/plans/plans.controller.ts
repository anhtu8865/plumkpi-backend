import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  Req,
} from '@nestjs/common';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import Role from 'src/users/role.enum';
import RoleGuard from 'src/users/role.guard';
import FindOneParams from 'src/utils/findOneParams';
import { PaginationParams } from 'src/utils/types/paginationParams';
import PlansService from './plans.service';
import CreatePlanDto from './dto/createPlan.dto';
import UpdatePlanDto from './dto/updatePlan.dto';
import RequestWithUser from 'src/authentication/requestWithUser.interface';

@Controller('plans')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(RoleGuard(Role.Director))
@UseGuards(JwtAuthenticationGuard)
export default class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  getAllPlans(@Query() { offset, limit, name }: PaginationParams) {
    return this.plansService.getAllPlans(offset, limit, name);
  }

  @Get(':id')
  getPlanById(@Param() { id }: FindOneParams) {
    return this.plansService.getPlanById(Number(id));
  }

  @Post()
  async createPlan(
    @Body() plan: CreatePlanDto,
    @Req() request: RequestWithUser,
  ) {
    const newPlan = { ...plan, user: request.user.user_id };
    return this.plansService.createPlan(newPlan);
  }

  @Put(':id')
  async replacePlan(
    @Param() { id }: FindOneParams,
    @Body() plan: UpdatePlanDto,
  ) {
    return this.plansService.updatePlan(Number(id), plan);
  }

  @Delete(':id')
  async deletePlan(@Param() { id }: FindOneParams) {
    return this.plansService.deletePlan(Number(id));
  }
}
