import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Recurrence } from 'src/common/enums/event.enum';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 150)
  title: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  timeZone: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(Recurrence)
  @IsNotEmpty()
  recurrence?: Recurrence;
}

export class UpdateEventDto extends PartialType(
  OmitType(CreateEventDto, ['startTime', 'endTime', 'timeZone', 'recurrence']),
) {}

export class TransformedEventDto extends CreateEventDto {
  startTimeLocal?: string;
  endTimeLocal?: string;
  startTimeUTC?: string;
  endTimeUTC?: string;
}
