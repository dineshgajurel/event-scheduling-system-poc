import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import {
  CreateParticipantDto,
  UpdateParticipantDto,
} from './dto/participant.dto';

@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantService: ParticipantsService) {}

  @Post()
  async create(@Body() createParticipanttDto: CreateParticipantDto) {
    const participant = await this.participantService.createParticipant(
      createParticipanttDto,
    );
    if (participant) {
      return {
        message: 'Participant Created Successfully',
        data: participant,
      };
    }
  }

  @Get()
  async findAll() {
    const participants = await this.participantService.getAllParticipants();
    if (participants) {
      return {
        message: 'Participants fetched Successfully',
        data: participants,
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const participant = await this.participantService.getParticipantByID(id);
    if (participant) {
      return {
        message: 'Participant found',
        data: participant,
      };
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateParticipantDto: UpdateParticipantDto,
  ) {
    const participant = await this.participantService.updateParticipantById(
      id,
      updateParticipantDto,
    );
    if (participant) {
      return {
        message: 'Participant updated successfully',
        data: participant,
      };
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const participant = await this.participantService.deleteParticipantById(id);
    if (participant) {
      return {
        message: 'Participant deleted successfully',
        data: participant,
      };
    }
  }
}
