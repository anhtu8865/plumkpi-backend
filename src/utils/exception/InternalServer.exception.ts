import { InternalServerErrorException } from '@nestjs/common';

export class CustomInternalServerException extends InternalServerErrorException {
  constructor() {
    super(`Something went wrong`);
  }
}
