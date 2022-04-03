export enum DateType {
  Month = 'Tháng',
  Quarter = 'Quý',
  Year = 'Năm',
}

export interface Properties {
  chart_name: string;
  description: string;
  plan_id: number;
  kpis: number[];
  dateType: DateType;
  period: number[];
  separated: boolean;
}

export enum ChartType {
  Line = 'Đường',
  Column = 'Cột',
  Pie = 'Tròn',
  List = 'Danh sách', // * ViewType = null
  Gauge = 'Đo', // * ViewType = null, use color of measure of kpi
}

export interface ResultOfKpi {
  result: number;
  color: string;
}

export interface ASeries {
  kpi_template_id: number;
  kpi_template_name: string;
  unit: string;
  target: number;
  actual: number;
  resultOfKpi: ResultOfKpi;
}

export interface Point {
  label: string;
  series: ASeries[];
}
