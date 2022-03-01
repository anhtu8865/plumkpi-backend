import { IsNotEmpty, IsNumberString } from 'class-validator';

export default class DeletePersonalKpiParams {
  @IsNumberString()
  @IsNotEmpty()
  plan_id: string;

  @IsNumberString()
  @IsNotEmpty()
  kpi_template_id: string;
}
