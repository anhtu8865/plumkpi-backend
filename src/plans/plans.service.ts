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
import { KpiCategoryDto } from './dto/registerKpiCategories.dto';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { KpiDto } from './dto/registerKpis.dto';
import { DeptsDto } from './dto/assignKpiDepts.dto';
import { PlanKpiTemplateDept } from './planKpiTemplateDept.entity';
import ApproveRegistration from './approveRegistration.enum';
import { UsersDto } from './dto/assignKpiEmployees.dto';
import { TargetUsersDto } from './dto/registerMonthlyTarget.dto';
import { PersonalKpiDto } from './dto/registerPersonalKpis.dto';
import KpiCategory from 'src/kpiCategories/kpiCategory.entity';
import KpiTemplate from 'src/kpiTemplates/kpiTemplate.entity';
import PlanKpiCategoryDept from './planKpiCategoryDept.entity';
import PlanKpiCategoryUser from './planKpiCategoryUser.entity';
import { RegisterTarget } from './interfaces/register-target.interface';
import {
  Measure,
  Measures,
} from 'src/kpiTemplates/interface/measures.interface';
import Comparison from 'src/kpiTemplates/comparison.enum';
import Aggregation from 'src/kpiTemplates/aggregation.enum';
import User from 'src/users/user.entity';
import Role from 'src/users/role.enum';
import Dept from 'src/departments/dept.entity';
import { FilesService } from 'src/files/files.service';
import NotifsService from 'src/notifications/notifs.service';
import ChartsService from 'src/charts/charts.service';
import { DateType } from 'src/charts/interface/properties.interface';

@Injectable()
export default class PlansService {
  constructor(
    @InjectRepository(Plan)
    private plansRepository: Repository<Plan>,

    @InjectRepository(PlanKpiCategory)
    private plansKpiCategoriesRepository: Repository<PlanKpiCategory>,

    @InjectRepository(PlanKpiCategoryDept)
    private plansKpiCategoryDeptsRepository: Repository<PlanKpiCategoryDept>,

    @InjectRepository(PlanKpiCategoryUser)
    private plansKpiCategoryUsersRepository: Repository<PlanKpiCategoryUser>,

    private readonly kpiCategoriesService: KpiCategoriesService,

    @InjectRepository(PlanKpiTemplateDept)
    private planKpiTemplateDeptsRepository: Repository<PlanKpiTemplateDept>,

    @InjectRepository(PlanKpiTemplateUser)
    private planKpiTemplateUsersRepository: Repository<PlanKpiTemplateUser>,

    @InjectRepository(PlanKpiTemplate)
    private planKpiTemplatesRepository: Repository<PlanKpiTemplate>,

    private readonly filesService: FilesService,

    private readonly notifsService: NotifsService,

    @Inject(forwardRef(() => ChartsService))
    private readonly chartsService: ChartsService,

    @Inject(forwardRef(() => KpiTemplatesService))
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
      let result = await this.plansKpiCategoriesRepository.find({
        where: { plan: { plan_id } },
        relations: ['kpi_category'],
        order: { createdAt: 'ASC' },
      });
      if (result) {
        result = result.filter((item) => item.weight !== 0);
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
      order: { createdAt: 'ASC' },
      skip: offset,
      take: limit,
    });

    return {
      items,
      count,
    };
  }

  async getAllPlans() {
    return this.plansRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async registerKpiCategories(
    plan_id: number,
    kpiCategories: KpiCategoryDto[],
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
          order: { createdAt: 'ASC' },
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
        order: { createdAt: 'ASC' },
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
        order: { createdAt: 'ASC' },
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

  async updateWeightPlanKpiCategoriesDept(
    plan_id: number,
    dept_id: number,
    kpiCategories: KpiCategoryDto[],
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

      const data = [];
      for (const kpiCategory of kpiCategories) {
        const temp = await queryRunner.manager.findOne(PlanKpiCategoryDept, {
          where: {
            plan_kpi_category: {
              plan: { plan_id },
              kpi_category: { kpi_category_id: kpiCategory.kpi_category_id },
            },
            dept: { dept_id },
          },
          relations: [
            'plan_kpi_category',
            'dept',
            'plan_kpi_category.plan',
            'plan_kpi_category.kpi_category',
          ],
        });
        temp.weight = kpiCategory.weight;
        data.push(temp);
      }

      await queryRunner.manager.save(PlanKpiCategoryDept, data);
      await queryRunner.commitTransaction();
      return kpiCategories;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateWeightPlanKpiCategoriesUser(
    plan_id: number,
    user_id: number,
    kpiCategories: KpiCategoryDto[],
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

      const data = [];
      for (const kpiCategory of kpiCategories) {
        const temp = await queryRunner.manager.findOne(PlanKpiCategoryUser, {
          where: {
            plan_kpi_category: {
              plan: { plan_id },
              kpi_category: { kpi_category_id: kpiCategory.kpi_category_id },
            },
            user: { user_id },
          },
          relations: [
            'plan_kpi_category',
            'user',
            'plan_kpi_category.plan',
            'plan_kpi_category.kpi_category',
          ],
        });
        temp.weight = kpiCategory.weight;
        data.push(temp);
      }

      await queryRunner.manager.save(PlanKpiCategoryUser, data);
      await queryRunner.commitTransaction();
      return kpiCategories;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateWeightPlanKpiTemplatesDept(
    plan_id: number,
    dept_id: number,
    kpi_templates: KpiDto[],
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const sum = kpi_templates.reduce((result, item) => {
        return result + item.weight;
      }, 0);
      if (sum !== 100 && kpi_templates.length !== 0) {
        throw new CustomBadRequestException(
          `Tổng trọng số các danh mục KPI phải bằng 100%`,
        );
      }

      const data = [];
      for (const kpi_template of kpi_templates) {
        const temp = await queryRunner.manager.findOne(PlanKpiTemplateDept, {
          where: {
            plan_kpi_template: {
              plan: { plan_id },
              kpi_template: { kpi_template_id: kpi_template.kpi_template_id },
            },
            dept: { dept_id },
          },
          relations: [
            'plan_kpi_template',
            'dept',
            'plan_kpi_template.plan',
            'plan_kpi_template.kpi_template',
          ],
        });
        temp.weight = kpi_template.weight;
        data.push(temp);
      }

      await queryRunner.manager.save(PlanKpiTemplateDept, data);
      await queryRunner.commitTransaction();
      return kpi_templates;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateWeightPlanKpiTemplatesUser(
    plan_id: number,
    user_id: number,
    kpi_templates: KpiDto[],
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const sum = kpi_templates.reduce((result, item) => {
        return result + item.weight;
      }, 0);
      if (sum !== 100 && kpi_templates.length !== 0) {
        throw new CustomBadRequestException(
          `Tổng trọng số các danh mục KPI phải bằng 100%`,
        );
      }

      const data = [];
      for (const kpi_template of kpi_templates) {
        const temp = await queryRunner.manager.findOne(PlanKpiTemplateUser, {
          where: {
            plan_kpi_template: {
              plan: { plan_id },
              kpi_template: { kpi_template_id: kpi_template.kpi_template_id },
            },
            user: { user_id },
          },
          relations: [
            'plan_kpi_template',
            'user',
            'plan_kpi_template.plan',
            'plan_kpi_template.kpi_template',
          ],
        });
        temp.weight = kpi_template.weight;
        data.push(temp);
      }

      await queryRunner.manager.save(PlanKpiTemplateUser, data);
      await queryRunner.commitTransaction();
      return kpi_templates;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async registerKpis(plan_id: number, kpi_category_id: number, kpis: KpiDto[]) {
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
        order: { createdAt: 'ASC' },
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
        plan: { plan_id },
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
    // const { kpi_category_name } =
    //   await this.kpiCategoriesService.getKpiCategoryById(kpi_category_id);
    // if (kpi_category_name === 'Cá nhân') {
    //   return this.getKpisOfPersonalKpisOfDeptsByDirector(
    //     plan_id,
    //     offset,
    //     limit,
    //     name,
    //   );
    // }
    const [items, count] = await this.planKpiTemplatesRepository.findAndCount({
      where: {
        plan: { plan_id },
        kpi_template: {
          kpi_category: { kpi_category_id },
          kpi_template_name: Like(`%${name ? name : ''}%`),
        },
      },
      relations: ['kpi_template'],
      order: { createdAt: 'ASC' },
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

  async getKpisOfOneCategoryInDept(
    plan_id: number,
    offset: number,
    limit: number,
    name: string,
    kpi_category_id: number,
    dept_id: number,
  ) {
    // const { kpi_category_name } =
    //   await this.kpiCategoriesService.getKpiCategoryById(kpi_category_id);
    // if (kpi_category_name === 'Cá nhân') {
    //   return this.getKpisOfPersonalKpisOfDeptsByDirector(
    //     plan_id,
    //     offset,
    //     limit,
    //     name,
    //   );
    // }
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
          'plan_kpi_template.plan',
          'plan_kpi_template.kpi_template',
        ],
        order: { createdAt: 'ASC' },
        skip: offset,
        take: limit,
      });

    const rows = items.map((item) => {
      delete item.plan_kpi_template.kpi_template.kpi_category;
      const kpi_template = item.plan_kpi_template.kpi_template;
      delete item.plan_kpi_template;
      delete item.dept;
      return { ...item, kpi_template };
    });

    return {
      rows,
      count,
    };
  }

  async getKpisOfOneCategoryOfUser(
    plan_id: number,
    offset: number,
    limit: number,
    name: string,
    kpi_category_id: number,
    user_id: number,
  ) {
    // const { kpi_category_name } =
    //   await this.kpiCategoriesService.getKpiCategoryById(kpi_category_id);
    // if (kpi_category_name === 'Cá nhân') {
    //   return this.getKpisOfPersonalKpisOfDeptsByDirector(
    //     plan_id,
    //     offset,
    //     limit,
    //     name,
    //   );
    // }
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
          'plan_kpi_template.plan',
          'plan_kpi_template.kpi_template',
        ],
        order: { createdAt: 'ASC' },
        skip: offset,
        take: limit,
      });

    const rows = items.map((item) => {
      delete item.plan_kpi_template.kpi_template.kpi_category;
      const kpi_template = item.plan_kpi_template.kpi_template;
      delete item.plan_kpi_template;
      delete item.user;
      return { ...item, kpi_template };
    });

    return {
      rows,
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
      const result = await this.planKpiTemplatesRepository.save({
        ...record,
        target,
      });

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

  async enterDataQuarterlyTarget(
    plan_id: number,
    kpi_template_id: number,
    quarter: number,
    value: number,
    note: string,
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
      const key = this.quarterlyKey(quarter);
      if (record[key]?.actual?.approve === ApproveRegistration.Accepted) {
        throw new CustomBadRequestException(
          `Không thể thay đổi số liệu đã được Giám đốc phê duyệt`,
        );
      }
      note = note !== undefined ? note : record[key]?.actual?.note;
      value = value !== undefined ? value : record[key]?.actual?.value;
      const files = record[key]?.actual?.files;

      record[key].actual = {
        value,
        approve: ApproveRegistration.Pending,
        note,
        files,
      };
      await this.planKpiTemplateDeptsRepository.save(record);
      return record[key];
    }
    throw new CustomNotFoundException(`Không tìm thấy`);
  }

  async enterDataMonthlyTarget(
    plan_id: number,
    kpi_template_id: number,
    month: number,
    value: number,
    note: string,
    user_id: number,
  ) {
    const record = await this.planKpiTemplateUsersRepository.findOne({
      where: {
        plan_kpi_template: {
          kpi_template: { kpi_template_id },
          plan: { plan_id },
        },
        user: { user_id },
      },
      relations: [
        'plan_kpi_template',
        'user',
        'plan_kpi_template.kpi_template',
        'plan_kpi_template.plan',
      ],
    });
    if (record) {
      const key = this.monthlyKey(month);
      if (record[key]?.actual?.approve === ApproveRegistration.Accepted) {
        throw new CustomBadRequestException(
          `Không thể thay đổi số liệu đã được Quản lý phê duyệt`,
        );
      }
      note = note !== undefined ? note : record[key]?.actual?.note;
      value = value !== undefined ? value : record[key]?.actual?.value;
      const files = record[key]?.actual?.files;

      record[key].actual = {
        value,
        approve: ApproveRegistration.Pending,
        note,
        files,
      };
      await this.planKpiTemplateUsersRepository.save(record);
      return record[key];
    }
    throw new CustomNotFoundException(`Không tìm thấy`);
  }

  async addFileToMonthlyTargetByEmployee(
    plan_id: number,
    kpi_template_id: number,
    month: number,
    user_id: number,
    imageBuffer: Buffer,
    filename: string,
  ) {
    const record = await this.planKpiTemplateUsersRepository.findOne({
      where: {
        plan_kpi_template: {
          kpi_template: { kpi_template_id },
          plan: { plan_id },
        },
        user: { user_id },
      },
      relations: [
        'plan_kpi_template',
        'user',
        'plan_kpi_template.kpi_template',
        'plan_kpi_template.plan',
      ],
    });
    if (record) {
      const key = this.monthlyKey(month);
      if (!record[key]?.actual)
        throw new CustomNotFoundException(
          `Vui lòng nhập dữ liệu trước khi nộp minh chứng`,
        );
      if (record[key]?.actual?.approve === ApproveRegistration.Accepted) {
        throw new CustomBadRequestException(
          `Không thể thay đổi số liệu đã được Quản lý phê duyệt`,
        );
      }
      const file = await this.filesService.uploadPublicFile(
        imageBuffer,
        filename,
      );
      const files = record[key]?.actual?.files ? record[key].actual.files : [];
      files.push(file);
      record[key].actual.files = files;
      await this.planKpiTemplateUsersRepository.save(record);
      return record[key];
    }
    throw new CustomNotFoundException(`Không tìm thấy`);
  }

  async addFileToQuarterlyTargetByManager(
    plan_id: number,
    kpi_template_id: number,
    quarter: number,
    dept_id,
    imageBuffer: Buffer,
    filename: string,
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
      const key = this.quarterlyKey(quarter);
      if (!record[key]?.actual)
        throw new CustomNotFoundException(
          `Vui lòng nhập dữ liệu trước khi nộp minh chứng`,
        );
      if (record[key]?.actual?.approve === ApproveRegistration.Accepted) {
        throw new CustomBadRequestException(
          `Không thể thay đổi số liệu đã được Giám đốc phê duyệt`,
        );
      }
      const file = await this.filesService.uploadPublicFile(
        imageBuffer,
        filename,
      );
      const files = record[key]?.actual?.files ? record[key].actual.files : [];
      files.push(file);
      record[key].actual.files = files;
      await this.planKpiTemplateDeptsRepository.save(record);
      return record[key];
    }
    throw new CustomNotFoundException(`Không tìm thấy`);
  }

  async deleteFileToMonthlyTargetByEmployee(
    plan_id: number,
    kpi_template_id: number,
    month: number,
    user_id: number,
    file_id: number,
  ) {
    const record = await this.planKpiTemplateUsersRepository.findOne({
      where: {
        plan_kpi_template: {
          kpi_template: { kpi_template_id },
          plan: { plan_id },
        },
        user: { user_id },
      },
      relations: [
        'plan_kpi_template',
        'user',
        'plan_kpi_template.kpi_template',
        'plan_kpi_template.plan',
      ],
    });
    if (record) {
      const key = this.monthlyKey(month);
      if (record[key]?.actual?.approve === ApproveRegistration.Accepted) {
        throw new CustomBadRequestException(
          `Không thể thay đổi số liệu đã được Quản lý phê duyệt`,
        );
      }
      await this.filesService.deletePublicFile(file_id);
      const files = record[key].actual.files.filter(
        (file) => file.id !== file_id,
      );
      record[key].actual.files = files;
      await this.planKpiTemplateUsersRepository.save(record);
      return record[key];
    }
    throw new CustomNotFoundException(`Không tìm thấy`);
  }

  async deleteFileToQuarterlyTargetByManager(
    plan_id: number,
    kpi_template_id: number,
    quarter: number,
    dept_id: number,
    file_id: number,
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
      const key = this.quarterlyKey(quarter);
      if (record[key]?.actual?.approve === ApproveRegistration.Accepted) {
        throw new CustomBadRequestException(
          `Không thể thay đổi số liệu đã được Quản lý phê duyệt`,
        );
      }
      await this.filesService.deletePublicFile(file_id);
      const files = record[key].actual.files.filter(
        (file) => file.id !== file_id,
      );
      record[key].actual.files = files;
      await this.planKpiTemplateDeptsRepository.save(record);
      return record[key];
    }
    throw new CustomNotFoundException(`Không tìm thấy`);
  }

  async registerMonthlyTargetByEmployee(
    plan_id: number,
    kpi_template_id: number,
    target: number,
    month: number,
    user_id: number,
  ) {
    const record = await this.planKpiTemplateUsersRepository.findOne({
      where: {
        plan_kpi_template: {
          kpi_template: { kpi_template_id },
          plan: { plan_id },
        },
        user: { user_id },
      },
      relations: [
        'plan_kpi_template',
        'user',
        'plan_kpi_template.kpi_template',
        'plan_kpi_template.plan',
      ],
    });
    if (record) {
      let monthly_target;
      switch (month) {
        case 1:
          if (
            record.first_monthly_target?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi mục tiêu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target = {
            first_monthly_target: target
              ? {
                  target,
                  approve: ApproveRegistration.Pending,
                }
              : null,
          };
          break;
        case 2:
          if (
            record.second_monthly_target?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi mục tiêu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target = {
            second_monthly_target: target
              ? {
                  target,
                  approve: ApproveRegistration.Pending,
                }
              : null,
          };
          break;
        case 3:
          if (
            record.third_monthly_target?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi mục tiêu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target = {
            third_monthly_target: target
              ? {
                  target,
                  approve: ApproveRegistration.Pending,
                }
              : null,
          };
          break;
        case 4:
          if (
            record.fourth_monthly_target?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi mục tiêu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target = {
            fourth_monthly_target: target
              ? {
                  target,
                  approve: ApproveRegistration.Pending,
                }
              : null,
          };
          break;
        case 5:
          if (
            record.fifth_monthly_target?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi mục tiêu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target = {
            fifth_monthly_target: target
              ? {
                  target,
                  approve: ApproveRegistration.Pending,
                }
              : null,
          };
          break;
        case 6:
          if (
            record.sixth_monthly_target?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi mục tiêu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target = {
            sixth_monthly_target: target
              ? {
                  target,
                  approve: ApproveRegistration.Pending,
                }
              : null,
          };
          break;
        case 7:
          if (
            record.seventh_monthly_target?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi mục tiêu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target = {
            seventh_monthly_target: target
              ? {
                  target,
                  approve: ApproveRegistration.Pending,
                }
              : null,
          };
          break;

        case 8:
          if (
            record.eighth_monthly_target?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi mục tiêu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target = {
            eighth_monthly_target: target
              ? {
                  target,
                  approve: ApproveRegistration.Pending,
                }
              : null,
          };
          break;
        case 9:
          if (
            record.ninth_monthly_target?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi mục tiêu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target = {
            ninth_monthly_target: target
              ? {
                  target,
                  approve: ApproveRegistration.Pending,
                }
              : null,
          };
          break;
        case 10:
          if (
            record.tenth_monthly_target?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi mục tiêu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target = {
            tenth_monthly_target: target
              ? {
                  target,
                  approve: ApproveRegistration.Pending,
                }
              : null,
          };
          break;
        case 11:
          if (
            record.eleventh_monthly_target?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi mục tiêu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target = {
            eleventh_monthly_target: target
              ? {
                  target,
                  approve: ApproveRegistration.Pending,
                }
              : null,
          };
          break;
        case 12:
          if (
            record.twelfth_monthly_target?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi mục tiêu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target = {
            twelfth_monthly_target: target
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

      await this.planKpiTemplateUsersRepository.save({
        ...record,
        ...monthly_target,
      });
      return monthly_target;
    }
    throw new CustomNotFoundException(`Không tìm thấy`);
  }

  async registerMonthlyTarget(
    plan_id: number,
    kpi_template_id: number,
    target: number,
    month: number,
    users: TargetUsersDto[],
    dept: Dept,
  ) {
    const kpi_template = await this.kpiTemplatesService.getKpiTemplateById(
      kpi_template_id,
    );
    const plan = await this.getPlanById(plan_id);
    const quarterly_targets_of_dept = await this.getQuarterlyTargetsOfDept(
      plan,
      kpi_template,
      dept,
    );
    if (this.isAccepted(quarterly_targets_of_dept, month)) {
      throw new CustomBadRequestException(
        `Không thể thay đổi số liệu của quý đã được Ban Giám Đốc phê duyệt`,
      );
    }

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
          user: { dept },
        },
        relations: [
          'plan_kpi_template',
          'plan_kpi_template.kpi_template',
          'plan_kpi_template.plan',
          'user',
          'user.dept',
        ],
        order: { createdAt: 'ASC' },
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
              first_monthly_target: user.target
                ? {
                    target: user.target,
                    approve: ApproveRegistration.Accepted,
                  }
                : { target, approve: ApproveRegistration.Accepted },
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
              second_monthly_target: user.target
                ? {
                    target: user.target,
                    approve: ApproveRegistration.Accepted,
                  }
                : { target, approve: ApproveRegistration.Accepted },
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
              third_monthly_target: user.target
                ? {
                    target: user.target,
                    approve: ApproveRegistration.Accepted,
                  }
                : { target, approve: ApproveRegistration.Accepted },
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
              fourth_monthly_target: user.target
                ? {
                    target: user.target,
                    approve: ApproveRegistration.Accepted,
                  }
                : { target, approve: ApproveRegistration.Accepted },
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
              fifth_monthly_target: user.target
                ? {
                    target: user.target,
                    approve: ApproveRegistration.Accepted,
                  }
                : { target, approve: ApproveRegistration.Accepted },
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
              sixth_monthly_target: user.target
                ? {
                    target: user.target,
                    approve: ApproveRegistration.Accepted,
                  }
                : { target, approve: ApproveRegistration.Accepted },
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
              seventh_monthly_target: user.target
                ? {
                    target: user.target,
                    approve: ApproveRegistration.Accepted,
                  }
                : { target, approve: ApproveRegistration.Accepted },
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
              eighth_monthly_target: user.target
                ? {
                    target: user.target,
                    approve: ApproveRegistration.Accepted,
                  }
                : { target, approve: ApproveRegistration.Accepted },
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
              ninth_monthly_target: user.target
                ? {
                    target: user.target,
                    approve: ApproveRegistration.Accepted,
                  }
                : { target, approve: ApproveRegistration.Accepted },
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
              tenth_monthly_target: user.target
                ? {
                    target: user.target,
                    approve: ApproveRegistration.Accepted,
                  }
                : { target, approve: ApproveRegistration.Accepted },
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
              eleventh_monthly_target: user.target
                ? {
                    target: user.target,
                    approve: ApproveRegistration.Accepted,
                  }
                : { target, approve: ApproveRegistration.Accepted },
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
              twelfth_monthly_target: user.target
                ? {
                    target: user.target,
                    approve: ApproveRegistration.Accepted,
                  }
                : { target, approve: ApproveRegistration.Accepted },
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
      const { kpi_category, kpi_template_name } =
        await queryRunner.manager.findOne(KpiTemplate, {
          kpi_template_id,
        });
      const rows2 = depts.map((item) => {
        return {
          plan_kpi_category: {
            plan: { plan_id },
            kpi_category,
          },
          dept: { dept_id: item.dept_id },
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
        order: { createdAt: 'ASC' },
      });
      const deptIdsToDelete = [];
      for (const toDeleteRow of toDeleteRows) {
        const rows = await queryRunner.manager.find(PlanKpiTemplateDept, {
          where: {
            plan_kpi_template: {
              plan: { plan_id },
              kpi_template: { kpi_category },
            },
            dept: toDeleteRow.dept,
          },
          relations: [
            'plan_kpi_template',
            'plan_kpi_template.kpi_template',
            'plan_kpi_template.kpi_template.kpi_category',
            'plan_kpi_template.plan',
            'dept',
          ],
          order: { createdAt: 'ASC' },
        });
        if (rows.length === 1) {
          deptIdsToDelete.push(toDeleteRow.dept.dept_id);
        }
      }
      const toDeleteRows2 = await queryRunner.manager.find(
        PlanKpiCategoryDept,
        {
          where: {
            plan_kpi_category: {
              plan: { plan_id },
              kpi_category,
            },
            dept: { dept_id: In(deptIdsToDelete) },
          },
          relations: [
            'plan_kpi_category',
            'plan_kpi_category.kpi_category',
            'plan_kpi_category.plan',
            'dept',
          ],
          order: { createdAt: 'ASC' },
        },
      );

      await queryRunner.manager.remove(PlanKpiTemplateDept, toDeleteRows);
      await queryRunner.manager.remove(PlanKpiCategoryDept, toDeleteRows2);

      const result = await queryRunner.manager.save(PlanKpiTemplateDept, rows);
      await queryRunner.manager.save(PlanKpiCategoryDept, rows2);
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

      const { kpi_category } = await queryRunner.manager.findOne(KpiTemplate, {
        kpi_template_id,
      });
      const rows2 = users.map((item) => {
        return {
          plan_kpi_category: {
            plan: { plan_id },
            kpi_category,
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
        order: { createdAt: 'ASC' },
      });

      toDeleteRows = toDeleteRows.filter(
        (row) => !userIds.includes(row.user.user_id),
      );

      for (const toDeleteRow of toDeleteRows) {
        for (let i = 0; i <= 12; i++) {
          const key = this.monthlyKey(i);
          if (toDeleteRow[key]?.actual) {
            throw new CustomBadRequestException(
              `Không thể xoá KPI ${toDeleteRow.plan_kpi_template.kpi_template.kpi_template_name} của nhân viên ${toDeleteRow.user.user_name} vì đã có số liệu của tháng ${i}`,
            );
          }
        }
      }

      const userIdsToDelete = [];
      for (const toDeleteRow of toDeleteRows) {
        const rows = await queryRunner.manager.find(PlanKpiTemplateUser, {
          where: {
            plan_kpi_template: {
              plan: { plan_id },
              kpi_template: { kpi_category },
            },
            user: toDeleteRow.user,
          },
          relations: [
            'plan_kpi_template',
            'plan_kpi_template.kpi_template',
            'plan_kpi_template.kpi_template.kpi_category',
            'plan_kpi_template.plan',
            'user',
          ],
          order: { createdAt: 'ASC' },
        });
        if (rows.length === 1) {
          userIdsToDelete.push(toDeleteRow.user.user_id);
        }
      }
      const toDeleteRows2 = await queryRunner.manager.find(
        PlanKpiCategoryUser,
        {
          where: {
            plan_kpi_category: {
              plan: { plan_id },
              kpi_category,
            },
            user: { user_id: In(userIdsToDelete) },
          },
          relations: [
            'plan_kpi_category',
            'plan_kpi_category.kpi_category',
            'plan_kpi_category.plan',
            'user',
          ],
          order: { createdAt: 'ASC' },
        },
      );

      await queryRunner.manager.remove(PlanKpiTemplateUser, toDeleteRows);
      await queryRunner.manager.remove(PlanKpiCategoryUser, toDeleteRows2);

      const result = await queryRunner.manager.save(PlanKpiTemplateUser, rows);
      await queryRunner.manager.save(PlanKpiCategoryUser, rows2);

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

  async getTargetKpiOfdeptsWithActual(
    plan_id: number,
    kpi_template_id: number,
    user: User,
  ) {
    const rows = await this.getTargetKpiOfdepts(plan_id, kpi_template_id);
    const { kpi_category } = await this.kpiTemplatesService.getKpiTemplateById(
      kpi_template_id,
    );
    if (kpi_category.kpi_category_name === 'Cá nhân') return rows;

    const deptIds = rows.map((row) => row.dept.dept_id);
    const properties = {
      kpis: [kpi_template_id],
      period: [1, 2, 3, 4],
      plan_id,
      dateType: DateType.Quarter,
      filter: deptIds,
      chart_name: 'abc',
      description: '',
    };
    const { datasets } = await this.chartsService.getData(properties, user);

    for (const [i, row] of rows.entries()) {
      if (row.first_quarterly_target !== null) {
        row.first_quarterly_target['actual_value'] = datasets[i].data[0].actual;
      }

      if (row.second_quarterly_target !== null) {
        row.second_quarterly_target['actual_value'] =
          datasets[i].data[1].actual;
      }

      if (row.third_quarterly_target !== null) {
        row.third_quarterly_target['actual_value'] = datasets[i].data[2].actual;
      }

      if (row.fourth_quarterly_target !== null) {
        row.fourth_quarterly_target['actual_value'] =
          datasets[i].data[3].actual;
      }
    }
    return rows;
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
      order: { createdAt: 'ASC' },
    });
  }

  async getDeptsAssignedKpi(plan_id: number, kpi_template_id: number) {
    const target_kpi_of_depts = await this.getTargetKpiOfdepts(
      plan_id,
      kpi_template_id,
    );
    const depts = target_kpi_of_depts.map((item) => item.dept);
    return depts;
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
      order: { createdAt: 'ASC' },
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

  async getTargetKpiOfEmployeesWithoutPagination(
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
      order: { createdAt: 'ASC' },
    });

    return rows;
  }

  async getEmployeesAssignedKpi(
    plan_id: number,
    kpi_template_id: number,
    dept_id: number,
  ) {
    const target_kpi_of_employees =
      await this.getTargetKpiOfEmployeesWithoutPagination(
        plan_id,
        kpi_template_id,
        dept_id,
      );

    const users = target_kpi_of_employees.map((item) => item.user);
    return users;
  }

  async getPlanKpiCategoriesByManager(plan_id: number, dept_id: number) {
    const rows = await this.plansKpiCategoryDeptsRepository.find({
      where: { plan_kpi_category: { plan: { plan_id } }, dept: { dept_id } },
      relations: [
        'plan_kpi_category',
        'plan_kpi_category.plan',
        'plan_kpi_category.kpi_category',
        'dept',
      ],
      order: { createdAt: 'ASC' },
    });
    const result = rows.map((row) => {
      return {
        weight: row.weight,
        kpi_category: row.plan_kpi_category.kpi_category,
      };
    });
    return result;
  }

  async getPlanKpiCategoriesByEmployee(plan_id: number, user_id: number) {
    const rows = await this.plansKpiCategoryUsersRepository.find({
      where: {
        plan_kpi_category: { plan: { plan_id } },
        user: { user_id },
      },
      relations: [
        'plan_kpi_category',
        'plan_kpi_category.plan',
        'plan_kpi_category.kpi_category',
        'user',
      ],
      order: { createdAt: 'ASC' },
    });
    const items = rows.map((row) => {
      return {
        weight: row.weight,
        kpi_category: row.plan_kpi_category.kpi_category,
      };
    });
    return items;
  }

  resultOfKpi(target: number, actual: number, measures: Measure[]) {
    // * target is not assigned
    // * OK
    let result = 100;
    let color = 'Tím';
    if (target === undefined) return { result, color };
    if (actual === undefined) return { result: 0, color };
    if (measures.length === 0) return { result, color };
    for (const measure of measures) {
      const comparedNumber = (measure.percentOfTarget * target) / 100;
      switch (measure.comparison) {
        case Comparison.EqualTo:
          if (actual === comparedNumber) {
            result = measure.percentOfKpi;
            color = measure.color;
          }
          break;
        case Comparison.NotEqualTo:
          if (actual !== comparedNumber) {
            result = measure.percentOfKpi;
            color = measure.color;
          }
          break;
        case Comparison.GreaterThan:
          if (actual > comparedNumber) {
            result = measure.percentOfKpi;
            color = measure.color;
          }
          break;
        case Comparison.GreaterThanOrEqual:
          if (actual >= comparedNumber) {
            result = measure.percentOfKpi;
            color = measure.color;
          }
          break;
        case Comparison.LessThan:
          if (actual < comparedNumber) {
            result = measure.percentOfKpi;
            color = measure.color;
          }
          break;
        case Comparison.LessThanOrEqual:
          if (actual <= comparedNumber) {
            result = measure.percentOfKpi;
            color = measure.color;
          }
          break;
        default:
          break;
      }
    }
    return { result, color };
  }

  monthlyKey(month: number) {
    let key;
    switch (month) {
      case 1:
        key = 'first_monthly_target';
        break;
      case 2:
        key = 'second_monthly_target';
        break;
      case 3:
        key = 'third_monthly_target';
        break;
      case 4:
        key = 'fourth_monthly_target';
        break;
      case 5:
        key = 'fifth_monthly_target';
        break;
      case 6:
        key = 'sixth_monthly_target';
        break;
      case 7:
        key = 'seventh_monthly_target';
        break;
      case 8:
        key = 'eighth_monthly_target';
        break;
      case 9:
        key = 'ninth_monthly_target';
        break;
      case 10:
        key = 'tenth_monthly_target';
        break;
      case 11:
        key = 'eleventh_monthly_target';
        break;
      case 12:
        key = 'twelfth_monthly_target';
        break;
      default:
        break;
    }
    return key;
  }

  quarterlyKey(quarter: number) {
    let key;
    switch (quarter) {
      case 1:
        key = 'first_quarterly_target';
        break;
      case 2:
        key = 'second_quarterly_target';
        break;
      case 3:
        key = 'third_quarterly_target';
        break;
      case 4:
        key = 'fourth_quarterly_target';
        break;
      default:
        break;
    }
    return key;
  }

  async getPerformanceOfEmployee(
    plan_id: number,
    user_id: number,
    months: number[],
  ) {
    try {
      const kpiCategories = await this.getPlanKpiCategoriesByEmployee(
        plan_id,
        user_id,
      );
      let result = 0;
      const kpi_categories = [];
      // kpiCategories = kpiCategories.filter((item) => item.weight !== 0);
      for (const kpiCategory of kpiCategories) {
        const { items: kpis } = await this.getKpisOfOneCategoryByEmployee(
          plan_id,
          null,
          null,
          null,
          kpiCategory.kpi_category.kpi_category_id,
          user_id,
        );

        let resultOfKpiCategory = 0;
        const kpi_templates = [];
        for (const kpi of kpis) {
          const monthly_targets = [];
          for (const month of months) {
            const key = this.monthlyKey(month);
            // To personal kpi, if its approve # chấp nhận, equal not assigned
            if (kpi[key] && kpi[key].approve === ApproveRegistration.Accepted)
              monthly_targets.push(kpi[key]);
          }

          const targets = monthly_targets.map((item) => item.target);
          const actuals = monthly_targets.map((item) =>
            !item.actual || item.actual.approve !== ApproveRegistration.Accepted
              ? undefined
              : item.actual.value,
          );

          const target = this.aggregateNumbers(
            targets,
            kpi.plan_kpi_template.kpi_template.aggregation,
          );

          const actual = this.aggregateNumbers(
            actuals,
            kpi.plan_kpi_template.kpi_template.aggregation,
          );
          const resultOfKpi = this.resultOfKpi(
            target,
            actual,
            kpi.plan_kpi_template.kpi_template.measures.items,
          );
          resultOfKpiCategory += (resultOfKpi.result * kpi.weight) / 100;
          kpi_templates.push({
            weight: kpi.weight,
            kpi_template_id: kpi.plan_kpi_template.kpi_template.kpi_template_id,
            resultOfKpi,
            target,
            actual,
          });
        }
        result += (resultOfKpiCategory * kpiCategory.weight) / 100;
        kpi_categories.push({
          weight: kpiCategory.weight,
          kpi_category_id: kpiCategory.kpi_category.kpi_category_id,
          resultOfKpiCategory,
          kpi_templates,
        });
      }

      return { result, kpi_categories };
    } catch (error) {
      console.log(
        '🚀 ~ file: plans.service.ts ~ line 2235 ~ PlansService ~ error',
        error,
      );
      throw new CustomBadRequestException(
        `Vui lòng kiểm tra lại trọng số trong kế hoạch của nhân viên id ${user_id}`,
      );
    }
  }

  aggregateNumbers(numbers: number[], aggregation: Aggregation) {
    const count = numbers.length;
    if (count !== 0) {
      numbers = numbers.filter((item) => item !== undefined);
      if (numbers.length === 0) return undefined;
      switch (aggregation) {
        case Aggregation.Sum:
          return numbers.reduce((pre, cur) => pre + cur, 0);
        case Aggregation.Average:
          const sum = numbers.reduce((pre, cur) => pre + cur, 0);
          return sum / count;
        case Aggregation.Max:
          return numbers.reduce((pre, cur) => (pre > cur ? pre : cur));
        case Aggregation.Min:
          return numbers.reduce((pre, cur) => (pre < cur ? pre : cur));
        case Aggregation.New:
          return numbers[numbers.length - 1];
        default:
          break;
      }
    }
    // * target is not assigned
    return undefined;
  }

  async getPerformanceOfManager(
    plan_id: number,
    dept_id: number,
    months: number[],
  ) {
    try {
      const rows = await this.getPlanKpiCategoriesByManager(plan_id, dept_id);
      let result = 0;
      const kpi_categories = [];

      const kpiCategories = [];
      let personalCategory;
      rows.map((item) => {
        if (item.weight !== 0) kpiCategories.push(item);
        else personalCategory = item;
      });
      for (const kpiCategory of kpiCategories) {
        const { items: kpis } = await this.getKpisOfOneCategoryByManager(
          plan_id,
          null,
          null,
          null,
          kpiCategory.kpi_category.kpi_category_id,
          dept_id,
        );

        let resultOfKpiCategory = 0;
        const kpi_templates = [];
        for (const kpi of kpis) {
          const multi_months_target = [];
          const multi_months_actual = [];
          const target_kpi_of_employees = await this.getTargetKpiOfEmployees(
            plan_id,
            kpi.plan_kpi_template.kpi_template.kpi_template_id,
            dept_id,
          );
          for (const month of months) {
            const monthly_target_of_employees = [];
            const key = this.monthlyKey(month);
            target_kpi_of_employees.map((item) => {
              // * there is no personal kpi of employee, so approve is always 'Chấp nhận'
              if (item[key]) monthly_target_of_employees.push(item[key]);
            });
            const targets = monthly_target_of_employees.map(
              (item) => item.target,
            );
            const actuals = monthly_target_of_employees.map((item) =>
              !item.actual ||
              item.actual.approve !== ApproveRegistration.Accepted
                ? undefined
                : item.actual.value,
            );
            const target = this.aggregateNumbers(
              targets,
              kpi.plan_kpi_template.kpi_template.aggregation,
            );
            const actual = this.aggregateNumbers(
              actuals,
              kpi.plan_kpi_template.kpi_template.aggregation,
            );
            if (target !== undefined) {
              multi_months_target.push(target);
              multi_months_actual.push(actual);
            }
          }

          let target = this.aggregateNumbers(
            multi_months_target,
            kpi.plan_kpi_template.kpi_template.aggregation,
          );

          const actual = this.aggregateNumbers(
            multi_months_actual,
            kpi.plan_kpi_template.kpi_template.aggregation,
          );

          if (JSON.stringify(months) == JSON.stringify([1, 2, 3])) {
            target = kpi.first_quarterly_target?.target;
          }
          if (JSON.stringify(months) == JSON.stringify([4, 5, 6])) {
            target = kpi.second_quarterly_target?.target;
          }
          if (JSON.stringify(months) == JSON.stringify([7, 8, 9])) {
            target = kpi.third_quarterly_target?.target;
          }
          if (JSON.stringify(months) == JSON.stringify([10, 11, 12])) {
            target = kpi.fourth_quarterly_target?.target;
          }
          if (months.length === 12) {
            target = kpi.target ? kpi.target : undefined;
          }
          const resultOfKpi = this.resultOfKpi(
            target,
            actual,
            kpi.plan_kpi_template.kpi_template.measures.items,
          );
          resultOfKpiCategory += (resultOfKpi.result * kpi.weight) / 100;
          kpi_templates.push({
            weight: kpi.weight,
            kpi_template_id: kpi.plan_kpi_template.kpi_template.kpi_template_id,
            resultOfKpi,
            target,
            actual,
          });
        }
        result += (resultOfKpiCategory * kpiCategory.weight) / 100;
        kpi_categories.push({
          weight: kpiCategory.weight,
          kpi_category_id: kpiCategory.kpi_category.kpi_category_id,
          resultOfKpiCategory,
          kpi_templates,
        });
      }

      // TODO add personal kpi of manager
      if (personalCategory) {
        const { items: kpis } = await this.getKpisOfOneCategoryByManager(
          plan_id,
          null,
          null,
          null,
          personalCategory.kpi_category.kpi_category_id,
          dept_id,
        );
        let resultOfKpiCategory = 0;
        const kpi_templates = [];
        for (const kpi of kpis) {
          const quarterly_targets = [];
          const quarters = [];
          if (JSON.stringify(months) == JSON.stringify([1, 2, 3])) {
            quarters.push(1);
          } else if (JSON.stringify(months) == JSON.stringify([4, 5, 6])) {
            quarters.push(2);
          } else if (JSON.stringify(months) == JSON.stringify([7, 8, 9])) {
            quarters.push(3);
          } else if (JSON.stringify(months) == JSON.stringify([10, 11, 12])) {
            quarters.push(4);
          } else if (months.length === 12) {
            quarters.push(1, 2, 3, 4);
          }
          for (const quarter of quarters) {
            const key = this.quarterlyKey(quarter);
            if (kpi[key] && kpi[key].approve === ApproveRegistration.Accepted)
              quarterly_targets.push(kpi[key]);
          }
          const targets = quarterly_targets.map((item) => item.target);
          const actuals = quarterly_targets.map((item) =>
            !item.actual || item.actual.approve !== ApproveRegistration.Accepted
              ? undefined
              : item.actual.value,
          );

          const target = this.aggregateNumbers(
            targets,
            kpi.plan_kpi_template.kpi_template.aggregation,
          );

          const actual = this.aggregateNumbers(
            actuals,
            kpi.plan_kpi_template.kpi_template.aggregation,
          );
          const resultOfKpi = this.resultOfKpi(
            target,
            actual,
            kpi.plan_kpi_template.kpi_template.measures.items,
          );
          resultOfKpiCategory += (resultOfKpi.result * kpi.weight) / 100;
          kpi_templates.push({
            weight: kpi.weight,
            kpi_template_id: kpi.plan_kpi_template.kpi_template.kpi_template_id,
            resultOfKpi,
            target,
            actual,
          });
        }
        result += (resultOfKpiCategory * personalCategory.weight) / 100;
        kpi_categories.push({
          weight: personalCategory.weight,
          kpi_category_id: personalCategory.kpi_category.kpi_category_id,
          resultOfKpiCategory,
          kpi_templates,
        });
      }

      return { result, kpi_categories };
    } catch (error) {
      console.log(
        '🚀 ~ file: plans.service.ts ~ line 2611 ~ PlansService ~ error',
        error,
      );

      throw new CustomBadRequestException(
        `Vui lòng kiểm tra lại trọng số trong kế hoạch của phòng ban id ${dept_id}`,
      );
    }
  }

  async getPerformanceOfDirector(plan_id: number, months: number[]) {
    try {
      let kpiCategories = await this.getPlanKpiCategories(plan_id);
      let result = 0;
      const kpi_categories = [];
      kpiCategories = kpiCategories.filter((item) => item.weight !== 0);
      for (const kpiCategory of kpiCategories) {
        const { items: kpis } = await this.getKpisOfOneCategory(
          plan_id,
          null,
          null,
          null,
          kpiCategory.kpi_category.kpi_category_id,
        );

        let resultOfKpiCategory = 0;
        const kpi_templates = [];
        for (const kpi of kpis) {
          const multi_months_target = [];
          const multi_months_actual = [];
          const target_kpi_of_depts = await this.getTargetKpiOfdepts(
            plan_id,
            kpi.kpi_template.kpi_template_id,
          );

          for (const month of months) {
            const monthly_target_of_depts = [];
            const monthly_actual_of_depts = [];
            const key = this.monthlyKey(month);
            for (const target_kpi_of_dept of target_kpi_of_depts) {
              const monthly_target_of_employees = [];
              const target_kpi_of_employees =
                await this.getTargetKpiOfEmployees(
                  plan_id,
                  kpi.kpi_template.kpi_template_id,
                  target_kpi_of_dept.dept.dept_id,
                );
              target_kpi_of_employees.map((item) => {
                if (item[key]) monthly_target_of_employees.push(item[key]);
              });
              const targets = monthly_target_of_employees.map(
                (item) => item.target,
              );
              const actuals = monthly_target_of_employees.map((item) =>
                !item.actual ||
                item.actual.approve !== ApproveRegistration.Accepted
                  ? undefined
                  : item.actual.value,
              );
              const target = this.aggregateNumbers(
                targets,
                kpi.kpi_template.aggregation,
              );
              const actual = this.aggregateNumbers(
                actuals,
                kpi.kpi_template.aggregation,
              );
              if (target !== undefined) {
                monthly_target_of_depts.push(target);
                monthly_actual_of_depts.push(actual);
              }
            }
            const target = this.aggregateNumbers(
              monthly_target_of_depts,
              kpi.kpi_template.aggregation,
            );

            const actual = this.aggregateNumbers(
              monthly_actual_of_depts,
              kpi.kpi_template.aggregation,
            );
            if (target !== undefined) {
              multi_months_target.push(target);
              multi_months_actual.push(actual);
            }
          }
          let target = this.aggregateNumbers(
            multi_months_target,
            kpi.kpi_template.aggregation,
          );

          const actual = this.aggregateNumbers(
            multi_months_actual,
            kpi.kpi_template.aggregation,
          );

          if (months.length === 3) {
            const targets = [];
            let key;
            if (JSON.stringify(months) == JSON.stringify([1, 2, 3])) {
              key = this.quarterlyKey(1);
            }
            if (JSON.stringify(months) == JSON.stringify([4, 5, 6])) {
              key = this.quarterlyKey(2);
            }
            if (JSON.stringify(months) == JSON.stringify([7, 8, 9])) {
              key = this.quarterlyKey(3);
            }
            if (JSON.stringify(months) == JSON.stringify([10, 11, 12])) {
              key = this.quarterlyKey(4);
            }
            for (const target_kpi_of_dept of target_kpi_of_depts) {
              if (target_kpi_of_dept[key])
                targets.push(target_kpi_of_dept[key].target);
            }
            target = this.aggregateNumbers(
              targets,
              kpi.kpi_template.aggregation,
            );
          }

          if (months.length === 12) {
            target = kpi.target ? kpi.target : undefined;
          }
          const resultOfKpi = this.resultOfKpi(
            target,
            actual,
            kpi.kpi_template.measures.items,
          );
          resultOfKpiCategory += (resultOfKpi.result * kpi.weight) / 100;
          kpi_templates.push({
            weight: kpi.weight,
            kpi_template_id: kpi.kpi_template.kpi_template_id,
            resultOfKpi,
            target,
            actual,
          });
        }
        result += (resultOfKpiCategory * kpiCategory.weight) / 100;
        kpi_categories.push({
          weight: kpiCategory.weight,
          kpi_category_id: kpiCategory.kpi_category.kpi_category_id,
          resultOfKpiCategory,
          kpi_templates,
        });
      }

      return { result, kpi_categories };
    } catch (error) {
      console.log(
        '🚀 ~ file: plans.service.ts ~ line 3188 ~ PlansService ~ getPerformanceOfDirector ~ error',
        error,
      );

      throw new CustomBadRequestException(
        `Vui lòng kiểm tra lại trọng số trong kế hoạch`,
      );
    }
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
        order: { createdAt: 'ASC' },
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

  async getPersonalKpisByManager(plan_id: number, dept_id: number) {
    const items = await this.planKpiTemplateDeptsRepository.find({
      where: {
        plan_kpi_template: {
          plan: { plan_id },
          kpi_template: {
            kpi_category: { kpi_category_name: 'Cá nhân' },
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
      order: { createdAt: 'ASC' },
    });
    for (const item of items) {
      delete item.plan_kpi_template.target;
      delete item.plan_kpi_template.weight;
      delete item.plan_kpi_template.kpi_template.kpi_category;
      delete item.dept;
    }
    return items;
  }

  async getKpisOfPersonalKpisOfEmployeesByManager(
    plan_id: number,
    offset: number,
    limit: number,
    name: string,
    dept_id: number,
  ) {
    const result = await this.planKpiTemplateUsersRepository.find({
      where: {
        plan_kpi_template: {
          plan: { plan_id },
          kpi_template: {
            kpi_category: { kpi_category_name: 'Cá nhân' },
            kpi_template_name: Like(`%${name ? name : ''}%`),
          },
        },
        user: { dept: { dept_id } },
      },
      relations: [
        'plan_kpi_template',
        'user',
        'plan_kpi_template.kpi_template',
        'plan_kpi_template.kpi_template.kpi_category',
        'plan_kpi_template.plan',
        'user.dept',
      ],
      order: { createdAt: 'ASC' },
    });
    const result2 = result.map((item) => {
      return {
        ...item.plan_kpi_template.kpi_template,
      };
    });

    let items = [];
    result2.filter(function (item) {
      const i = items.findIndex(
        (x) => x.kpi_template_id === item.kpi_template_id,
      );
      if (i <= -1) {
        items.push(item);
      }
      return null;
    });

    items.sort(function (a, b) {
      return a.kpi_template_id - b.kpi_template_id;
    });
    const count = items.length;

    items = items.slice(offset, offset + limit);

    return {
      items,
      count,
    };
  }

  async getKpisOfPersonalKpisOfDeptsByDirector(
    plan_id: number,
    offset: number,
    limit: number,
    name: string,
  ) {
    const result = await this.planKpiTemplateDeptsRepository.find({
      where: {
        plan_kpi_template: {
          plan: { plan_id },
          kpi_template: {
            kpi_category: { kpi_category_name: 'Cá nhân' },
            kpi_template_name: Like(`%${name ? name : ''}%`),
          },
        },
      },
      relations: [
        'plan_kpi_template',
        'plan_kpi_template.kpi_template',
        'plan_kpi_template.kpi_template.kpi_category',
        'plan_kpi_template.plan',
      ],
      order: { createdAt: 'ASC' },
    });
    const result2 = result.map((item) => {
      return {
        ...item.plan_kpi_template.kpi_template,
      };
    });

    let items = [];
    result2.filter(function (item) {
      const i = items.findIndex(
        (x) => x.kpi_template_id === item.kpi_template_id,
      );
      if (i <= -1) {
        items.push(item);
      }
      return null;
    });

    items.sort(function (a, b) {
      return a.kpi_template_id - b.kpi_template_id;
    });
    const count = items.length;

    items = items.slice(offset, offset + limit);

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

  async getPersonalKpisByEmployee(plan_id: number, user_id: number) {
    const items = await this.planKpiTemplateUsersRepository.find({
      where: {
        plan_kpi_template: {
          plan: { plan_id },
          kpi_template: {
            kpi_category: { kpi_category_name: 'Cá nhân' },
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
    });

    for (const item of items) {
      delete item.plan_kpi_template.target;
      delete item.plan_kpi_template.weight;
      delete item.plan_kpi_template.kpi_template.kpi_category;
      delete item.user;
    }
    return items;
  }

  async approveQuarterlyTarget(
    plan_id: number,
    kpi_template_id: number,
    dept_ids: number[],
    quarter: number,
    approve: ApproveRegistration,
  ) {
    const records = await this.planKpiTemplateDeptsRepository.find({
      where: {
        plan_kpi_template: {
          kpi_template: { kpi_template_id },
          plan: { plan_id },
        },
        dept: { dept_id: In(dept_ids) },
      },
      relations: [
        'plan_kpi_template',
        'dept',
        'plan_kpi_template.kpi_template',
        'plan_kpi_template.plan',
      ],
    });

    if (records.length !== 0) {
      const key = this.quarterlyKey(quarter);
      for (const record of records) {
        if (record[key]) record[key].approve = approve;
      }
      await this.planKpiTemplateDeptsRepository.save(records);
      return { approve };
    }
    throw new CustomNotFoundException(`Không tìm thấy`);
  }

  async approveDataQuarterlyTarget(
    plan_id: number,
    kpi_template_id: number,
    dept_ids: number[],
    quarter: number,
    approve: ApproveRegistration,
  ) {
    const records = await this.planKpiTemplateDeptsRepository.find({
      where: {
        plan_kpi_template: {
          kpi_template: { kpi_template_id },
          plan: { plan_id },
        },
        dept: { dept_id: In(dept_ids) },
      },
      relations: [
        'plan_kpi_template',
        'dept',
        'plan_kpi_template.kpi_template',
        'plan_kpi_template.plan',
      ],
    });
    if (records.length !== 0) {
      const key = this.quarterlyKey(quarter);
      for (const record of records) {
        if (record[key]?.actual) record[key].actual.approve = approve;
      }
      await this.planKpiTemplateDeptsRepository.save(records);
      return { approve };
    }
    throw new CustomNotFoundException(`Không tìm thấy`);
  }

  isAccepted(quarterly_targets_of_dept: PlanKpiTemplateDept, month: number) {
    const {
      first_quarterly_target,
      second_quarterly_target,
      third_quarterly_target,
      fourth_quarterly_target,
    } = quarterly_targets_of_dept;
    if (
      [1, 2, 3].includes(month) &&
      first_quarterly_target?.actual?.approve === ApproveRegistration.Accepted
    ) {
      return true;
    } else if (
      [4, 5, 6].includes(month) &&
      second_quarterly_target?.actual?.approve === ApproveRegistration.Accepted
    ) {
      return true;
    } else if (
      [7, 8, 9].includes(month) &&
      third_quarterly_target?.actual?.approve === ApproveRegistration.Accepted
    ) {
      return true;
    } else if (
      fourth_quarterly_target?.actual?.approve === ApproveRegistration.Accepted
    ) {
      return true;
    }
    return false;
  }

  async approveDataMonthlyTarget(
    plan_id: number,
    kpi_template_id: number,
    user_ids: number[],
    month: number,
    approve: ApproveRegistration,
    dept: Dept,
  ) {
    const kpi_template = await this.kpiTemplatesService.getKpiTemplateById(
      kpi_template_id,
    );
    if (kpi_template.kpi_category.kpi_category_name !== 'Cá nhân') {
      const plan = await this.getPlanById(plan_id);
      const quarterly_targets_of_dept = await this.getQuarterlyTargetsOfDept(
        plan,
        kpi_template,
        dept,
      );
      if (this.isAccepted(quarterly_targets_of_dept, month)) {
        throw new CustomBadRequestException(
          `Không thể thay đổi số liệu của quý đã được Ban Giám Đốc phê duyệt`,
        );
      }
    }
    const records = await this.planKpiTemplateUsersRepository.find({
      where: {
        plan_kpi_template: {
          kpi_template: { kpi_template_id },
          plan: { plan_id },
        },
        user: { user_id: In(user_ids) },
      },
      relations: [
        'plan_kpi_template',
        'user',
        'plan_kpi_template.kpi_template',
        'plan_kpi_template.plan',
      ],
    });
    if (records.length !== 0) {
      const key = this.monthlyKey(month);
      for (const record of records) {
        if (record[key]?.actual) record[key].actual.approve = approve;
      }
      await this.planKpiTemplateUsersRepository.save(records);
      return { approve };
    }
    throw new CustomNotFoundException(`Không tìm thấy`);
  }

  async approveMonthlyTarget(
    plan_id: number,
    kpi_template_id: number,
    user_ids: number[],
    month: number,
    approve: ApproveRegistration,
  ) {
    const records = await this.planKpiTemplateUsersRepository.find({
      where: {
        plan_kpi_template: {
          kpi_template: { kpi_template_id },
          plan: { plan_id },
        },
        user: { user_id: In(user_ids) },
      },
      relations: [
        'plan_kpi_template',
        'user',
        'plan_kpi_template.kpi_template',
        'plan_kpi_template.plan',
      ],
    });
    if (records.length !== 0) {
      const key = this.monthlyKey(month);
      for (const record of records) {
        if (record[key]) record[key].approve = approve;
      }

      await this.planKpiTemplateUsersRepository.save(records);
      return { approve };
    }
    throw new CustomNotFoundException(`Không tìm thấy`);
  }

  async registerPersonalKpisByManager(
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
          order: { createdAt: 'ASC' },
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
          weight: 0,
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

      await queryRunner.manager.save(PlanKpiCategoryDept, {
        plan_kpi_category: {
          plan: { plan_id },
          kpi_category: personal_category,
        },
        dept: { dept_id },
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

  async registerPersonalKpisByEmployee(
    plan_id: number,
    personal_kpis: PersonalKpiDto[],
    user_id: number,
  ) {
    const queryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const personalKpisInDB = await queryRunner.manager.find(
        PlanKpiTemplateUser,
        {
          where: {
            plan_kpi_template: {
              plan: { plan_id },
              kpi_template: { kpi_category: { kpi_category_name: 'Cá nhân' } },
            },
            user: { user_id },
          },
          relations: [
            'plan_kpi_template',
            'user',
            'plan_kpi_template.kpi_template',
            'plan_kpi_template.plan',
          ],
          order: { createdAt: 'ASC' },
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
          user: { user_id },
          weight: 0,
        };
      });

      await queryRunner.manager.remove(PlanKpiTemplateUser, toDeleteRows);

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

      await queryRunner.manager.save(PlanKpiCategoryUser, {
        plan_kpi_category: {
          plan: { plan_id },
          kpi_category: personal_category,
        },
        user: { user_id },
        weight: 0,
      });

      await queryRunner.manager.save(PlanKpiTemplateUser, toCreateRows);

      await queryRunner.commitTransaction();
      return toCreateRows;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getKpis(plan: Plan, user: User) {
    const role = user.role;
    let result;
    let result2;
    if (role === Role.Director) {
      result = await this.planKpiTemplatesRepository.find({
        where: {
          plan,
        },
        relations: ['plan', 'kpi_template'],
        order: { createdAt: 'ASC' },
      });

      result2 = await this.plansKpiCategoriesRepository.find({
        where: { plan },
        relations: ['plan', 'kpi_category'],
        order: { createdAt: 'ASC' },
      });
      const kpis = result.map((item) => item.kpi_template);
      const kpi_categories = result2.map((item) => item.kpi_category);
      for (const kpi_category of kpi_categories) {
        const kpi_templates = kpis.filter(
          (item) =>
            item.kpi_category.kpi_category_id === kpi_category.kpi_category_id,
        );
        kpi_category.kpi_templates = kpi_templates;
      }
      for (const kpi_category of kpi_categories) {
        for (const kpi_template of kpi_category.kpi_templates) {
          delete kpi_template.aggregation,
            delete kpi_template.measures,
            delete kpi_template.kpi_category;
          delete kpi_template.unit;
        }
      }
      return kpi_categories.filter(
        (kpi_category) => kpi_category.kpi_category_name !== 'Cá nhân',
      );
    } else if (role === Role.Manager) {
      const dept = user.manage;
      result = await this.planKpiTemplateDeptsRepository.find({
        where: {
          dept,
          plan_kpi_template: { plan },
        },
        relations: [
          'dept',
          'plan_kpi_template',
          'plan_kpi_template.kpi_template',
          'plan_kpi_template.plan',
        ],
        order: { createdAt: 'ASC' },
      });

      result2 = await this.plansKpiCategoryDeptsRepository.find({
        where: { dept, plan_kpi_category: { plan } },
        relations: [
          'plan_kpi_category',
          'dept',
          'plan_kpi_category.plan',
          'plan_kpi_category.kpi_category',
        ],
        order: { createdAt: 'ASC' },
      });
    } else {
      result = await this.planKpiTemplateUsersRepository.find({
        where: { user, plan_kpi_template: { plan } },
        relations: [
          'user',
          'plan_kpi_template',
          'plan_kpi_template.kpi_template',
          'plan_kpi_template.plan',
        ],
        order: { createdAt: 'ASC' },
      });

      result2 = await this.plansKpiCategoryUsersRepository.find({
        where: { user, plan_kpi_category: { plan } },
        relations: [
          'plan_kpi_category',
          'user',
          'plan_kpi_category.plan',
          'plan_kpi_category.kpi_category',
        ],
        order: { createdAt: 'ASC' },
      });
    }
    const kpis = result.map((item) => item.plan_kpi_template.kpi_template);
    const kpi_categories = result2.map(
      (item) => item.plan_kpi_category.kpi_category,
    );
    for (const kpi_category of kpi_categories) {
      const kpi_templates = kpis.filter(
        (item) =>
          item.kpi_category.kpi_category_id === kpi_category.kpi_category_id,
      );
      kpi_category.kpi_templates = kpi_templates;
    }
    for (const kpi_category of kpi_categories) {
      for (const kpi_template of kpi_category.kpi_templates) {
        delete kpi_template.aggregation,
          delete kpi_template.measures,
          delete kpi_template.kpi_category;
        delete kpi_template.unit;
      }
    }

    return kpi_categories.filter(
      (kpi_category) => kpi_category.kpi_category_name !== 'Cá nhân',
    );
  }

  async getMonthlyTargetsOfUser(
    plan: Plan,
    kpi_template: KpiTemplate,
    user: User,
  ) {
    return this.planKpiTemplateUsersRepository.findOne({
      where: {
        plan_kpi_template: {
          plan,
          kpi_template,
        },
        user,
      },
    });
  }

  async getQuarterlyTargetsOfDept(
    plan: Plan,
    kpi_template: KpiTemplate,
    dept: Dept,
  ) {
    return this.planKpiTemplateDeptsRepository.findOne({
      where: {
        plan_kpi_template: {
          plan,
          kpi_template,
        },
        dept,
      },
    });
  }

  async getYearlyTargetKpi(plan: Plan, kpi_template: KpiTemplate) {
    return this.planKpiTemplatesRepository.findOne({ plan, kpi_template });
  }
}
