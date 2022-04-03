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
  Chart = 'Biểu đồ',
  Report = 'Báo cáo',
}
