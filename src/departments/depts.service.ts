import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import CreateDeptDto from './dto/createDept.dto';
import Dept from './dept.interface';
import UpdateDeptDto from './dto/updateDept.dto';

@Injectable()
export default class DeptsService {
  private lastDeptId = 0;
  private depts: Dept[] = [];

  getAllDepts() {
    return this.depts;
  }

  getDeptById(id: number) {
    const dept = this.depts.find((dept) => dept.id === id);
    if (dept) {
      return dept;
    }
    throw new HttpException('Dept not found', HttpStatus.NOT_FOUND);
  }

  replaceDept(id: number, dept: UpdateDeptDto) {
    const deptIndex = this.depts.findIndex((dept) => dept.id === id);
    if (deptIndex > -1) {
      this.depts[deptIndex] = dept;
      return dept;
    }
    throw new HttpException('Dept not found', HttpStatus.NOT_FOUND);
  }

  createDept(dept: CreateDeptDto) {
    const newDept = {
      id: ++this.lastDeptId,
      ...dept,
    };
    this.depts.push(newDept);
    return newDept;
  }

  deleteDept(id: number) {
    const deptIndex = this.depts.findIndex((dept) => dept.id === id);
    if (deptIndex > -1) {
      this.depts.splice(deptIndex, 1);
    } else {
      throw new HttpException('Dept not found', HttpStatus.NOT_FOUND);
    }
  }
}
