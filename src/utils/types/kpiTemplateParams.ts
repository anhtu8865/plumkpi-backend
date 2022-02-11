import Role from 'src/users/role.enum';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class KpiTemplateParams {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => String)
  @IsString()
  kpi_template_name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  kpi_category?: number;
}
