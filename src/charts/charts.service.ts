import { ViewType } from './interface/properties.interface';
import Plan from 'src/plans/plan.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DashboardsService from 'src/dashboards/dashboards.service';
import PlansService from 'src/plans/plans.service';
import User from 'src/users/user.entity';
import { CustomNotFoundException } from 'src/utils/exception/NotFound.exception';
import { Like, Repository } from 'typeorm';
import { Chart } from './chart.entity';
import { CreateChartDto, PropertiesDto, UpdateChartDto } from './dto/chart.dto';
import Role from 'src/users/role.enum';
import { CustomBadRequestException } from 'src/utils/exception/BadRequest.exception';
import { UsersService } from 'src/users/users.service';
import DeptsService from 'src/departments/depts.service';
import KpiTemplatesService from 'src/kpiTemplates/kpiTemplates.service';

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

  async checkProperties(properties: PropertiesDto, plan: Plan, user: User) {
    const kpi_categories = await this.plansService.getKpis(plan, user);
    const kpiIds = [];
    for (const kpi_category of kpi_categories) {
      for (const kpi of kpi_category.kpi_templates) {
        kpiIds.push(kpi.kpi_template_id);
      }
    }
    for (const id of properties.kpis) {
      if (!kpiIds.includes(id))
        throw new CustomNotFoundException(
          `Không tìm thấy kpi id ${id} trong kế hoạch`,
        );
    }

    const filters = properties.filters;
    const view = properties.view;
    const role = user.role;
    if (role === Role.Director) {
      const temp = await this.deptsService.getAllDepts();
      const dept_ids = temp.map((item) => item.dept_id);
      for (const filter of filters) {
        if (!dept_ids.includes(filter.dept_id)) {
          throw new CustomNotFoundException(
            `Phòng ban id ${filter.dept_id} không tồn tại`,
          );
        }

        const temp = await this.usersService.getEmployeesInDept(filter.dept_id);
        const user_ids = temp.map((item) => item.user_id);
        for (const id of filter.user_ids) {
          if (!user_ids.includes(id)) {
            throw new CustomNotFoundException(
              `Không tìm thấy Nhân viên id ${id} trong phòng ban id ${filter.dept_id}`,
            );
          }
        }
      }
    } else if (role === Role.Manager) {
      const dept_id = user.manage.dept_id;
      if (
        filters.length !== 1 ||
        filters[0].dept_id !== dept_id ||
        view === ViewType.Department
      ) {
        throw new CustomBadRequestException(
          `Quản lý chỉ được xem dữ liệu của phòng ban id ${dept_id}`,
        );
      }
      const temp = await this.usersService.getEmployeesInDept(dept_id);
      const user_ids = temp.map((item) => item.user_id);
      for (const id of filters[0].user_ids) {
        if (!user_ids.includes(id)) {
          throw new CustomNotFoundException(
            `Không tìm thấy Nhân viên id ${id} trong phòng ban`,
          );
        }
      }
    } else {
      if (
        filters.length !== 0 ||
        view === ViewType.Employee ||
        view === ViewType.Department
      )
        throw new CustomBadRequestException(
          `Nhân viên chỉ được xem dữ liệu của mình`,
        );
    }
  }

  async createChart(data: CreateChartDto, user: User) {
    const plan = await this.plansService.getPlanById(data.plan_id);
    const dashboard = await this.dashboardsService.getDashboardById(
      data.dashboard_id,
      user,
    );
    await this.checkProperties(data.properties, plan, user);

    return this.chartsRepository.save({
      ...data,
      plan,
      dashboard,
    });
  }

  async deleteChart(chart_id: number, dashboard_id: number, user: User) {
    const chart = await this.getChartById(chart_id, dashboard_id, user);
    return this.chartsRepository.remove(chart);
  }

  async updateChart(
    data: UpdateChartDto,
    chart_id: number,
    dashboard_id: number,
    user: User,
  ) {
    const chart = await this.getChartById(chart_id, dashboard_id, user);

    if (data.properties) {
      await this.checkProperties(data.properties, chart.plan, user);
    }
    return this.chartsRepository.save({ ...chart, ...data });
  }

  async getCharts(dashboard_id: number, user: User) {
    const dashboard = await this.dashboardsService.getDashboardById(
      dashboard_id,
      user,
    );
    return this.chartsRepository.find({
      where: { dashboard },
      relations: ['plan'],
      order: { chart_id: 'ASC' },
    });
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
      relations: ['plan', 'dashboard'],
    });
    if (chart) return chart;
    throw new CustomNotFoundException(`Không tìm thấy biểu đồ id ${chart_id}`);
  }

  async getChart(chart_id: number, dashboard_id: number, user: User) {
    const chart = await this.getChartById(chart_id, dashboard_id, user);
    const { chart_name, description, properties, plan } = chart;
    const { kpis, months, filters, view, chartType } = properties;

    const kpi_templates = await this.kpiTemplatesService.getKpiTemplates(kpis);
    const kpi_template = kpi_templates[0];
    const { kpi_template_id, kpi_template_name, unit } = kpi_template;

    const data = await this.plansService.getDataOfUser(
      plan,
      kpi_template,
      user,
    );

    const target = data.first_monthly_target.target;
    const actual = data.first_monthly_target.actual.value;
    const measures = kpi_template.measures.items;

    const resultOfKpi = await this.plansService.resultOfKpi(
      target,
      actual,
      measures,
    );
    const first_month = { resultOfKpi, target, actual };

    return {
      chart_id,
      chart_name,
      description,
      plan,
      months,
      view,
      chartType,
      kpi: { kpi_template_id, kpi_template_name, unit, first_month },
    };
  }
}
