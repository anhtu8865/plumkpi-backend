import { IsNumberString } from 'class-validator';

class FindOneParams {
  @IsNumberString({}, { message: 'id phải là số' })
  id: string;
}

export default FindOneParams;
