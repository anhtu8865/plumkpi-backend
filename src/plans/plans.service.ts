import { PlanKpiTemplateUser } from './planKpiTemplateUser.entity';
import PlanKpiCategory from 'src/plans/planKpiCategory.entity';
import Plan from './plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, In, Like, Not, Repository } from 'typeorm';
import CreatePlanDto from './dto/createPlan.dto';
import UpdatePlanDto from './dto/updatePlan.dto';
import KpiCategoriesService from 'src/kpiCategories/kpiCategories.service';
import PlanKpiTemplate from './planKpiTemplate.entity';
import KpiTemplatesService from 'src/kpiTemplates/kpiTemplates.service';
import { CustomBadRequestException } from 'src/utils/exception/BadRequest.exception';
import { CustomInternalServerException } from 'src/utils/exception/InternalServer.exception';
import { CustomNotFoundException } from 'src/utils/exception/NotFound.exception';
import { KpiCategoriesDto } from './dto/registerKpiCategories.dto';
import { Injectable } from '@nestjs/common';
import { KpisDto } from './dto/registerKpis.dto';
import { DeptsDto } from './dto/assignKpiDepts.dto';
import { PlanKpiTemplateDept } from './planKpiTemplateDept.entity';
import ApproveRegistration from './approveRegistration.enum';
import { UsersDto } from './dto/assignKpiEmployees.dto';
import { TargetUsersDto } from './dto/registerMonthlyTarget.dto';
import { PersonalKpiDto } from './dto/registerPersonalKpis.dto';
import KpiCategory from 'src/kpiCategories/kpiCategory.entity';

@Injectable()
export default class PlansService {
  constructor(
    @InjectRepository(Plan)
    private plansRepository: Repository<Plan>,

    @InjectRepository(PlanKpiCategory)
    private plansKpiCategoriesRepository: Repository<PlanKpiCategory>,

    private readonly kpiCategoriesService: KpiCategoriesService,

    @InjectRepository(PlanKpiTemplateDept)
    private planKpiTemplateDeptsRepository: Repository<PlanKpiTemplateDept>,

    @InjectRepository(PlanKpiTemplateUser)
    private planKpiTemplateUsersRepository: Repository<PlanKpiTemplateUser>,

    @InjectRepository(PlanKpiTemplate)
    private planKpiTemplatesRepository: Repository<PlanKpiTemplate>,
    private readonly kpiTemplatesService: KpiTemplatesService,

    private connection: Connection,
  ) {}

  async createPlan(data: CreatePlanDto) {
    try {
      const newPlan = await this.plansRepository.create(data);
      await this.plansRepository.save(newPlan);
      return newPlan;
    } catch (error) {
      if (error?.constraint === 'UQ_0b3866daf36d0d6520c9d1f5ef3') {
        throw new CustomBadRequestException(
          `Tên kế hoạch ${data.plan_name} đã tồn tại`,
        );
      }
      if (error?.constraint === 'UQ_8d17b2be5eac04d0afa1ebb449a') {
        throw new CustomBadRequestException(
          `Năm kế hoạch ${data.year} đã tồn tại`,
        );
      }
      throw new CustomInternalServerException();
    }
  }
  async getPlanById(id: number) {
    try {
      const plan = await this.plansRepository.findOne(id);
      if (plan) {
        return plan;
      }
      throw new CustomNotFoundException(`Kế hoạch id ${id} không tồn tại`);
    } catch (error) {
      throw error;
    }
  }

  async getPlanKpiCategories(plan_id: number) {
    try {
      const result = await this.plansKpiCategoriesRepository.find({
        where: { plan: { plan_id } },
        relations: ['kpi_category'],
      });
      if (result) {
        return result;
      }
      throw new CustomNotFoundException(`Kế hoạch id ${plan_id} không tồn tại`);
    } catch (error) {
      throw error;
    }
  }

  async updatePlan(id: number, data: UpdatePlanDto) {
    await this.getPlanById(id);
    try {
      await this.plansRepository.save({ ...data, plan_id: id });
      const UpdatedPlan = await this.plansRepository.findOne(id);
      return UpdatedPlan;
    } catch (error) {
      if (error?.constraint === 'UQ_0b3866daf36d0d6520c9d1f5ef3') {
        throw new CustomBadRequestException(
          `Tên kế hoạch ${data.plan_name} đã tồn tại`,
        );
      }
      if (error?.constraint === 'UQ_8d17b2be5eac04d0afa1ebb449a') {
        throw new CustomBadRequestException(
          `Năm kế hoạch ${data.year} đã tồn tại`,
        );
      }
      throw new CustomInternalServerException();
    }
  }

  async deletePlan(id: number) {
    try {
      const deleteResponse = await this.plansRepository.delete(id);
      if (!deleteResponse.affected) {
        throw new CustomNotFoundException(`Kế hoạch id ${id} không tồn tại`);
      }
    } catch (error) {
      throw error;
    }
  }

  async getPlans(offset: number, limit: number, name?: string) {
    const [items, count] = await this.plansRepository.findAndCount({
      where: [{ plan_name: Like(`%${name ? name : ''}%`) }],
      order: {
        year: 'DESC',
      },
      skip: offset,
      take: limit,
    });

    return {
      items,
      count,
    };
  }

  async registerKpiCategories(
    plan_id: number,
    kpiCategories: KpiCategoriesDto[],
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const sum = kpiCategories.reduce((result, item) => {
        return result + item.weight;
      }, 0);
      if (sum !== 100 && kpiCategories.length !== 0) {
        throw new CustomBadRequestException(
          `Tổng trọng số các danh mục KPI phải bằng 100%`,
        );
      }

      const kpiCategoriesInDB = await queryRunner.manager.find(
        PlanKpiCategory,
        {
          where: {
            plan: { plan_id },
            kpi_category: { kpi_category_name: Not('Cá nhân') },
          },
          relations: ['kpi_category'],
        },
      );
      const kpiCategoriesIdInDB = kpiCategoriesInDB.map(
        (item) => item.kpi_category.kpi_category_id,
      );
      const kpiCategoriesId = kpiCategories.map((item) => item.kpi_category_id);
      const deleteKpiCategoriesId = kpiCategoriesIdInDB.filter(
        (item) => !kpiCategoriesId.includes(item),
      );
      const kpisInDB = await queryRunner.manager.find(PlanKpiTemplate, {
        where: {
          plan: { plan_id },
          kpi_template: {
            kpi_category: { kpi_category_id: In(deleteKpiCategoriesId) },
          },
        },
        relations: ['kpi_template'],
      });
      if (kpisInDB.length > 0) {
        throw new CustomBadRequestException(
          `Không thể xoá danh mục KPI do vẫn còn KPI mẫu thuộc danh mục này trong kế hoạch`,
        );
      }

      await queryRunner.manager.delete(PlanKpiCategory, {
        plan: { plan_id },
        kpi_category: { kpi_category_id: In(deleteKpiCategoriesId) },
      });

      for (const kpiCategory of kpiCategories) {
        const { kpi_category_id, weight } = kpiCategory;
        await queryRunner.manager.save(PlanKpiCategory, {
          kpi_category: { kpi_category_id },
          plan: { plan_id },
          weight,
        });
      }

      const plan = await queryRunner.manager.find(PlanKpiCategory, {
        where: { plan: { plan_id } },
        relations: ['kpi_category'],
      });
      await queryRunner.commitTransaction();
      return plan;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async registerKpis(
    plan_id: number,
    kpi_category_id: number,
    kpis: KpisDto[],
  ) {
    const sum = kpis.reduce((result, item) => {
      return result + item.weight;
    }, 0);
    if (sum !== 100 && kpis.length !== 0) {
      throw new CustomBadRequestException(
        `Tổng trọng số các KPIs phải bằng 100%`,
      );
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const kpisInDB = await queryRunner.manager.find(PlanKpiTemplate, {
        where: { kpi_template: { kpi_category: { kpi_category_id } } },
        relations: ['kpi_template'],
      });
      const kpisIdInDB = [];
      for (const kpi of kpisInDB) {
        kpisIdInDB.push(kpi.kpi_template.kpi_template_id);
      }
      const kpisId = [];
      for (const kpi of kpis) {
        kpisId.push(kpi.kpi_template_id);
      }
      const deleteKpisId = kpisIdInDB.filter((item) => !kpisId.includes(item));
      await queryRunner.manager.delete(PlanKpiTemplate, {
        kpi_template: { kpi_template_id: In(deleteKpisId) },
      });

      const result = [];
      for (const kpi of kpis) {
        const { kpi_template_id, weight } = kpi;
        const temp = await queryRunner.manager.save(PlanKpiTemplate, {
          plan: { plan_id },
          kpi_template: { kpi_template_id },
          weight,
        });
        result.push(temp);
      }
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error?.constraint === 'FK_4809b5d1376f69057f1ac860cc2') {
        throw new CustomBadRequestException(
          `Không thể xoá KPI vì đã gán cho phòng ban`,
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getKpisOfOneCategory(
    plan_id: number,
    offset: number,
    limit: number,
    name: string,
    kpi_category_id: number,
  ) {
    const [items, count] = await this.planKpiTemplatesRepository.findAndCount({
      where: {
        plan: { plan_id },
        kpi_template: {
          kpi_category: { kpi_category_id },
          kpi_template_name: Like(`%${name ? name : ''}%`),
        },
      },
      relations: ['kpi_template'],
      order: {
        kpi_template: 'ASC',
      },
      skip: offset,
      take: limit,
    });
    for (const item of items) {
      delete item.kpi_template.kpi_category;
    }
    return {
      items,
      count,
    };
  }

  async registerTarget(
    plan_id: number,
    kpi_template_id: number,
    target: number,
  ) {
    const record = await this.planKpiTemplatesRepository.findOne({
      where: { plan: { plan_id }, kpi_template: { kpi_template_id } },
      relations: ['plan', 'kpi_template'],
    });
    if (record) {
      console.log(
        '🚀 ~ file: plans.service.ts ~ line 310 ~ PlansService ~ record',
        record,
      );
      const result = await this.planKpiTemplatesRepository.save({
        ...record,
        target,
      });
      console.log(
        '🚀 ~ file: plans.service.ts ~ line 315 ~ PlansService ~ record',
        record,
      );
      return result;
    }
    throw new CustomNotFoundException(
      `KPI id ${kpi_template_id} không tồn tại trong kế hoạch id ${plan_id}`,
    );
  }

  async registerQuarterlyTarget(
    plan_id: number,
    kpi_template_id: number,
    target: number,
    quarter: number,
    dept_id: number,
  ) {
    const record = await this.planKpiTemplateDeptsRepository.findOne({
      where: {
        plan_kpi_template: {
          kpi_template: { kpi_template_id },
          plan: { plan_id },
        },
        dept: { dept_id },
      },
      relations: [
        'plan_kpi_template',
        'dept',
        'plan_kpi_template.kpi_template',
        'plan_kpi_template.plan',
      ],
    });
    if (record) {
      let quarterly_target;
      switch (quarter) {
        case 1:
          if (
            record.first_quarterly_target?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi mục tiêu đã được Ban Giám Đốc phê duyệt`,
            );
          }
          quarterly_target = {
            first_quarterly_target: target
              ? {
                  target,
                  approve: ApproveRegistration.Pending,
                }
              : null,
          };
          break;
        case 2:
          if (
            record.second_quarterly_target?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi mục tiêu đã được Ban Giám Đốc phê duyệt`,
            );
          }
          quarterly_target = {
            second_quarterly_target: target
              ? {
                  target,
                  approve: ApproveRegistration.Pending,
                }
              : null,
          };
          break;
        case 3:
          if (
            record.third_quarterly_target?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi mục tiêu đã được Ban Giám Đốc phê duyệt`,
            );
          }
          quarterly_target = {
            third_quarterly_target: target
              ? {
                  target,
                  approve: ApproveRegistration.Pending,
                }
              : null,
          };
          break;
        case 4:
          if (
            record.fourth_quarterly_target?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi mục tiêu đã được Ban Giám Đốc phê duyệt`,
            );
          }
          quarterly_target = {
            fourth_quarterly_target: target
              ? {
                  target,
                  approve: ApproveRegistration.Pending,
                }
              : null,
          };
          break;
        default:
          break;
      }

      await this.planKpiTemplateDeptsRepository.save({
        ...record,
        ...quarterly_target,
      });
      return quarterly_target;
    }
    throw new CustomNotFoundException(`Không tìm thấy`);
  }

  async registerMonthlyTarget(
    plan_id: number,
    kpi_template_id: number,
    target: number,
    month: number,
    users: TargetUsersDto[],
    dept_id: number,
  ) {
    const queryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const record = await queryRunner.manager.find(PlanKpiTemplateUser, {
        where: {
          plan_kpi_template: {
            kpi_template: { kpi_template_id },
            plan: { plan_id },
          },
          user: { dept: { dept_id } },
        },
        relations: [
          'plan_kpi_template',
          'plan_kpi_template.kpi_template',
          'plan_kpi_template.plan',
          'user',
          'user.dept',
        ],
      });
      const userIds = users.map((user) => user.user_id);

      let toDeleteTargetRows = record.filter(
        (row) => !userIds.includes(row.user.user_id),
      );

      let toUpdateTargetRows;
      switch (month) {
        case 1:
          toUpdateTargetRows = users.map((user) => {
            return {
              plan_kpi_template: {
                kpi_template: { kpi_template_id },
                plan: { plan_id },
              },
              user: { user_id: user.user_id },
              first_monthly_target: user.target ? user.target : target,
            };
          });
          toDeleteTargetRows = toDeleteTargetRows.map((row) => {
            return {
              ...row,
              first_monthly_target: null,
            };
          });
          await queryRunner.manager.save(PlanKpiTemplateUser, [
            ...toUpdateTargetRows,
            ...toDeleteTargetRows,
          ]);
          break;
        case 2:
          toUpdateTargetRows = users.map((user) => {
            return {
              plan_kpi_template: {
                kpi_template: { kpi_template_id },
                plan: { plan_id },
              },
              user: { user_id: user.user_id },
              second_monthly_target: user.target ? user.target : target,
            };
          });
          toDeleteTargetRows = toDeleteTargetRows.map((row) => {
            return {
              ...row,
              second_monthly_target: null,
            };
          });

          await queryRunner.manager.save(PlanKpiTemplateUser, [
            ...toUpdateTargetRows,
            ...toDeleteTargetRows,
          ]);
          break;
        case 3:
          toUpdateTargetRows = users.map((user) => {
            return {
              plan_kpi_template: {
                kpi_template: { kpi_template_id },
                plan: { plan_id },
              },
              user: { user_id: user.user_id },
              third_monthly_target: user.target ? user.target : target,
            };
          });
          toDeleteTargetRows = toDeleteTargetRows.map((row) => {
            return {
              ...row,
              third_monthly_target: null,
            };
          });
          await queryRunner.manager.save(PlanKpiTemplateUser, [
            ...toUpdateTargetRows,
            ...toDeleteTargetRows,
          ]);
          break;
        case 4:
          toUpdateTargetRows = users.map((user) => {
            return {
              plan_kpi_template: {
                kpi_template: { kpi_template_id },
                plan: { plan_id },
              },
              user: { user_id: user.user_id },
              fourth_monthly_target: user.target ? user.target : target,
            };
          });
          toDeleteTargetRows = toDeleteTargetRows.map((row) => {
            return {
              ...row,
              fourth_monthly_target: null,
            };
          });
          await queryRunner.manager.save(PlanKpiTemplateUser, [
            ...toUpdateTargetRows,
            ...toDeleteTargetRows,
          ]);
          break;
        case 5:
          toUpdateTargetRows = users.map((user) => {
            return {
              plan_kpi_template: {
                kpi_template: { kpi_template_id },
                plan: { plan_id },
              },
              user: { user_id: user.user_id },
              fifth_monthly_target: user.target ? user.target : target,
            };
          });
          toDeleteTargetRows = toDeleteTargetRows.map((row) => {
            return {
              ...row,
              fifth_monthly_target: null,
            };
          });
          await queryRunner.manager.save(PlanKpiTemplateUser, [
            ...toUpdateTargetRows,
            ...toDeleteTargetRows,
          ]);
          break;
        case 6:
          toUpdateTargetRows = users.map((user) => {
            return {
              plan_kpi_template: {
                kpi_template: { kpi_template_id },
                plan: { plan_id },
              },
              user: { user_id: user.user_id },
              sixth_monthly_target: user.target ? user.target : target,
            };
          });
          toDeleteTargetRows = toDeleteTargetRows.map((row) => {
            return {
              ...row,
              sixth_monthly_target: null,
            };
          });
          await queryRunner.manager.save(PlanKpiTemplateUser, [
            ...toUpdateTargetRows,
            ...toDeleteTargetRows,
          ]);
          break;
        case 7:
          toUpdateTargetRows = users.map((user) => {
            return {
              plan_kpi_template: {
                kpi_template: { kpi_template_id },
                plan: { plan_id },
              },
              user: { user_id: user.user_id },
              seventh_monthly_target: user.target ? user.target : target,
            };
          });
          toDeleteTargetRows = toDeleteTargetRows.map((row) => {
            return {
              ...row,
              seventh_monthly_target: null,
            };
          });
          await queryRunner.manager.save(PlanKpiTemplateUser, [
            ...toUpdateTargetRows,
            ...toDeleteTargetRows,
          ]);
          break;
        case 8:
          toUpdateTargetRows = users.map((user) => {
            return {
              plan_kpi_template: {
                kpi_template: { kpi_template_id },
                plan: { plan_id },
              },
              user: { user_id: user.user_id },
              eighth_monthly_target: user.target ? user.target : target,
            };
          });
          toDeleteTargetRows = toDeleteTargetRows.map((row) => {
            return {
              ...row,
              eighth_monthly_target: null,
            };
          });
          await queryRunner.manager.save(PlanKpiTemplateUser, [
            ...toUpdateTargetRows,
            ...toDeleteTargetRows,
          ]);
          break;
        case 9:
          toUpdateTargetRows = users.map((user) => {
            return {
              plan_kpi_template: {
                kpi_template: { kpi_template_id },
                plan: { plan_id },
              },
              user: { user_id: user.user_id },
              ninth_monthly_target: user.target ? user.target : target,
            };
          });
          toDeleteTargetRows = toDeleteTargetRows.map((row) => {
            return {
              ...row,
              ninth_monthly_target: null,
            };
          });
          await queryRunner.manager.save(PlanKpiTemplateUser, [
            ...toUpdateTargetRows,
            ...toDeleteTargetRows,
          ]);
          break;
        case 10:
          toUpdateTargetRows = users.map((user) => {
            return {
              plan_kpi_template: {
                kpi_template: { kpi_template_id },
                plan: { plan_id },
              },
              user: { user_id: user.user_id },
              tenth_monthly_target: user.target ? user.target : target,
            };
          });
          toDeleteTargetRows = toDeleteTargetRows.map((row) => {
            return {
              ...row,
              tenth_monthly_target: null,
            };
          });
          await queryRunner.manager.save(PlanKpiTemplateUser, [
            ...toUpdateTargetRows,
            ...toDeleteTargetRows,
          ]);
          break;
        case 11:
          toUpdateTargetRows = users.map((user) => {
            return {
              plan_kpi_template: {
                kpi_template: { kpi_template_id },
                plan: { plan_id },
              },
              user: { user_id: user.user_id },
              eleventh_monthly_target: user.target ? user.target : target,
            };
          });
          toDeleteTargetRows = toDeleteTargetRows.map((row) => {
            return {
              ...row,
              eleventh_monthly_target: null,
            };
          });
          await queryRunner.manager.save(PlanKpiTemplateUser, [
            ...toUpdateTargetRows,
            ...toDeleteTargetRows,
          ]);
          break;
        case 12:
          toUpdateTargetRows = users.map((user) => {
            return {
              plan_kpi_template: {
                kpi_template: { kpi_template_id },
                plan: { plan_id },
              },
              user: { user_id: user.user_id },
              twelfth_monthly_target: user.target ? user.target : target,
            };
          });
          toDeleteTargetRows = toDeleteTargetRows.map((row) => {
            return {
              ...row,
              twelfth_monthly_target: null,
            };
          });
          await queryRunner.manager.save(PlanKpiTemplateUser, [
            ...toUpdateTargetRows,
            ...toDeleteTargetRows,
          ]);
          break;
        default:
          break;
      }
      await queryRunner.commitTransaction();
      for (const row of toUpdateTargetRows) {
        Object.keys(row).forEach((k) => row[k] === null && delete row[k]);
      }

      return toUpdateTargetRows;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async assignKpiDepts(
    plan_id: number,
    kpi_template_id: number,
    depts: DeptsDto[],
  ) {
    const queryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const rows = depts.map((item) => {
        return {
          plan_kpi_template: {
            plan: { plan_id },
            kpi_template: { kpi_template_id },
          },
          dept: { dept_id: item.dept_id },
          target: item.target,
        };
      });

      const deptIds = rows.map((row) => row.dept.dept_id);

      const toDeleteRows = await queryRunner.manager.find(PlanKpiTemplateDept, {
        where: {
          plan_kpi_template: {
            plan: { plan_id },
            kpi_template: { kpi_template_id },
          },
          dept: { dept_id: Not(In(deptIds)) },
        },
        relations: [
          'plan_kpi_template',
          'plan_kpi_template.kpi_template',
          'plan_kpi_template.plan',
          'dept',
        ],
      });

      await queryRunner.manager.remove(PlanKpiTemplateDept, toDeleteRows);

      const result = await queryRunner.manager.save(PlanKpiTemplateDept, rows);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async assignKpiEmployees(
    plan_id: number,
    kpi_template_id: number,
    dept_id: number,
    users: UsersDto[],
  ) {
    const queryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const rows = users.map((item) => {
        return {
          plan_kpi_template: {
            plan: { plan_id },
            kpi_template: { kpi_template_id },
          },
          user: { user_id: item.user_id },
        };
      });

      const userIds = rows.map((row) => row.user.user_id);

      let toDeleteRows = await queryRunner.manager.find(PlanKpiTemplateUser, {
        where: {
          plan_kpi_template: {
            plan: { plan_id },
            kpi_template: { kpi_template_id },
          },
          user: { dept: { dept_id } },
        },
        relations: [
          'plan_kpi_template',
          'plan_kpi_template.plan',
          'plan_kpi_template.kpi_template',
          'user',
          'user.dept',
        ],
      });

      toDeleteRows = toDeleteRows.filter(
        (row) => !userIds.includes(row.user.user_id),
      );

      await queryRunner.manager.remove(PlanKpiTemplateUser, toDeleteRows);

      const result = await queryRunner.manager.save(PlanKpiTemplateUser, rows);
      await queryRunner.commitTransaction();
      for (const row of result) {
        Object.keys(row).forEach((key) => row[key] === null && delete row[key]);
      }
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTargetKpiOfdepts(plan_id: number, kpi_template_id: number) {
    return this.planKpiTemplateDeptsRepository.find({
      where: {
        plan_kpi_template: {
          plan: { plan_id },
          kpi_template: { kpi_template_id },
        },
      },
      relations: ['dept'],
    });
  }

  async getTargetKpiOfEmployees(
    plan_id: number,
    kpi_template_id: number,
    dept_id: number,
  ) {
    const rows = await this.planKpiTemplateUsersRepository.find({
      where: {
        plan_kpi_template: {
          plan: { plan_id },
          kpi_template: { kpi_template_id },
        },
        user: { dept: { dept_id } },
      },
      relations: ['user'],
    });

    const result = rows.map((row) => {
      return {
        ...row,
        user: {
          user_id: row.user.user_id,
          user_name: row.user.user_name,
          email: row.user.email,
          avatar: row.user.avatar,
        },
      };
    });

    return result;
  }

  async getPlanKpiCategoriesByManager(plan_id: number, dept_id: number) {
    const rows = await this.planKpiTemplateDeptsRepository.find({
      where: { dept: { dept_id }, plan_kpi_template: { plan: { plan_id } } },
      relations: ['plan_kpi_template', 'plan_kpi_template.kpi_template'],
    });

    const kpi_categories = rows.map((row) => {
      return {
        ...row.plan_kpi_template.kpi_template.kpi_category,
      };
    });

    const resArr = [];
    kpi_categories.filter(function (item) {
      const i = resArr.findIndex(
        (x) => x.kpi_category_id == item.kpi_category_id,
      );
      if (i <= -1) {
        resArr.push(item);
      }
      return null;
    });

    return resArr;
  }

  async getPlanKpiCategoriesByEmployee(plan_id: number, user_id: number) {
    const rows = await this.planKpiTemplateUsersRepository.find({
      where: { user: { user_id }, plan_kpi_template: { plan: { plan_id } } },
      relations: ['plan_kpi_template', 'plan_kpi_template.kpi_template'],
    });

    const kpi_categories = rows.map((row) => {
      return {
        ...row.plan_kpi_template.kpi_template.kpi_category,
      };
    });

    const resArr = [];
    kpi_categories.filter(function (item) {
      const i = resArr.findIndex(
        (x) => x.kpi_category_id == item.kpi_category_id,
      );
      if (i <= -1) {
        resArr.push(item);
      }
      return null;
    });

    return resArr;
  }

  async getKpisOfOneCategoryByManager(
    plan_id: number,
    offset: number,
    limit: number,
    name: string,
    kpi_category_id: number,
    dept_id: number,
  ) {
    const [items, count] =
      await this.planKpiTemplateDeptsRepository.findAndCount({
        where: {
          plan_kpi_template: {
            plan: { plan_id },
            kpi_template: {
              kpi_category: { kpi_category_id },
              kpi_template_name: Like(`%${name ? name : ''}%`),
            },
          },
          dept: { dept_id },
        },
        relations: [
          'plan_kpi_template',
          'dept',
          'plan_kpi_template.kpi_template',
          'plan_kpi_template.kpi_template.kpi_category',
        ],
        order: {
          target: 'ASC',
        },
        skip: offset,
        take: limit,
      });
    for (const item of items) {
      delete item.plan_kpi_template.target;
      delete item.plan_kpi_template.weight;
      delete item.plan_kpi_template.kpi_template.kpi_category;
      delete item.dept;
    }
    return {
      items,
      count,
    };
  }

  async getKpisOfOneCategoryByEmployee(
    plan_id: number,
    offset: number,
    limit: number,
    name: string,
    kpi_category_id: number,
    user_id: number,
  ) {
    const [items, count] =
      await this.planKpiTemplateUsersRepository.findAndCount({
        where: {
          plan_kpi_template: {
            plan: { plan_id },
            kpi_template: {
              kpi_category: { kpi_category_id },
              kpi_template_name: Like(`%${name ? name : ''}%`),
            },
          },
          user: { user_id },
        },
        relations: [
          'plan_kpi_template',
          'user',
          'plan_kpi_template.kpi_template',
          'plan_kpi_template.kpi_template.kpi_category',
        ],
        order: { createdAt: 'ASC' },
        skip: offset,
        take: limit,
      });

    for (const item of items) {
      delete item.plan_kpi_template.target;
      delete item.plan_kpi_template.weight;
      delete item.plan_kpi_template.kpi_template.kpi_category;
      delete item.user;
    }
    return {
      items,
      count,
    };
  }

  async approveQuarterlyTarget(
    plan_id: number,
    kpi_template_id: number,
    dept_id: number,
    quarter: number,
    approve: ApproveRegistration,
  ) {
    const record = await this.planKpiTemplateDeptsRepository.findOne({
      where: {
        plan_kpi_template: {
          kpi_template: { kpi_template_id },
          plan: { plan_id },
        },
        dept: { dept_id },
      },
      relations: [
        'plan_kpi_template',
        'dept',
        'plan_kpi_template.kpi_template',
        'plan_kpi_template.plan',
      ],
    });
    if (record) {
      switch (quarter) {
        case 1:
          if (!record.first_quarterly_target) {
            throw new CustomBadRequestException(
              `Không tìm thấy mục tiêu quý một`,
            );
          }
          record.first_quarterly_target.approve = approve;
          break;
        case 2:
          if (!record.second_quarterly_target) {
            throw new CustomBadRequestException(
              `Không tìm thấy mục tiêu quý hai`,
            );
          }
          record.second_quarterly_target.approve = approve;
          break;
        case 3:
          if (!record.third_quarterly_target) {
            throw new CustomBadRequestException(
              `Không tìm thấy mục tiêu quý ba1`,
            );
          }
          record.third_quarterly_target.approve = approve;
          break;
        case 4:
          if (!record.fourth_quarterly_target) {
            throw new CustomBadRequestException(
              `Không tìm thấy mục tiêu quý bốn`,
            );
          }
          record.fourth_quarterly_target.approve = approve;
          break;
        default:
          break;
      }

      await this.planKpiTemplateDeptsRepository.save(record);
      return { approve };
    }
    throw new CustomNotFoundException(`Không tìm thấy`);
  }

  async registerPersonalKpis(
    plan_id: number,
    personal_kpis: PersonalKpiDto[],
    dept_id: number,
  ) {
    const queryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const personalKpisInDB = await queryRunner.manager.find(
        PlanKpiTemplateDept,
        {
          where: {
            plan_kpi_template: {
              plan: { plan_id },
              kpi_template: { kpi_category: { kpi_category_name: 'Cá nhân' } },
            },
            dept: { dept_id },
          },
          relations: [
            'plan_kpi_template',
            'dept',
            'plan_kpi_template.kpi_template',
            'plan_kpi_template.plan',
          ],
        },
      );

      const personalKpis = personal_kpis.map((item) => item.kpi_template_id);
      const toDeleteRows = personalKpisInDB.filter(
        (row) =>
          !personalKpis.includes(
            row.plan_kpi_template.kpi_template.kpi_template_id,
          ),
      );
      const toCreateRows = personalKpis.map((kpi_template_id) => {
        return {
          plan_kpi_template: {
            plan: { plan_id },
            kpi_template: { kpi_template_id },
          },
          dept: { dept_id },
        };
      });

      await queryRunner.manager.remove(PlanKpiTemplateDept, toDeleteRows);

      const toCreatePlanKpiTemplates = toCreateRows.map((item) => {
        return {
          ...item.plan_kpi_template,
          weight: 0,
        };
      });
      await queryRunner.manager.save(PlanKpiTemplate, toCreatePlanKpiTemplates);
      const personal_category = await queryRunner.manager.findOne(KpiCategory, {
        kpi_category_name: 'Cá nhân',
      });
      await queryRunner.manager.save(PlanKpiCategory, {
        plan: { plan_id },
        kpi_category: personal_category,
        weight: 0,
      });

      await queryRunner.manager.save(PlanKpiTemplateDept, toCreateRows);

      await queryRunner.commitTransaction();
      return toCreateRows;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
