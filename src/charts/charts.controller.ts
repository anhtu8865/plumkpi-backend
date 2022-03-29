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
import Role from 'src/users/role.enum';
import RoleGuard from 'src/users/role.guard';
import ChartsService from './charts.service';
import { CreateChartDto, UpdateChartDto } from './dto/chart.dto';
import { ChartParam, DashboardParam } from './params/chartParams';

@Controller('charts')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(RoleGuard([Role.Director, Role.Manager, Role.Employee]))
@UseGuards(JwtAuthenticationGuard)
export default class ChartsController {
  constructor(private readonly chartsService: ChartsService) {}

  @Post()
  async createChart(
    @Body()
    {
      chart_name,
      description,
      plan_id,
      dashboard_id,
      properties,
    }: CreateChartDto,
    @Req() request: RequestWithUser,
  ) {
    const user = request.user;
    return this.chartsService.createChart(
      {
        chart_name,
        description,
        plan_id,
        dashboard_id,
        properties,
      },
      user,
    );
  }

  @Put('chart')
  async updateChart(
    @Query() { chart_id, dashboard_id }: ChartParam,
    @Body() { chart_name, description, properties }: UpdateChartDto,
    @Req() request: RequestWithUser,
  ) {
    const user = request.user;
    chart_id = Number(chart_id);
    dashboard_id = Number(dashboard_id);
    return this.chartsService.updateChart(
      { chart_name, description, properties },
      chart_id,
      dashboard_id,
      user,
    );
  }

  @Delete('chart')
  async deleteChart(
    @Query() { chart_id, dashboard_id }: ChartParam,
    @Req() request: RequestWithUser,
  ) {
    const user = request.user;
    chart_id = Number(chart_id);
    dashboard_id = Number(dashboard_id);
    return this.chartsService.deleteChart(chart_id, dashboard_id, user);
  }

  @Get()
  async getCharts(
    @Req() request: RequestWithUser,
    @Query() { dashboard_id }: DashboardParam,
  ) {
    const user = request.user;
    return this.chartsService.getCharts(dashboard_id, user);
  }

  @Get('chart')
  async getChart(
    @Query() { chart_id, dashboard_id }: ChartParam,
    @Req() request: RequestWithUser,
  ) {
    const user = request.user;
    chart_id = Number(chart_id);
    dashboard_id = Number(dashboard_id);
    return this.chartsService.getChart(chart_id, dashboard_id, user);
  }
}
