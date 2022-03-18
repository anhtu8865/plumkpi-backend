import ApproveRegistration from '../approveRegistration.enum';

export interface RegisterTarget {
  target: number;
  approve: ApproveRegistration;
  actual: Actual;
}

export interface Actual {
  value: number;
  approve: ApproveRegistration;
  note: string;
  images: number[];
}
