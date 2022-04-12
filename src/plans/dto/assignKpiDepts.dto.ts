import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

export class DeptsDto {
  @IsNumber()
  @IsNotEmpty()
  dept_id: number;

  @IsNumber()
  @IsNotEmpty()
  target: number;
}

export class AssignKpiDeptsDto {
  @IsNumber()
  @IsNotEmpty()
  plan_id: number;

  @IsNumber()
  @IsNotEmpty()
  kpi_template_id: number;

  @IsNotEmpty({
    message: 'Vui lòng chọn thời điểm nhận kết quả đăng kí kpi quý 1',
  })
  first_quarterly_register_day: string;

  @IsNotEmpty({
    message: 'Vui lòng chọn thời điểm nhận kết quả đăng kí kpi quý 2',
  })
  second_quarterly_register_day: string;

  @IsNotEmpty({
    message: 'Vui lòng chọn thời điểm nhận kết quả đăng kí kpi quý 3',
  })
  third_quarterly_register_day: string;

  @IsNotEmpty({
    message: 'Vui lòng chọn thời điểm nhận kết quả đăng kí kpi quý 4',
  })
  fourth_quarterly_register_day: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeptsDto)
  depts: DeptsDto[];
}
