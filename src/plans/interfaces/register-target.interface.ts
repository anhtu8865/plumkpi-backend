import PublicFile from 'src/files/publicFile.entity';
import ApproveRegistration from '../approveRegistration.enum';

export interface RegisterTarget {
  target: number;
  approve: ApproveRegistration;
  actual: Actual;
  resultDay: string;
}

export interface Actual {
  value: number;
  approve: ApproveRegistration;
  note: string;
  files: PublicFile[];
}
