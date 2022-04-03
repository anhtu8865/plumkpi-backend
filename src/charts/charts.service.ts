import Plan from 'src/plans/plan.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DashboardsService from 'src/dashboards/dashboards.service';
import PlansService from 'src/plans/plans.service';
import User from 'src/users/user.entity';
import { CustomNotFoundException } from 'src/utils/exception/NotFound.exception';
import { Like, Repository } from 'typeorm';
import { Chart } from './chart.entity';
import { CreateChartDto, UpdateChartDto } from './dto/chart.dto';
import Role from 'src/users/role.enum';
import { CustomBadRequestException } from 'src/utils/exception/BadRequest.exception';
import { UsersService } from 'src/users/users.service';
import DeptsService from 'src/departments/depts.service';
import KpiTemplatesService from 'src/kpiTemplates/kpiTemplates.service';
import { DateType } from './interface/properties.interface';
import { PlanKpiTemplateUser } from 'src/plans/planKpiTemplateUser.entity';
import ApproveRegistration from 'src/plans/approveRegistration.enum';
import KpiTemplate from 'src/kpiTemplates/kpiTemplate.entity';

@Injectable()
export default class ChartsService {
  constructor(
    @InjectRepository(Chart)
    private chartsRepository: Repository<Chart>,

    private readonly plansService: PlansService,
    private readonly dashboardsService: DashboardsService,
    private readonly usersService: UsersService,
    private readonly deptsService: DeptsService,
    private readonly kpiTemplatesService: KpiTemplatesService,
  ) {}

  async createChart(data: CreateChartDto, user: User) {
    const {
      dashboard_id,
      chart_name,
      description,
      plan_id,
      kpis,
      dateType,
      period,
      separated,
    } = data;

    const dashboard = await this.dashboardsService.getDashboardById(
      dashboard_id,
      user,
    );
    const properties = {
      chart_name,
      description,
      plan_id,
      kpis,
      dateType,
      period,
      separated,
    };
    return this.chartsRepository.save({ dashboard, properties });
  }

  async getChartById(chart_id: number, dashboard_id: number, user: User) {
    const dashboard = await this.dashboardsService.getDashboardById(
      dashboard_id,
      user,
    );
    const chart = await this.chartsRepository.findOne(chart_id, {
      where: {
        dashboard,
      },
      relations: ['dashboard'],
    });
    if (chart) return chart;
    throw new CustomNotFoundException(`Không tìm thấy biểu đồ id ${chart_id}`);
  }

  async updateChart(
    data: UpdateChartDto,
    chart_id: number,
    dashboard_id: number,
    user: User,
  ) {
    const chart = await this.getChartById(chart_id, dashboard_id, user);
    const {
      chart_name,
      description,
      plan_id,
      kpis,
      dateType,
      period,
      separated,
    } = data;

    const properties = {
      chart_name,
      description,
      plan_id,
      kpis,
      dateType,
      period,
      separated,
    };

    return this.chartsRepository.save({ ...chart, properties });
  }

  async getCharts(dashboard_id: number, user: User) {
    const dashboard = await this.dashboardsService.getDashboardById(
      dashboard_id,
      user,
    );
    return this.chartsRepository.find({
      where: { dashboard },
      order: { chart_id: 'ASC' },
    });
  }

  async deleteChart(chart_id: number, dashboard_id: number, user: User) {
    const chart = await this.getChartById(chart_id, dashboard_id, user);
    return this.chartsRepository.remove(chart);
  }

  async getDataChart(chart_id: number, dashboard_id: number, user: User) {
    const chart = await this.getChartById(chart_id, dashboard_id, user);
    const { properties } = chart;
    const { plan_id, kpis, dateType, period, separated } = properties;
    const plan = await this.plansService.getPlanById(plan_id);
    const labels = this.getLabels(dateType, period, plan);

    const kpi_templates = await this.kpiTemplatesService.getKpiTemplates(kpis);

    const datasets = await this.getDatasetsOfUser(
      kpi_templates,
      plan,
      user,
      dateType,
      period,
    );
    return { labels, datasets };
  }

  async getDatasetsOfUser(
    kpi_templates: KpiTemplate[],
    plan: Plan,
    user: User,
    dateType: DateType,
    period: number[],
  ) {
    const datasets = [];
    for (const kpi_template of kpi_templates) {
      const dataset = await this.getDatasetOfUser(
        plan,
        kpi_template,
        user,
        dateType,
        period,
      );
      datasets.push(dataset);
    }
    return datasets;
  }

  async getDatasetOfUser(
    plan: Plan,
    kpi_template: KpiTemplate,
    user: User,
    dateType: DateType,
    period: number[],
  ) {
    const monthly_targets_of_user =
      await this.plansService.getMonthlyTargetsOfUser(plan, kpi_template, user);

    const label = kpi_template.kpi_template_name;
    let data = [];
    if (dateType === DateType.Year)
      data = [
        this.getDataPointOfUser(
          monthly_targets_of_user,
          dateType,
          0,
          kpi_template,
        ),
      ];
    else
      data = period.map((item) =>
        this.getDataPointOfUser(
          monthly_targets_of_user,
          dateType,
          item,
          kpi_template,
        ),
      );
    return { label, data };
  }

  getDataPointOfUser(
    monthly_targets_of_user: PlanKpiTemplateUser,
    dateType: DateType,
    time: number,
    kpi_template: KpiTemplate,
  ) {
    const monthly_targets = [];
    let months;
    if (dateType === DateType.Month) {
      months = [time];
    } else if (dateType === DateType.Quarter) {
      switch (time) {
        case 1:
          months = [1, 2, 3];
          break;
        case 2:
          months = [4, 5, 6];
          break;
        case 3:
          months = [7, 8, 9];
          break;
        case 4:
          months = [10, 11, 12];
          break;
      }
    } else {
      months = [...Array(13).keys()].slice(1);
    }
    const keys = months.map((item) => this.plansService.monthlyKey(item));
    for (const key of keys) {
      if (
        monthly_targets_of_user[key] &&
        monthly_targets_of_user[key].approve === ApproveRegistration.Accepted
      )
        monthly_targets.push(monthly_targets_of_user[key]);
    }
    const targets = monthly_targets.map((item) => item.target);
    const actuals = monthly_targets.map((item) =>
      !item.actual || item.actual.approve !== ApproveRegistration.Accepted
        ? undefined
        : item.actual.value,
    );

    const target = this.plansService.aggregateNumbers(
      targets,
      kpi_template.aggregation,
    );

    const actual = this.plansService.aggregateNumbers(
      actuals,
      kpi_template.aggregation,
    );
    const resultOfKpi = this.plansService.resultOfKpi(
      target,
      actual,
      kpi_template.measures.items,
    );
    return { target, actual, resultOfKpi };
  }

  getLabels(dateType: DateType, period: number[], plan: Plan) {
    let labels = [];
    if (dateType === DateType.Month) {
      labels = period.map((item) => this.monthToString(item));
    } else if (dateType === DateType.Quarter) {
      labels = period.map((item) => this.quarterToString(item));
    } else {
      labels.push('Năm ' + plan.year);
    }
    return labels;
  }

  monthToString(month: number) {
    let key;
    switch (month) {
      case 1:
        key = 'Tháng 1';
        break;
      case 2:
        key = 'Tháng 2';
        break;
      case 3:
        key = 'Tháng 3';
        break;
      case 4:
        key = 'Tháng 4';
        break;
      case 5:
        key = 'Tháng 5';
        break;
      case 6:
        key = 'Tháng 6';
        break;
      case 7:
        key = 'Tháng 7';
        break;
      case 8:
        key = 'Tháng 8';
        break;
      case 9:
        key = 'Tháng 9';
        break;
      case 10:
        key = 'Tháng 10';
        break;
      case 11:
        key = 'Tháng 11';
        break;
      case 12:
        key = 'Tháng 12';
        break;
      default:
        break;
    }
    return key;
  }

  quarterToString(quarter: number) {
    let key;
    switch (quarter) {
      case 1:
        key = 'Quý 1';
        break;
      case 2:
        key = 'Quý 2';
        break;
      case 3:
        key = 'Quý 3';
        break;
      case 4:
        key = 'Quý 4';
        break;
      default:
        break;
    }
    return key;
  }
}
