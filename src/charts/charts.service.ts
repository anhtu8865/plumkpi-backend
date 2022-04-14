import Plan from 'src/plans/plan.entity';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DashboardsService from 'src/dashboards/dashboards.service';
import PlansService from 'src/plans/plans.service';
import User from 'src/users/user.entity';
import { CustomNotFoundException } from 'src/utils/exception/NotFound.exception';
import { Like, Repository } from 'typeorm';
import { Chart } from './chart.entity';
import { CreateChartDto, PropertiesDto } from './dto/chart.dto';
import Role from 'src/users/role.enum';
import { CustomBadRequestException } from 'src/utils/exception/BadRequest.exception';
import { UsersService } from 'src/users/users.service';
import DeptsService from 'src/departments/depts.service';
import KpiTemplatesService from 'src/kpiTemplates/kpiTemplates.service';
import { DateType } from './interface/properties.interface';
import { PlanKpiTemplateUser } from 'src/plans/planKpiTemplateUser.entity';
import ApproveRegistration from 'src/plans/approveRegistration.enum';
import KpiTemplate from 'src/kpiTemplates/kpiTemplate.entity';
import Dept from 'src/departments/dept.entity';
import { PlanKpiTemplateDept } from 'src/plans/planKpiTemplateDept.entity';
import PlanKpiTemplate from 'src/plans/planKpiTemplate.entity';

@Injectable()
export default class ChartsService {
  constructor(
    @InjectRepository(Chart)
    private chartsRepository: Repository<Chart>,

    @Inject(forwardRef(() => PlansService))
    private readonly plansService: PlansService,
    private readonly dashboardsService: DashboardsService,
    private readonly usersService: UsersService,
    private readonly deptsService: DeptsService,

    @Inject(forwardRef(() => KpiTemplatesService))
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
      filter,
      chart_type,
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
      filter,
    };
    return this.chartsRepository.save({ dashboard, properties, chart_type });
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
    data: PropertiesDto,
    chart_id: number,
    dashboard_id: number,
    user: User,
  ) {
    const chart = await this.getChartById(chart_id, dashboard_id, user);
    const { chart_name, description, plan_id, kpis, dateType, period, filter } =
      data;

    const properties = {
      chart_name,
      description,
      plan_id,
      kpis,
      dateType,
      period,
      filter,
    };

    return this.chartsRepository.save({ ...chart, properties });
  }

  async getCharts(dashboard_id: number, user: User) {
    const dashboard = await this.dashboardsService.getDashboardById(
      dashboard_id,
      user,
    );
    const charts = await this.chartsRepository.find({
      where: { dashboard },
      order: { createdAt: 'ASC' },
    });
    for (const chart of charts) {
      const { kpis, plan_id } = chart.properties;
      const kpi_templates = await this.kpiTemplatesService.getKpiTemplates(
        kpis,
      );
      const plan = await this.plansService.getPlanById(plan_id);
      chart['kpi_templates'] = kpi_templates;
      chart['plan'] = plan;
    }
    return charts;
  }

  async deleteChart(chart_id: number, dashboard_id: number, user: User) {
    const chart = await this.getChartById(chart_id, dashboard_id, user);
    return this.chartsRepository.remove(chart);
  }

  async getDataChart(chart_id: number, dashboard_id: number, user: User) {
    const chart = await this.getChartById(chart_id, dashboard_id, user);
    const { properties } = chart;
    const { plan_id, kpis, dateType, period, filter } = properties;
    const plan = await this.plansService.getPlanById(plan_id);
    const labels = this.getLabels(dateType, period, plan);

    const kpi_templates = await this.kpiTemplatesService.getKpiTemplates(kpis);

    let datasets = [];
    const role = user.role;
    if (role === Role.Employee) {
      datasets = await this.getDatasetsOfUser(
        kpi_templates,
        plan,
        user,
        dateType,
        period,
      );
    } else if (role === Role.Manager) {
      const dept = user.manage;
      datasets = await this.getDatasetsOfDept(
        kpi_templates,
        plan,
        dept,
        dateType,
        period,
        filter,
      );
    } else {
      datasets = await this.getDatasetsOfDirector(
        kpi_templates,
        plan,
        dateType,
        period,
        filter,
      );
    }
    return { labels, datasets };
  }

  async getDatasetsOfDept(
    kpi_templates: KpiTemplate[],
    plan: Plan,
    dept: Dept,
    dateType: DateType,
    period: number[],
    filter: number[],
  ) {
    const datasets = [];
    if (filter.length !== 0 && kpi_templates.length === 1) {
      const kpi_template = kpi_templates[0];
      const target_kpi_of_employees =
        await this.plansService.getTargetKpiOfEmployeesWithoutPagination(
          plan.plan_id,
          kpi_template.kpi_template_id,
          dept.dept_id,
        );
      let users = target_kpi_of_employees.map((item) => item.user);
      users = users.filter((user) => filter.includes(user.user_id));
      for (const user of users) {
        const dataset = await this.getDatasetOfUser(
          plan,
          kpi_template,
          user,
          dateType,
          period,
        );
        dataset.label = user.user_name;
        datasets.push(dataset);
      }
    } else {
      for (const kpi_template of kpi_templates) {
        const dataset = await this.getDatasetOfDept(
          plan,
          kpi_template,
          dept,
          dateType,
          period,
        );
        datasets.push(dataset);
      }
    }
    return datasets;
  }

  async getDatasetsOfDirector(
    kpi_templates: KpiTemplate[],
    plan: Plan,
    dateType: DateType,
    period: number[],
    filter: number[],
  ) {
    const datasets = [];
    if (filter.length !== 0 && kpi_templates.length === 1) {
      const kpi_template = kpi_templates[0];
      const target_kpi_of_depts = await this.plansService.getTargetKpiOfdepts(
        plan.plan_id,
        kpi_template.kpi_template_id,
      );

      let depts = target_kpi_of_depts.map((item) => item.dept);
      depts = depts.filter((dept) => filter.includes(dept.dept_id));
      for (const dept of depts) {
        const dataset = await this.getDatasetOfDept(
          plan,
          kpi_template,
          dept,
          dateType,
          period,
        );
        dataset.label = dept.dept_name;
        datasets.push(dataset);
      }
    } else {
      for (const kpi_template of kpi_templates) {
        const dataset = await this.getDatasetOfDirector(
          plan,
          kpi_template,
          dateType,
          period,
        );
        datasets.push(dataset);
      }
    }
    return datasets;
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

  async getDatasetOfDept(
    plan: Plan,
    kpi_template: KpiTemplate,
    dept: Dept,
    dateType: DateType,
    period: number[],
  ) {
    const quarterly_targets_of_dept =
      await this.plansService.getQuarterlyTargetsOfDept(
        plan,
        kpi_template,
        dept,
      );

    const target_kpi_of_employees =
      await this.plansService.getTargetKpiOfEmployees(
        plan.plan_id,
        kpi_template.kpi_template_id,
        dept.dept_id,
      );

    const label = kpi_template.kpi_template_name;
    let data = [];
    if (dateType === DateType.Year)
      data = [
        this.getDataPointOfDept(
          quarterly_targets_of_dept,
          target_kpi_of_employees,
          dateType,
          0,
          kpi_template,
        ),
      ];
    else
      data = period.map((item) =>
        this.getDataPointOfDept(
          quarterly_targets_of_dept,
          target_kpi_of_employees,
          dateType,
          item,
          kpi_template,
        ),
      );
    return { label, data };
  }

  async getDatasetOfDirector(
    plan: Plan,
    kpi_template: KpiTemplate,
    dateType: DateType,
    period: number[],
  ) {
    const yearly_target_kpi = await this.plansService.getYearlyTargetKpi(
      plan,
      kpi_template,
    );

    const target_kpi_of_depts = await this.plansService.getTargetKpiOfdepts(
      plan.plan_id,
      kpi_template.kpi_template_id,
    );

    const label = kpi_template.kpi_template_name;
    const data = [];
    if (dateType === DateType.Year) {
      const dataPoint = await this.getDataPointOfDirector(
        yearly_target_kpi,
        target_kpi_of_depts,
        dateType,
        0,
        kpi_template,
        plan,
      );
      data.push(dataPoint);
    } else {
      for (const time of period) {
        const dataPoint = await this.getDataPointOfDirector(
          yearly_target_kpi,
          target_kpi_of_depts,
          dateType,
          time,
          kpi_template,
          plan,
        );
        data.push(dataPoint);
      }
    }

    return { label, data };
  }

  async getDataPointOfDirector(
    yearly_target_kpi: PlanKpiTemplate,
    target_kpi_of_depts: PlanKpiTemplateDept[],
    dateType: DateType,
    time: number,
    kpi_template: KpiTemplate,
    plan: Plan,
  ) {
    const monthly_targets = [];
    const monthly_actuals = [];
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
      const monthly_target_of_depts = [];
      const monthly_actual_of_depts = [];
      for (const target_kpi_of_dept of target_kpi_of_depts) {
        const monthly_target_of_employees = [];
        const target_kpi_of_employees =
          await this.plansService.getTargetKpiOfEmployees(
            plan.plan_id,
            kpi_template.kpi_template_id,
            target_kpi_of_dept.dept.dept_id,
          );
        target_kpi_of_employees.map((item) => {
          // * there is no personal kpi of employee, so approve is always 'Chấp nhận'
          if (item[key]) monthly_target_of_employees.push(item[key]);
        });

        const targets = monthly_target_of_employees.map((item) => item.target);
        const actuals = monthly_target_of_employees.map((item) =>
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
        if (target !== undefined) {
          monthly_target_of_depts.push(target);
          monthly_actual_of_depts.push(actual);
        }
      }
      const target = this.plansService.aggregateNumbers(
        monthly_target_of_depts,
        kpi_template.aggregation,
      );

      const actual = this.plansService.aggregateNumbers(
        monthly_actual_of_depts,
        kpi_template.aggregation,
      );
      if (target !== undefined) {
        monthly_targets.push(target);
        monthly_actuals.push(actual);
      }
    }

    let target = this.plansService.aggregateNumbers(
      monthly_targets,
      kpi_template.aggregation,
    );

    const actual = this.plansService.aggregateNumbers(
      monthly_actuals,
      kpi_template.aggregation,
    );

    if (months.length === 3) {
      const targets = [];
      let key;
      if (JSON.stringify(months) == JSON.stringify([1, 2, 3])) {
        key = this.plansService.quarterlyKey(1);
      }
      if (JSON.stringify(months) == JSON.stringify([4, 5, 6])) {
        key = this.plansService.quarterlyKey(2);
      }
      if (JSON.stringify(months) == JSON.stringify([7, 8, 9])) {
        key = this.plansService.quarterlyKey(3);
      }
      if (JSON.stringify(months) == JSON.stringify([10, 11, 12])) {
        key = this.plansService.quarterlyKey(4);
      }
      for (const target_kpi_of_dept of target_kpi_of_depts) {
        if (target_kpi_of_dept[key])
          targets.push(target_kpi_of_dept[key].target);
      }
      target = this.plansService.aggregateNumbers(
        targets,
        kpi_template.aggregation,
      );
    }

    if (months.length === 12) {
      target = yearly_target_kpi.target ? yearly_target_kpi.target : undefined;
    }

    const resultOfKpi = this.plansService.resultOfKpi(
      target,
      actual,
      kpi_template.measures.items,
    );
    return { target, actual, resultOfKpi, unit: kpi_template.unit };
  }

  getDataPointOfDept(
    quarterly_targets_of_dept: PlanKpiTemplateDept,
    target_kpi_of_employees,
    dateType: DateType,
    time: number,
    kpi_template: KpiTemplate,
  ) {
    const monthly_targets = [];
    const monthly_actuals = [];
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
      const monthly_target_of_employees = [];
      target_kpi_of_employees.map((item) => {
        // * there is no personal kpi of employee, so approve is always 'Chấp nhận'
        if (item[key]) monthly_target_of_employees.push(item[key]);
      });

      const targets = monthly_target_of_employees.map((item) => item.target);
      const actuals = monthly_target_of_employees.map((item) =>
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
      if (target !== undefined) {
        monthly_targets.push(target);
        monthly_actuals.push(actual);
      }
    }

    let target = this.plansService.aggregateNumbers(
      monthly_targets,
      kpi_template.aggregation,
    );

    const actual = this.plansService.aggregateNumbers(
      monthly_actuals,
      kpi_template.aggregation,
    );

    if (JSON.stringify(months) == JSON.stringify([1, 2, 3])) {
      target = quarterly_targets_of_dept.first_quarterly_target?.target;
    } else if (JSON.stringify(months) == JSON.stringify([4, 5, 6])) {
      target = quarterly_targets_of_dept.second_quarterly_target?.target;
    } else if (JSON.stringify(months) == JSON.stringify([7, 8, 9])) {
      target = quarterly_targets_of_dept.third_quarterly_target?.target;
    } else if (JSON.stringify(months) == JSON.stringify([10, 11, 12])) {
      target = quarterly_targets_of_dept.fourth_quarterly_target?.target;
    } else if (months.length === 12) {
      target = quarterly_targets_of_dept.target
        ? quarterly_targets_of_dept.target
        : undefined;
    }

    const resultOfKpi = this.plansService.resultOfKpi(
      target,
      actual,
      kpi_template.measures.items,
    );
    return { target, actual, resultOfKpi, unit: kpi_template.unit };
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
    return { target, actual, resultOfKpi, unit: kpi_template.unit };
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

  async getData(data: PropertiesDto, user: User) {
    const { plan_id, kpis, dateType, period, filter } = data;

    const plan = await this.plansService.getPlanById(plan_id);
    const labels = this.getLabels(dateType, period, plan);

    const kpi_templates = await this.kpiTemplatesService.getKpiTemplates(kpis);

    let datasets = [];
    const role = user.role;
    if (role === Role.Employee) {
      datasets = await this.getDatasetsOfUser(
        kpi_templates,
        plan,
        user,
        dateType,
        period,
      );
    } else if (role === Role.Manager) {
      const dept = user.manage;
      datasets = await this.getDatasetsOfDept(
        kpi_templates,
        plan,
        dept,
        dateType,
        period,
        filter,
      );
    } else {
      datasets = await this.getDatasetsOfDirector(
        kpi_templates,
        plan,
        dateType,
        period,
        filter,
      );
    }
    return { labels, datasets };
  }
}
