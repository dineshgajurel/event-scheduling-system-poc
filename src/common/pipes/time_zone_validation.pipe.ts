import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { IANAZone } from 'luxon';
import { CreateEventDto } from 'src/events/dto/event.dto';

@Injectable()
export class TimezoneValidationPipe implements PipeTransform {
  transform(createEventInput: CreateEventDto) {
    if (!IANAZone.isValidZone(createEventInput.timeZone)) {
      throw new BadRequestException(
        `Invalid timezone: ${createEventInput.timeZone}`,
      );
    }

    return createEventInput;
  }
}
