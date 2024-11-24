import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class UserIdValidationPipe implements PipeTransform {
  transform(value: any) {
    if (!value) {
      throw new BadRequestException('User ID is required');
    }
    const userId = Number(value);

    if (isNaN(userId)) {
      throw new BadRequestException('User ID must be a valid number');
    }

    return userId;
  }
}
