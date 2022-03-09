import { InternalServerErrorException } from '@nestjs/common';

export class CustomInternalServerException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
  }
}
