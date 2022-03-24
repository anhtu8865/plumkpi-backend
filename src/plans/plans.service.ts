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
import { Injectable } from '@nestjs/common';
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
    const { kpi_category_name } =
      await this.kpiCategoriesService.getKpiCategoryById(kpi_category_id);
    if (kpi_category_name === 'Cá nhân') {
      return this.getKpisOfPersonalKpisOfDeptsByDirector(
        plan_id,
        offset,
        limit,
        name,
      );
    }
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
        order: { weight: 'ASC' },
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
        order: { weight: 'ASC' },
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
      let quarterly_target;
      switch (quarter) {
        case 1:
          quarterly_target = {
            first_quarterly_target: record.first_quarterly_target,
          };
          if (
            quarterly_target.first_quarterly_target?.actual?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi số liệu đã được Ban Giám Đốc phê duyệt`,
            );
          }
          quarterly_target.first_quarterly_target.actual = value
            ? {
                value,
                approve: ApproveRegistration.Pending,
                note,
              }
            : null;
          break;
        case 2:
          quarterly_target = {
            second_quarterly_target: record.second_quarterly_target,
          };
          if (
            quarterly_target.second_quarterly_target?.actual?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi số liệu đã được Ban Giám Đốc phê duyệt`,
            );
          }
          quarterly_target.second_quarterly_target.actual = value
            ? {
                value,
                approve: ApproveRegistration.Pending,
                note,
              }
            : null;
          break;
        case 3:
          quarterly_target = {
            third_quarterly_target: record.third_quarterly_target,
          };
          if (
            quarterly_target.third_quarterly_target?.actual?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi số liệu đã được Ban Giám Đốc phê duyệt`,
            );
          }
          quarterly_target.third_quarterly_target.actual = value
            ? {
                value,
                approve: ApproveRegistration.Pending,
                note,
              }
            : null;
          break;
        case 4:
          quarterly_target = {
            fourth_quarterly_target: record.fourth_quarterly_target,
          };
          if (
            quarterly_target.fourth_quarterly_target?.actual?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi số liệu đã được Ban Giám Đốc phê duyệt`,
            );
          }
          quarterly_target.fourth_quarterly_target.actual = value
            ? {
                value,
                approve: ApproveRegistration.Pending,
                note,
              }
            : null;
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
      let monthly_target;
      switch (month) {
        case 1:
          monthly_target = {
            first_monthly_target: record.first_monthly_target,
          };
          if (
            monthly_target.first_monthly_target?.actual?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi số liệu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target.first_monthly_target.actual = value
            ? {
                value,
                approve: ApproveRegistration.Pending,
                note,
              }
            : null;
          break;
        case 2:
          monthly_target = {
            second_monthly_target: record.second_monthly_target,
          };
          if (
            monthly_target.second_monthly_target?.actual?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi số liệu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target.second_monthly_target.actual = value
            ? {
                value,
                approve: ApproveRegistration.Pending,
                note,
              }
            : null;
          break;

        case 3:
          monthly_target = {
            third_monthly_target: record.third_monthly_target,
          };
          if (
            monthly_target.third_monthly_target?.actual?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi số liệu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target.third_monthly_target.actual = value
            ? {
                value,
                approve: ApproveRegistration.Pending,
                note,
              }
            : null;
          break;
        case 4:
          monthly_target = {
            fourth_monthly_target: record.fourth_monthly_target,
          };
          if (
            monthly_target.fourth_monthly_target?.actual?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi số liệu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target.fourth_monthly_target.actual = value
            ? {
                value,
                approve: ApproveRegistration.Pending,
                note,
              }
            : null;
          break;
        case 5:
          monthly_target = {
            fifth_monthly_target: record.fifth_monthly_target,
          };
          if (
            monthly_target.fifth_monthly_target?.actual?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi số liệu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target.fifth_monthly_target.actual = value
            ? {
                value,
                approve: ApproveRegistration.Pending,
                note,
              }
            : null;
          break;
        case 6:
          monthly_target = {
            sixth_monthly_target: record.sixth_monthly_target,
          };
          if (
            monthly_target.sixth_monthly_target?.actual?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi số liệu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target.sixth_monthly_target.actual = value
            ? {
                value,
                approve: ApproveRegistration.Pending,
                note,
              }
            : null;
          break;

        case 7:
          monthly_target = {
            seventh_monthly_target: record.seventh_monthly_target,
          };
          if (
            monthly_target.seventh_monthly_target?.actual?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi số liệu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target.seventh_monthly_target.actual = value
            ? {
                value,
                approve: ApproveRegistration.Pending,
                note,
              }
            : null;
          break;
        case 8:
          monthly_target = {
            eighth_monthly_target: record.eighth_monthly_target,
          };
          if (
            monthly_target.eighth_monthly_target?.actual?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi số liệu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target.eighth_monthly_target.actual = value
            ? {
                value,
                approve: ApproveRegistration.Pending,
                note,
              }
            : null;
          break;
        case 9:
          monthly_target = {
            ninth_monthly_target: record.ninth_monthly_target,
          };
          if (
            monthly_target.ninth_monthly_target?.actual?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi số liệu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target.ninth_monthly_target.actual = value
            ? {
                value,
                approve: ApproveRegistration.Pending,
                note,
              }
            : null;
          break;
        case 10:
          monthly_target = {
            tenth_monthly_target: record.tenth_monthly_target,
          };
          if (
            monthly_target.tenth_monthly_target?.actual?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi số liệu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target.tenth_monthly_target.actual = value
            ? {
                value,
                approve: ApproveRegistration.Pending,
                note,
              }
            : null;
          break;
        case 11:
          monthly_target = {
            eleventh_monthly_target: record.eleventh_monthly_target,
          };
          if (
            monthly_target.eleventh_monthly_target?.actual?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi số liệu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target.eleventh_monthly_target.actual = value
            ? {
                value,
                approve: ApproveRegistration.Pending,
                note,
              }
            : null;
          break;
        case 12:
          monthly_target = {
            twelfth_monthly_target: record.twelfth_monthly_target,
          };
          if (
            monthly_target.twelfth_monthly_target?.actual?.approve ===
            ApproveRegistration.Accepted
          ) {
            throw new CustomBadRequestException(
              `Không thể thay đổi số liệu đã được Quản lý phê duyệt`,
            );
          }
          monthly_target.twelfth_monthly_target.actual = value
            ? {
                value,
                approve: ApproveRegistration.Pending,
                note,
              }
            : null;
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
              first_monthly_target: user.target
                ? { target: user.target, approve: ApproveRegistration.Accepted }
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
                ? { target: user.target, approve: ApproveRegistration.Accepted }
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
                ? { target: user.target, approve: ApproveRegistration.Accepted }
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
                ? { target: user.target, approve: ApproveRegistration.Accepted }
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
                ? { target: user.target, approve: ApproveRegistration.Accepted }
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
                ? { target: user.target, approve: ApproveRegistration.Accepted }
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
                ? { target: user.target, approve: ApproveRegistration.Accepted }
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
                ? { target: user.target, approve: ApproveRegistration.Accepted }
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
                ? { target: user.target, approve: ApproveRegistration.Accepted }
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
                ? { target: user.target, approve: ApproveRegistration.Accepted }
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
                ? { target: user.target, approve: ApproveRegistration.Accepted }
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
                ? { target: user.target, approve: ApproveRegistration.Accepted }
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
      const { kpi_category } = await queryRunner.manager.findOne(KpiTemplate, {
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
      });

      toDeleteRows = toDeleteRows.filter(
        (row) => !userIds.includes(row.user.user_id),
      );

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
      order: { user: 'ASC' },
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
    const rows = await this.plansKpiCategoryDeptsRepository.find({
      where: { plan_kpi_category: { plan: { plan_id } }, dept: { dept_id } },
      relations: [
        'plan_kpi_category',
        'plan_kpi_category.plan',
        'plan_kpi_category.kpi_category',
        'dept',
      ],
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
    if (target === undefined) return 100;

    let result = 0;
    for (const measure of measures) {
      const comparedNumber = (measure.percentOfTarget * target) / 100;
      switch (measure.comparison) {
        case Comparison.EqualTo:
          if (actual === comparedNumber) {
            result = measure.percentOfKpi;
          }
          break;
        case Comparison.NotEqualTo:
          if (actual !== comparedNumber) {
            result = measure.percentOfKpi;
          }
          break;
        case Comparison.GreaterThan:
          if (actual > comparedNumber) {
            result = measure.percentOfKpi;
          }
          break;
        case Comparison.GreaterThanOrEqual:
          if (actual >= comparedNumber) {
            result = measure.percentOfKpi;
          }
          break;
        case Comparison.LessThan:
          if (actual < comparedNumber) {
            result = measure.percentOfKpi;
          }
          break;
        case Comparison.LessThanOrEqual:
          if (actual <= comparedNumber) {
            result = measure.percentOfKpi;
          }
          break;
        default:
          break;
      }
    }
    return result;
  }

  async getPerformanceOfEmployee(
    plan_id: number,
    user_id: number,
    months: number[],
  ) {
    try {
      let kpiCategories = await this.getPlanKpiCategoriesByEmployee(
        plan_id,
        user_id,
      );
      let result = 0;
      const kpi_categories = [];
      kpiCategories = kpiCategories.filter((item) => item.weight !== 0);
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
            switch (month) {
              case 1:
                if (kpi.first_monthly_target)
                  monthly_targets.push(kpi.first_monthly_target);
                break;
              case 2:
                if (kpi.second_monthly_target)
                  monthly_targets.push(kpi.second_monthly_target);
                break;
              case 3:
                if (kpi.third_monthly_target)
                  monthly_targets.push(kpi.third_monthly_target);
                break;
              case 4:
                if (kpi.fourth_monthly_target)
                  monthly_targets.push(kpi.fourth_monthly_target);
                break;
              case 5:
                if (kpi.fifth_monthly_target)
                  monthly_targets.push(kpi.fifth_monthly_target);
                break;
              case 6:
                if (kpi.sixth_monthly_target)
                  monthly_targets.push(kpi.sixth_monthly_target);
                break;
              case 7:
                if (kpi.seventh_monthly_target)
                  monthly_targets.push(kpi.seventh_monthly_target);
                break;
              case 8:
                if (kpi.eighth_monthly_target)
                  monthly_targets.push(kpi.eighth_monthly_target);
                break;
              case 9:
                if (kpi.ninth_monthly_target)
                  monthly_targets.push(kpi.ninth_monthly_target);
                break;
              case 10:
                if (kpi.tenth_monthly_target)
                  monthly_targets.push(kpi.tenth_monthly_target);
                break;
              case 11:
                if (kpi.eleventh_monthly_target)
                  monthly_targets.push(kpi.eleventh_monthly_target);
                break;
              case 12:
                if (kpi.twelfth_monthly_target)
                  monthly_targets.push(kpi.twelfth_monthly_target);
                break;
              default:
                break;
            }
          }

          const targets = monthly_targets.map((item) => item.target);
          const actuals = monthly_targets.map((item) =>
            !item.actual || item.actual.approve !== ApproveRegistration.Accepted
              ? 0
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
          resultOfKpiCategory += (resultOfKpi * kpi.weight) / 100;
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
          return numbers[count - 1];
        default:
          break;
      }
    }
    // * target is not assigned
    return undefined;
  }

  async getPerformanceOfManagerByMonth(
    plan_id: number,
    dept_id: number,
    month: number,
  ) {
    try {
      let kpiCategories = await this.getPlanKpiCategoriesByManager(
        plan_id,
        dept_id,
      );
      let result = 0;

      kpiCategories = kpiCategories.filter((item) => item.weight !== 0);

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
        for (const kpi of kpis) {
          const monthly_target_of_employees = [];
          const target_kpi_of_employees = await this.getTargetKpiOfEmployees(
            plan_id,
            kpi.plan_kpi_template.kpi_template.kpi_template_id,
            dept_id,
          );
          switch (month) {
            case 1:
              target_kpi_of_employees.map((item) => {
                if (item.first_monthly_target)
                  monthly_target_of_employees.push(item.first_monthly_target);
              });
              break;
            case 2:
              target_kpi_of_employees.map((item) => {
                if (item.second_monthly_target)
                  monthly_target_of_employees.push(item.second_monthly_target);
              });
              break;
            case 3:
              target_kpi_of_employees.map((item) => {
                if (item.third_monthly_target)
                  monthly_target_of_employees.push(item.third_monthly_target);
              });
              break;
            case 4:
              target_kpi_of_employees.map((item) => {
                if (item.fourth_monthly_target)
                  monthly_target_of_employees.push(item.fourth_monthly_target);
              });
              break;
            case 5:
              target_kpi_of_employees.map((item) => {
                if (item.fifth_monthly_target)
                  monthly_target_of_employees.push(item.fifth_monthly_target);
              });
              break;
            case 6:
              target_kpi_of_employees.map((item) => {
                if (item.sixth_monthly_target)
                  monthly_target_of_employees.push(item.sixth_monthly_target);
              });
              break;
            case 7:
              target_kpi_of_employees.map((item) => {
                if (item.seventh_monthly_target)
                  monthly_target_of_employees.push(item.seventh_monthly_target);
              });
              break;
            case 8:
              target_kpi_of_employees.map((item) => {
                if (item.eighth_monthly_target)
                  monthly_target_of_employees.push(item.eighth_monthly_target);
              });
              break;
            case 9:
              target_kpi_of_employees.map((item) => {
                if (item.ninth_monthly_target)
                  monthly_target_of_employees.push(item.ninth_monthly_target);
              });
              break;
            case 10:
              target_kpi_of_employees.map((item) => {
                if (item.tenth_monthly_target)
                  monthly_target_of_employees.push(item.tenth_monthly_target);
              });
              break;
            case 11:
              target_kpi_of_employees.map((item) => {
                if (item.eleventh_monthly_target)
                  monthly_target_of_employees.push(
                    item.eleventh_monthly_target,
                  );
              });
              break;
            case 12:
              target_kpi_of_employees.map((item) => {
                if (item.twelfth_monthly_target)
                  monthly_target_of_employees.push(item.twelfth_monthly_target);
              });
              break;
            default:
              break;
          }

          const targets = monthly_target_of_employees.map(
            (item) => item.target,
          );
          const actuals = monthly_target_of_employees.map((item) =>
            !item.actual || item.actual.approve !== ApproveRegistration.Accepted
              ? 0
              : item.actual.value,
          );

          const target = this.aggregateNumbers(targets, Aggregation.Sum);

          const actual = this.aggregateNumbers(actuals, Aggregation.Sum);

          resultOfKpiCategory +=
            (this.resultOfKpi(
              target,
              actual,
              kpi.plan_kpi_template.kpi_template.measures.items,
            ) *
              kpi.weight) /
            100;
        }
        result += (resultOfKpiCategory * kpiCategory.weight) / 100;
      }

      return { result };
    } catch (error) {
      console.log(error);
      throw new CustomBadRequestException(
        `Vui lòng kiểm tra lại trọng số trong kế hoạch của phòng ban id ${dept_id}`,
      );
    }
  }

  async getPerformanceOfManager(
    plan_id: number,
    dept_id: number,
    months: number[],
  ) {
    try {
      let kpiCategories = await this.getPlanKpiCategoriesByManager(
        plan_id,
        dept_id,
      );
      let result = 0;
      const kpi_categories = [];
      kpiCategories = kpiCategories.filter((item) => item.weight !== 0);

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
            switch (month) {
              case 1:
                target_kpi_of_employees.map((item) => {
                  if (item.first_monthly_target)
                    monthly_target_of_employees.push(item.first_monthly_target);
                });
                break;
              case 2:
                target_kpi_of_employees.map((item) => {
                  if (item.second_monthly_target)
                    monthly_target_of_employees.push(
                      item.second_monthly_target,
                    );
                });
                break;
              case 3:
                target_kpi_of_employees.map((item) => {
                  if (item.third_monthly_target)
                    monthly_target_of_employees.push(item.third_monthly_target);
                });
                break;
              case 4:
                target_kpi_of_employees.map((item) => {
                  if (item.fourth_monthly_target)
                    monthly_target_of_employees.push(
                      item.fourth_monthly_target,
                    );
                });
                break;
              case 5:
                target_kpi_of_employees.map((item) => {
                  if (item.fifth_monthly_target)
                    monthly_target_of_employees.push(item.fifth_monthly_target);
                });
                break;
              case 6:
                target_kpi_of_employees.map((item) => {
                  if (item.sixth_monthly_target)
                    monthly_target_of_employees.push(item.sixth_monthly_target);
                });
                break;
              case 7:
                target_kpi_of_employees.map((item) => {
                  if (item.seventh_monthly_target)
                    monthly_target_of_employees.push(
                      item.seventh_monthly_target,
                    );
                });
                break;
              case 8:
                target_kpi_of_employees.map((item) => {
                  if (item.eighth_monthly_target)
                    monthly_target_of_employees.push(
                      item.eighth_monthly_target,
                    );
                });
                break;
              case 9:
                target_kpi_of_employees.map((item) => {
                  if (item.ninth_monthly_target)
                    monthly_target_of_employees.push(item.ninth_monthly_target);
                });
                break;
              case 10:
                target_kpi_of_employees.map((item) => {
                  if (item.tenth_monthly_target)
                    monthly_target_of_employees.push(item.tenth_monthly_target);
                });
                break;
              case 11:
                target_kpi_of_employees.map((item) => {
                  if (item.eleventh_monthly_target)
                    monthly_target_of_employees.push(
                      item.eleventh_monthly_target,
                    );
                });
                break;
              case 12:
                target_kpi_of_employees.map((item) => {
                  if (item.twelfth_monthly_target)
                    monthly_target_of_employees.push(
                      item.twelfth_monthly_target,
                    );
                });
                break;
              default:
                break;
            }
            const targets = monthly_target_of_employees.map(
              (item) => item.target,
            );
            const actuals = monthly_target_of_employees.map((item) =>
              !item.actual ||
              item.actual.approve !== ApproveRegistration.Accepted
                ? 0
                : item.actual.value,
            );
            const target = this.aggregateNumbers(targets, Aggregation.Sum);
            const actual = this.aggregateNumbers(actuals, Aggregation.Sum);
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
          resultOfKpiCategory += (resultOfKpi * kpi.weight) / 100;
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
            switch (month) {
              case 1:
                for (const target_kpi_of_dept of target_kpi_of_depts) {
                  const monthly_target_of_employees = [];
                  const target_kpi_of_employees =
                    await this.getTargetKpiOfEmployees(
                      plan_id,
                      kpi.kpi_template.kpi_template_id,
                      target_kpi_of_dept.dept.dept_id,
                    );
                  target_kpi_of_employees.map((item) => {
                    if (item.first_monthly_target)
                      monthly_target_of_employees.push(
                        item.first_monthly_target,
                      );
                  });
                  const targets = monthly_target_of_employees.map(
                    (item) => item.target,
                  );
                  const actuals = monthly_target_of_employees.map((item) =>
                    !item.actual ||
                    item.actual.approve !== ApproveRegistration.Accepted
                      ? 0
                      : item.actual.value,
                  );
                  const target = this.aggregateNumbers(
                    targets,
                    Aggregation.Sum,
                  );
                  const actual = this.aggregateNumbers(
                    actuals,
                    Aggregation.Sum,
                  );
                  if (target !== undefined) {
                    monthly_target_of_depts.push(target);
                    monthly_actual_of_depts.push(actual);
                  }
                }
                break;
              case 2:
                for (const target_kpi_of_dept of target_kpi_of_depts) {
                  const monthly_target_of_employees = [];
                  const target_kpi_of_employees =
                    await this.getTargetKpiOfEmployees(
                      plan_id,
                      kpi.kpi_template.kpi_template_id,
                      target_kpi_of_dept.dept.dept_id,
                    );
                  target_kpi_of_employees.map((item) => {
                    if (item.second_monthly_target)
                      monthly_target_of_employees.push(
                        item.second_monthly_target,
                      );
                  });
                  const targets = monthly_target_of_employees.map(
                    (item) => item.target,
                  );
                  const actuals = monthly_target_of_employees.map((item) =>
                    !item.actual ||
                    item.actual.approve !== ApproveRegistration.Accepted
                      ? 0
                      : item.actual.value,
                  );
                  const target = this.aggregateNumbers(
                    targets,
                    Aggregation.Sum,
                  );
                  const actual = this.aggregateNumbers(
                    actuals,
                    Aggregation.Sum,
                  );
                  if (target !== undefined) {
                    monthly_target_of_depts.push(target);
                    monthly_actual_of_depts.push(actual);
                  }
                }
                break;
              case 3:
                for (const target_kpi_of_dept of target_kpi_of_depts) {
                  const monthly_target_of_employees = [];
                  const target_kpi_of_employees =
                    await this.getTargetKpiOfEmployees(
                      plan_id,
                      kpi.kpi_template.kpi_template_id,
                      target_kpi_of_dept.dept.dept_id,
                    );
                  target_kpi_of_employees.map((item) => {
                    if (item.third_monthly_target)
                      monthly_target_of_employees.push(
                        item.third_monthly_target,
                      );
                  });
                  const targets = monthly_target_of_employees.map(
                    (item) => item.target,
                  );
                  const actuals = monthly_target_of_employees.map((item) =>
                    !item.actual ||
                    item.actual.approve !== ApproveRegistration.Accepted
                      ? 0
                      : item.actual.value,
                  );
                  const target = this.aggregateNumbers(
                    targets,
                    Aggregation.Sum,
                  );
                  const actual = this.aggregateNumbers(
                    actuals,
                    Aggregation.Sum,
                  );
                  if (target !== undefined) {
                    monthly_target_of_depts.push(target);
                    monthly_actual_of_depts.push(actual);
                  }
                }
                break;
              case 4:
                for (const target_kpi_of_dept of target_kpi_of_depts) {
                  const monthly_target_of_employees = [];
                  const target_kpi_of_employees =
                    await this.getTargetKpiOfEmployees(
                      plan_id,
                      kpi.kpi_template.kpi_template_id,
                      target_kpi_of_dept.dept.dept_id,
                    );
                  target_kpi_of_employees.map((item) => {
                    if (item.fourth_monthly_target)
                      monthly_target_of_employees.push(
                        item.fourth_monthly_target,
                      );
                  });
                  const targets = monthly_target_of_employees.map(
                    (item) => item.target,
                  );
                  const actuals = monthly_target_of_employees.map((item) =>
                    !item.actual ||
                    item.actual.approve !== ApproveRegistration.Accepted
                      ? 0
                      : item.actual.value,
                  );
                  const target = this.aggregateNumbers(
                    targets,
                    Aggregation.Sum,
                  );
                  const actual = this.aggregateNumbers(
                    actuals,
                    Aggregation.Sum,
                  );
                  if (target !== undefined) {
                    monthly_target_of_depts.push(target);
                    monthly_actual_of_depts.push(actual);
                  }
                }
                break;
              case 5:
                for (const target_kpi_of_dept of target_kpi_of_depts) {
                  const monthly_target_of_employees = [];
                  const target_kpi_of_employees =
                    await this.getTargetKpiOfEmployees(
                      plan_id,
                      kpi.kpi_template.kpi_template_id,
                      target_kpi_of_dept.dept.dept_id,
                    );
                  target_kpi_of_employees.map((item) => {
                    if (item.fifth_monthly_target)
                      monthly_target_of_employees.push(
                        item.fifth_monthly_target,
                      );
                  });
                  const targets = monthly_target_of_employees.map(
                    (item) => item.target,
                  );
                  const actuals = monthly_target_of_employees.map((item) =>
                    !item.actual ||
                    item.actual.approve !== ApproveRegistration.Accepted
                      ? 0
                      : item.actual.value,
                  );
                  const target = this.aggregateNumbers(
                    targets,
                    Aggregation.Sum,
                  );
                  const actual = this.aggregateNumbers(
                    actuals,
                    Aggregation.Sum,
                  );
                  if (target !== undefined) {
                    monthly_target_of_depts.push(target);
                    monthly_actual_of_depts.push(actual);
                  }
                }
                break;
              case 6:
                for (const target_kpi_of_dept of target_kpi_of_depts) {
                  const monthly_target_of_employees = [];
                  const target_kpi_of_employees =
                    await this.getTargetKpiOfEmployees(
                      plan_id,
                      kpi.kpi_template.kpi_template_id,
                      target_kpi_of_dept.dept.dept_id,
                    );
                  target_kpi_of_employees.map((item) => {
                    if (item.sixth_monthly_target)
                      monthly_target_of_employees.push(
                        item.sixth_monthly_target,
                      );
                  });
                  const targets = monthly_target_of_employees.map(
                    (item) => item.target,
                  );
                  const actuals = monthly_target_of_employees.map((item) =>
                    !item.actual ||
                    item.actual.approve !== ApproveRegistration.Accepted
                      ? 0
                      : item.actual.value,
                  );
                  const target = this.aggregateNumbers(
                    targets,
                    Aggregation.Sum,
                  );
                  const actual = this.aggregateNumbers(
                    actuals,
                    Aggregation.Sum,
                  );
                  if (target !== undefined) {
                    monthly_target_of_depts.push(target);
                    monthly_actual_of_depts.push(actual);
                  }
                }
                break;
              case 7:
                for (const target_kpi_of_dept of target_kpi_of_depts) {
                  const monthly_target_of_employees = [];
                  const target_kpi_of_employees =
                    await this.getTargetKpiOfEmployees(
                      plan_id,
                      kpi.kpi_template.kpi_template_id,
                      target_kpi_of_dept.dept.dept_id,
                    );
                  target_kpi_of_employees.map((item) => {
                    if (item.seventh_monthly_target)
                      monthly_target_of_employees.push(
                        item.seventh_monthly_target,
                      );
                  });
                  const targets = monthly_target_of_employees.map(
                    (item) => item.target,
                  );
                  const actuals = monthly_target_of_employees.map((item) =>
                    !item.actual ||
                    item.actual.approve !== ApproveRegistration.Accepted
                      ? 0
                      : item.actual.value,
                  );
                  const target = this.aggregateNumbers(
                    targets,
                    Aggregation.Sum,
                  );
                  const actual = this.aggregateNumbers(
                    actuals,
                    Aggregation.Sum,
                  );
                  if (target !== undefined) {
                    monthly_target_of_depts.push(target);
                    monthly_actual_of_depts.push(actual);
                  }
                }
                break;
              case 8:
                for (const target_kpi_of_dept of target_kpi_of_depts) {
                  const monthly_target_of_employees = [];
                  const target_kpi_of_employees =
                    await this.getTargetKpiOfEmployees(
                      plan_id,
                      kpi.kpi_template.kpi_template_id,
                      target_kpi_of_dept.dept.dept_id,
                    );
                  target_kpi_of_employees.map((item) => {
                    if (item.eighth_monthly_target)
                      monthly_target_of_employees.push(
                        item.eighth_monthly_target,
                      );
                  });
                  const targets = monthly_target_of_employees.map(
                    (item) => item.target,
                  );
                  const actuals = monthly_target_of_employees.map((item) =>
                    !item.actual ||
                    item.actual.approve !== ApproveRegistration.Accepted
                      ? 0
                      : item.actual.value,
                  );
                  const target = this.aggregateNumbers(
                    targets,
                    Aggregation.Sum,
                  );
                  const actual = this.aggregateNumbers(
                    actuals,
                    Aggregation.Sum,
                  );
                  if (target !== undefined) {
                    monthly_target_of_depts.push(target);
                    monthly_actual_of_depts.push(actual);
                  }
                }
                break;
              case 9:
                for (const target_kpi_of_dept of target_kpi_of_depts) {
                  const monthly_target_of_employees = [];
                  const target_kpi_of_employees =
                    await this.getTargetKpiOfEmployees(
                      plan_id,
                      kpi.kpi_template.kpi_template_id,
                      target_kpi_of_dept.dept.dept_id,
                    );
                  target_kpi_of_employees.map((item) => {
                    if (item.ninth_monthly_target)
                      monthly_target_of_employees.push(
                        item.ninth_monthly_target,
                      );
                  });
                  const targets = monthly_target_of_employees.map(
                    (item) => item.target,
                  );
                  const actuals = monthly_target_of_employees.map((item) =>
                    !item.actual ||
                    item.actual.approve !== ApproveRegistration.Accepted
                      ? 0
                      : item.actual.value,
                  );
                  const target = this.aggregateNumbers(
                    targets,
                    Aggregation.Sum,
                  );
                  const actual = this.aggregateNumbers(
                    actuals,
                    Aggregation.Sum,
                  );
                  if (target !== undefined) {
                    monthly_target_of_depts.push(target);
                    monthly_actual_of_depts.push(actual);
                  }
                }
                break;
              case 10:
                for (const target_kpi_of_dept of target_kpi_of_depts) {
                  const monthly_target_of_employees = [];
                  const target_kpi_of_employees =
                    await this.getTargetKpiOfEmployees(
                      plan_id,
                      kpi.kpi_template.kpi_template_id,
                      target_kpi_of_dept.dept.dept_id,
                    );
                  target_kpi_of_employees.map((item) => {
                    if (item.tenth_monthly_target)
                      monthly_target_of_employees.push(
                        item.tenth_monthly_target,
                      );
                  });
                  const targets = monthly_target_of_employees.map(
                    (item) => item.target,
                  );
                  const actuals = monthly_target_of_employees.map((item) =>
                    !item.actual ||
                    item.actual.approve !== ApproveRegistration.Accepted
                      ? 0
                      : item.actual.value,
                  );
                  const target = this.aggregateNumbers(
                    targets,
                    Aggregation.Sum,
                  );
                  const actual = this.aggregateNumbers(
                    actuals,
                    Aggregation.Sum,
                  );
                  if (target !== undefined) {
                    monthly_target_of_depts.push(target);
                    monthly_actual_of_depts.push(actual);
                  }
                }
                break;
              case 11:
                for (const target_kpi_of_dept of target_kpi_of_depts) {
                  const monthly_target_of_employees = [];
                  const target_kpi_of_employees =
                    await this.getTargetKpiOfEmployees(
                      plan_id,
                      kpi.kpi_template.kpi_template_id,
                      target_kpi_of_dept.dept.dept_id,
                    );
                  target_kpi_of_employees.map((item) => {
                    if (item.eleventh_monthly_target)
                      monthly_target_of_employees.push(
                        item.eleventh_monthly_target,
                      );
                  });
                  const targets = monthly_target_of_employees.map(
                    (item) => item.target,
                  );
                  const actuals = monthly_target_of_employees.map((item) =>
                    !item.actual ||
                    item.actual.approve !== ApproveRegistration.Accepted
                      ? 0
                      : item.actual.value,
                  );
                  const target = this.aggregateNumbers(
                    targets,
                    Aggregation.Sum,
                  );
                  const actual = this.aggregateNumbers(
                    actuals,
                    Aggregation.Sum,
                  );
                  if (target !== undefined) {
                    monthly_target_of_depts.push(target);
                    monthly_actual_of_depts.push(actual);
                  }
                }
                break;
              case 12:
                for (const target_kpi_of_dept of target_kpi_of_depts) {
                  const monthly_target_of_employees = [];
                  const target_kpi_of_employees =
                    await this.getTargetKpiOfEmployees(
                      plan_id,
                      kpi.kpi_template.kpi_template_id,
                      target_kpi_of_dept.dept.dept_id,
                    );
                  target_kpi_of_employees.map((item) => {
                    if (item.twelfth_monthly_target)
                      monthly_target_of_employees.push(
                        item.twelfth_monthly_target,
                      );
                  });
                  const targets = monthly_target_of_employees.map(
                    (item) => item.target,
                  );
                  const actuals = monthly_target_of_employees.map((item) =>
                    !item.actual ||
                    item.actual.approve !== ApproveRegistration.Accepted
                      ? 0
                      : item.actual.value,
                  );
                  const target = this.aggregateNumbers(
                    targets,
                    Aggregation.Sum,
                  );
                  const actual = this.aggregateNumbers(
                    actuals,
                    Aggregation.Sum,
                  );
                  if (target !== undefined) {
                    monthly_target_of_depts.push(target);
                    monthly_actual_of_depts.push(actual);
                  }
                }
                break;
              default:
                break;
            }
            const target = this.aggregateNumbers(
              monthly_target_of_depts,
              Aggregation.Sum,
            );

            const actual = this.aggregateNumbers(
              monthly_actual_of_depts,
              Aggregation.Sum,
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

          const targets = [];

          if (JSON.stringify(months) == JSON.stringify([1, 2, 3])) {
            for (const target_kpi_of_dept of target_kpi_of_depts) {
              if (target_kpi_of_dept.first_quarterly_target)
                targets.push(target_kpi_of_dept.first_quarterly_target.target);
            }
          }
          if (JSON.stringify(months) == JSON.stringify([4, 5, 6])) {
            for (const target_kpi_of_dept of target_kpi_of_depts) {
              if (target_kpi_of_dept.second_quarterly_target)
                targets.push(target_kpi_of_dept.second_quarterly_target.target);
            }
          }
          if (JSON.stringify(months) == JSON.stringify([7, 8, 9])) {
            for (const target_kpi_of_dept of target_kpi_of_depts) {
              if (target_kpi_of_dept.third_quarterly_target)
                targets.push(target_kpi_of_dept.third_quarterly_target.target);
            }
          }
          if (JSON.stringify(months) == JSON.stringify([10, 11, 12])) {
            for (const target_kpi_of_dept of target_kpi_of_depts) {
              if (target_kpi_of_dept.fourth_quarterly_target)
                targets.push(target_kpi_of_dept.fourth_quarterly_target.target);
            }
          }
          if (months.length === 3)
            target = this.aggregateNumbers(
              targets,
              kpi.kpi_template.aggregation,
            );

          if (months.length === 12) {
            target = kpi.target ? kpi.target : undefined;
          }
          const resultOfKpi = this.resultOfKpi(
            target,
            actual,
            kpi.kpi_template.measures.items,
          );
          resultOfKpiCategory += (resultOfKpi * kpi.weight) / 100;
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
      order: {
        createdAt: 'DESC',
      },
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

  async approveDataQuarterlyTarget(
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
          if (!record.first_quarterly_target.actual) {
            throw new CustomBadRequestException(
              `Không tìm thấy số liệu quý một`,
            );
          }
          record.first_quarterly_target.actual.approve = approve;
          break;
        case 2:
          if (!record.second_quarterly_target.actual) {
            throw new CustomBadRequestException(
              `Không tìm thấy số liệu quý hai`,
            );
          }
          record.second_quarterly_target.actual.approve = approve;
          break;
        case 3:
          if (!record.third_quarterly_target.actual) {
            throw new CustomBadRequestException(
              `Không tìm thấy số liệu quý ba1`,
            );
          }
          record.third_quarterly_target.actual.approve = approve;
          break;
        case 4:
          if (!record.fourth_quarterly_target.actual) {
            throw new CustomBadRequestException(
              `Không tìm thấy số liệu quý bốn`,
            );
          }
          record.fourth_quarterly_target.actual.approve = approve;
          break;
        default:
          break;
      }

      await this.planKpiTemplateDeptsRepository.save(record);
      return { approve };
    }
    throw new CustomNotFoundException(`Không tìm thấy`);
  }

  async approveDataMonthlyTarget(
    plan_id: number,
    kpi_template_id: number,
    user_id: number,
    month: number,
    approve: ApproveRegistration,
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
      switch (month) {
        case 1:
          if (!record.first_monthly_target.actual) {
            throw new CustomBadRequestException(
              `Không tìm thấy số liệu tháng một`,
            );
          }
          record.first_monthly_target.actual.approve = approve;
          break;
        case 2:
          if (!record.second_monthly_target.actual) {
            throw new CustomBadRequestException(
              `Không tìm thấy số liệu tháng hai`,
            );
          }
          record.second_monthly_target.actual.approve = approve;
          break;
        case 3:
          if (!record.third_monthly_target.actual) {
            throw new CustomBadRequestException(
              `Không tìm thấy số liệu tháng ba`,
            );
          }
          record.third_monthly_target.actual.approve = approve;
          break;
        case 4:
          if (!record.fourth_monthly_target.actual) {
            throw new CustomBadRequestException(
              `Không tìm thấy số liệu tháng bốn`,
            );
          }
          record.fourth_monthly_target.actual.approve = approve;
          break;
        case 5:
          if (!record.fifth_monthly_target.actual) {
            throw new CustomBadRequestException(
              `Không tìm thấy số liệu tháng năm`,
            );
          }
          record.fifth_monthly_target.actual.approve = approve;
          break;
        case 6:
          if (!record.sixth_monthly_target.actual) {
            throw new CustomBadRequestException(
              `Không tìm thấy số liệu tháng sáu`,
            );
          }
          record.sixth_monthly_target.actual.approve = approve;
          break;
        case 7:
          if (!record.seventh_monthly_target.actual) {
            throw new CustomBadRequestException(
              `Không tìm thấy số liệu tháng bảy`,
            );
          }
          record.seventh_monthly_target.actual.approve = approve;
          break;
        case 8:
          if (!record.eighth_monthly_target.actual) {
            throw new CustomBadRequestException(
              `Không tìm thấy số liệu tháng tám`,
            );
          }
          record.eighth_monthly_target.actual.approve = approve;
          break;
        case 9:
          if (!record.ninth_monthly_target.actual) {
            throw new CustomBadRequestException(
              `Không tìm thấy số liệu tháng chín`,
            );
          }
          record.ninth_monthly_target.actual.approve = approve;
          break;
        case 10:
          if (!record.tenth_monthly_target.actual) {
            throw new CustomBadRequestException(
              `Không tìm thấy số liệu tháng mười`,
            );
          }
          record.tenth_monthly_target.actual.approve = approve;
          break;
        case 11:
          if (!record.eleventh_monthly_target.actual) {
            throw new CustomBadRequestException(
              `Không tìm thấy số liệu tháng mười một`,
            );
          }
          record.eleventh_monthly_target.actual.approve = approve;
          break;
        case 12:
          if (!record.twelfth_monthly_target.actual) {
            throw new CustomBadRequestException(
              `Không tìm thấy số liệu tháng mười hai`,
            );
          }
          record.twelfth_monthly_target.actual.approve = approve;
          break;
        default:
          break;
      }

      await this.planKpiTemplateUsersRepository.save(record);
      return { approve };
    }
    throw new CustomNotFoundException(`Không tìm thấy`);
  }

  async approveMonthlyTarget(
    plan_id: number,
    kpi_template_id: number,
    user_id: number,
    month: number,
    approve: ApproveRegistration,
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
      switch (month) {
        case 1:
          if (!record.first_monthly_target) {
            throw new CustomBadRequestException(
              `Không tìm thấy mục tiêu tháng một`,
            );
          }
          record.first_monthly_target.approve = approve;
          break;
        case 2:
          if (!record.second_monthly_target) {
            throw new CustomBadRequestException(
              `Không tìm thấy mục tiêu tháng hai`,
            );
          }
          record.second_monthly_target.approve = approve;
          break;
        case 3:
          if (!record.third_monthly_target) {
            throw new CustomBadRequestException(
              `Không tìm thấy mục tiêu tháng ba`,
            );
          }
          record.third_monthly_target.approve = approve;
          break;
        case 4:
          if (!record.fourth_monthly_target) {
            throw new CustomBadRequestException(
              `Không tìm thấy mục tiêu tháng bốn`,
            );
          }
          record.fourth_monthly_target.approve = approve;
          break;
        case 5:
          if (!record.fifth_monthly_target) {
            throw new CustomBadRequestException(
              `Không tìm thấy mục tiêu tháng năm`,
            );
          }
          record.fifth_monthly_target.approve = approve;
          break;
        case 6:
          if (!record.sixth_monthly_target) {
            throw new CustomBadRequestException(
              `Không tìm thấy mục tiêu tháng sáu`,
            );
          }
          record.sixth_monthly_target.approve = approve;
          break;
        case 7:
          if (!record.seventh_monthly_target) {
            throw new CustomBadRequestException(
              `Không tìm thấy mục tiêu tháng bảy`,
            );
          }
          record.seventh_monthly_target.approve = approve;
          break;
        case 8:
          if (!record.eighth_monthly_target) {
            throw new CustomBadRequestException(
              `Không tìm thấy mục tiêu tháng tám`,
            );
          }
          record.eighth_monthly_target.approve = approve;
          break;
        case 9:
          if (!record.ninth_monthly_target) {
            throw new CustomBadRequestException(
              `Không tìm thấy mục tiêu tháng chín`,
            );
          }
          record.ninth_monthly_target.approve = approve;
          break;
        case 10:
          if (!record.tenth_monthly_target) {
            throw new CustomBadRequestException(
              `Không tìm thấy mục tiêu tháng mười`,
            );
          }
          record.tenth_monthly_target.approve = approve;
          break;
        case 11:
          if (!record.eleventh_monthly_target) {
            throw new CustomBadRequestException(
              `Không tìm thấy mục tiêu tháng mười một`,
            );
          }
          record.eleventh_monthly_target.approve = approve;
          break;
        case 12:
          if (!record.twelfth_monthly_target) {
            throw new CustomBadRequestException(
              `Không tìm thấy mục tiêu tháng mười hai`,
            );
          }
          record.twelfth_monthly_target.approve = approve;
          break;
        default:
          break;
      }

      await this.planKpiTemplateUsersRepository.save(record);
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
}
