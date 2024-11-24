import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Participant } from './entities/participant.entity';
import { Repository } from 'typeorm';
import {
  CreateParticipantDto,
  UpdateParticipantDto,
} from './dto/participant.dto';
import { Event } from 'src/events/entities/event.entity';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,

    @InjectRepository(Event)
    private readonly evenRepository: Repository<Event>,
  ) {}

  async createParticipant(
    createParticipantDto: CreateParticipantDto,
  ): Promise<Participant> {
    const { eventId, email } = createParticipantDto;

    const event = await this.evenRepository.findOne({ where: { id: eventId } });

    if (!event) {
      throw new BadRequestException('Event not found');
    }

    const participantEvent = await this.participantRepository.findOne({
      where: {
        email,
        eventId,
      },
    });

    if (participantEvent) {
      throw new BadRequestException('Participant already added to this event');
    }

    const participant = this.participantRepository.create({
      ...createParticipantDto,
      event,
    });
    return await this.participantRepository.save(participant);
  }

  async getAllParticipants(): Promise<Participant[]> {
    return this.participantRepository.find();
  }

  async getParticipantByID(id: number): Promise<Participant> {
    const participant = await this.participantRepository.findOneBy({ id });

    if (participant) {
      return participant;
    }
    throw new NotFoundException('data not found');
  }

  async updateParticipantById(
    id: number,
    updateParticipantDto: UpdateParticipantDto,
  ): Promise<Participant> {
    const participantToUpdate = await this.participantRepository.findOneBy({
      id,
    });

    if (!participantToUpdate) {
      throw new NotFoundException('no record found to update');
    }
    try {
      const saveFilter = this.participantRepository.create({
        ...participantToUpdate,
        ...updateParticipantDto,
      });
      return await this.participantRepository.save(saveFilter);
    } catch (error) {
      console.log(error);
      throw new Error('Error while updating');
    }
  }

  async deleteParticipantById(id: number): Promise<Participant> {
    const participant = await this.participantRepository.findOneBy({ id });

    if (!participant) {
      throw new NotFoundException('no record found to delete');
    }
    const deletedParticipant = await this.participantRepository.delete(id);

    if (deletedParticipant.affected !== 1) {
      throw new InternalServerErrorException('Failed to delete');
    }
    return participant;
  }
}
