import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Max,
  IsEnum,
  IsEmail,
} from 'class-validator';
import { RsvpStatus } from 'src/common/enums/participant.enum';

export class CreateParticipantDto {
  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(RsvpStatus)
  @IsNotEmpty()
  rsvpStatus: RsvpStatus;

  @IsString()
  @IsOptional()
  @Max(255)
  remarks?: string;
}

export class UpdateParticipantDto extends PartialType(
  OmitType(CreateParticipantDto, ['email', 'eventId']),
) {}
