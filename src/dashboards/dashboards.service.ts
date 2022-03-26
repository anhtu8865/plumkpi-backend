import User from 'src/users/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomNotFoundException } from 'src/utils/exception/NotFound.exception';
import { Like, Repository } from 'typeorm';
import { Dashboard } from './dashboard.entity';
import { CreateDashboardDto, UpdateDashboardDto } from './dto/dashboard.dto';
import Role from 'src/users/role.enum';

@Injectable()
export default class DashboardsService {
  constructor(
    @InjectRepository(Dashboard)
    private dashboardsRepository: Repository<Dashboard>,
  ) {}

  async createDashboard(data: CreateDashboardDto) {
    return this.dashboardsRepository.save(data);
  }

  async getDashboardById(dashboard_id: number, user: User) {
    const role = user.role;
    let dashboard;
    if (role === Role.Director) {
      dashboard = await this.dashboardsRepository.findOne(dashboard_id, {
        where: { dept: null, user: null },
      });
    } else if (role === Role.Manager) {
      const dept_id = user.manage.dept_id;
      dashboard = await this.dashboardsRepository.findOne(dashboard_id, {
        where: { dept: { dept_id } },
      });
    } else {
      const user_id = user.user_id;
      dashboard = await this.dashboardsRepository.findOne(dashboard_id, {
        where: { user: { user_id } },
      });
    }
    if (dashboard) {
      return dashboard;
    }
    throw new CustomNotFoundException(
      `Không tìm thấy dashboard id ${dashboard_id}`,
    );
  }

  async deleteDashboard(dashboard_id: number, user: User) {
    const dashboard = await this.getDashboardById(dashboard_id, user);
    return this.dashboardsRepository.remove(dashboard);
  }

  async updateDashboard(
    data: UpdateDashboardDto,
    dashboard_id: number,
    user: User,
  ) {
    const dashboard = await this.getDashboardById(dashboard_id, user);
    return this.dashboardsRepository.save({ ...dashboard, ...data });
  }

  async getDashboards(user: User, dashboard_name: string) {
    const role = user.role;
    let dashboards = [];
    if (role === Role.Director) {
      dashboards = await this.dashboardsRepository.find({
        where: {
          dept: null,
          user: null,
          dashboard_name: Like(`%${dashboard_name ? dashboard_name : ''}%`),
        },
      });
    } else if (role === Role.Manager) {
      const dept_id = user.manage.dept_id;
      dashboards = await this.dashboardsRepository.find({
        where: {
          dept: { dept_id },
          dashboard_name: Like(`%${dashboard_name ? dashboard_name : ''}%`),
        },
      });
    } else {
      const user_id = user.user_id;
      dashboards = await this.dashboardsRepository.find({
        where: {
          user: { user_id },
          dashboard_name: Like(`%${dashboard_name ? dashboard_name : ''}%`),
        },
      });
    }
    return dashboards;
  }
}
