import Comparison from '../comparison.enum';

export interface Measures {
  items: Measure[];
}

export interface Measure {
  comparison: Comparison;
  percentOfTarget: number;
  percentOfKpi: number;
}
