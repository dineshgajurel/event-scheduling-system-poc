import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { IANAZone } from 'luxon';
import { CreateEventDto, TransformedEventDto } from 'src/events/dto/event.dto';

@Injectable()
export class DateValidationPipe implements PipeTransform {
  transform(createEventInput: CreateEventDto): TransformedEventDto {
    const { startTime, endTime, timeZone } = createEventInput;

    if (!IANAZone.isValidZone(timeZone)) {
      throw new BadRequestException(`Invalid timezone: ${timeZone}`);
    }

    const startDateLocal = DateTime.fromISO(startTime, { zone: timeZone });
    const endDateLocal = DateTime.fromISO(endTime, { zone: timeZone });

    if (!startDateLocal.isValid || !endDateLocal.isValid) {
      throw new BadRequestException('Invalid start_time or end_time format.');
    }

    const startDateUTC = startDateLocal.toUTC();
    const endDateUTC = endDateLocal.toUTC();

    if (endDateUTC <= startDateUTC) {
      throw new BadRequestException('End time must be after start time.');
    }

    return {
      ...createEventInput,
      startTimeLocal: startDateLocal.toISO(),
      endTimeLocal: endDateLocal.toISO(),
      startTimeUTC: startDateUTC.toISO(),
      endTimeUTC: endDateUTC.toISO(),
    };
  }
}
