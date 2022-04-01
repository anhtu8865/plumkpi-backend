export interface Properties {
  kpis: number[];
  months: number[];
  filters: Filter[];
  view: ViewType;
  chartType: ChartType;
}

export interface Filter {
  dept_id: number;
  user_ids: number[];
}

export enum ViewType {
  Month = 'Tháng',
  Quarter = 'Quý',
  Year = 'Năm',
  Department = 'Phòng ban',
  Employee = 'Nhân viên',
}

export enum ChartType {
  Area = 'Vùng',
  Line = 'Đường',
  Column = 'Cột',
  Bar = 'Thanh',
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
