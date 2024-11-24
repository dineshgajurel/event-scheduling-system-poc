import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import {
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { TransformedEventDto, UpdateEventDto } from './dto/event.dto';
import { User } from './entities/user.entity';
import eventConfig from './config/event.config';
import { ConfigType } from '@nestjs/config';
import { DateTime } from 'luxon';
import { Recurrence } from 'src/common/enums/event.enum';
import { UserService } from './user.service';
import { FREE_EVENT_LIMIT_EXCEEDED } from './config/constant';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @Inject(eventConfig.KEY)
    private readonly eventConfiguration: ConfigType<typeof eventConfig>,

    private readonly userService: UserService,
  ) {}

  async createEvent(
    createEventDto: TransformedEventDto,
    userId: number,
  ): Promise<Event | Event[]> {
    const user = await this.userService.getUserById(userId);

    const { recurrence } = createEventDto;
    if (recurrence !== Recurrence.NONE) {
      return this._handleRecurringEvents(recurrence, createEventDto, user);
    }

    return this._handleSingleEvent(createEventDto, user);
  }

  private async _handleSingleEvent(
    createEventDto: TransformedEventDto,
    user: User,
  ) {
    await this._validateEventLimit(createEventDto, user);
    await this._validateEventOverlap(createEventDto, user);

    const event = this.eventRepository.create({
      ...createEventDto,
      startTime: createEventDto.startTimeUTC,
      endTime: createEventDto.endTimeUTC,
      user,
    });

    return await this.eventRepository.save(event);
  }

  private async _handleRecurringEvents(
    reccurance: Recurrence,
    createEventDto: TransformedEventDto,
    user: User,
  ): Promise<Event[]> {
    const recurringEvents = this._generateRecurringEvents(
      createEventDto,
      reccurance,
    );

    for (const eventDto of recurringEvents) {
      await this._validateEventLimit(eventDto, user, recurringEvents);
      await this._validateEventOverlap(eventDto, user);
    }

    const eventsToSave = recurringEvents.map((eventDto) =>
      this.eventRepository.create({
        ...eventDto,
        startTime: eventDto.startTimeUTC,
        endTime: eventDto.endTimeUTC,
        user,
      }),
    );

    const createdEvents = await this.eventRepository.save(eventsToSave);
    return createdEvents;
  }

  private async _validateEventLimit(
    createEventDto: TransformedEventDto,
    user: User,
    recurringEvents: TransformedEventDto[] = [],
  ): Promise<void> {
    const { subscription: userSubscription, country: userCountry } = user;

    const { startTimeUTC, endTimeUTC } = { ...createEventDto };

    if (
      userSubscription ||
      !this.eventConfiguration.limitApplyCountries.includes(userCountry)
    ) {
      return;
    }

    const limitApplyPerWeek = this.eventConfiguration.limitApplyPerWeek;

    const newEventStart = DateTime.fromISO(startTimeUTC);
    const newEventEnd = DateTime.fromISO(endTimeUTC);

    const startOfWeek = newEventStart.startOf('week').toUTC().toJSDate();
    const endOfWeek = newEventEnd.endOf('week').toUTC().toJSDate();

    // console.log(newEventStart, newEventEnd, startOfWeek, endOfWeek);

    const existingEventCountsInThisWeek = await this.eventRepository.find({
      where: {
        userId: user.id,
        startTime: LessThanOrEqual(endOfWeek), // Event starts before or during the week
        endTime: MoreThanOrEqual(startOfWeek), // Event ends after or during the week
      },
    });

    // console.log('exsing', existingEventCountsInThisWeek);

    if (
      recurringEvents.length == 0 &&
      existingEventCountsInThisWeek.length >= limitApplyPerWeek
    ) {
      throw new BadRequestException(FREE_EVENT_LIMIT_EXCEEDED(userCountry));
    }

    const newRecurringEventCountInThisWeek = recurringEvents.filter(
      (eventDto) => {
        const eventStart = DateTime.fromISO(eventDto.startTimeUTC).toUTC();
        const eventEnd = DateTime.fromISO(eventDto.endTimeUTC).toUTC();
        return (
          eventStart <= DateTime.fromJSDate(endOfWeek).toUTC() &&
          eventEnd >= DateTime.fromJSDate(startOfWeek).toUTC()
        );
      },
    ).length;

    // console.log('new recuur', newRecurringEventCountInThisWeek);

    const totalEventCountInthisWeek =
      existingEventCountsInThisWeek.length + newRecurringEventCountInThisWeek;

    if (totalEventCountInthisWeek > limitApplyPerWeek) {
      throw new BadRequestException(FREE_EVENT_LIMIT_EXCEEDED(userCountry));
    }
  }

  private async _validateEventOverlap(
    createEventDto: TransformedEventDto,
    user: User,
  ): Promise<void> {
    const { startTimeUTC, endTimeUTC } = createEventDto;

    const startDateJS = DateTime.fromISO(startTimeUTC).toJSDate();
    const endDateJS = DateTime.fromISO(endTimeUTC).toJSDate();

    // const overlappingEvent = await this.eventRepository.findOne({
    //   where: [
    //     {
    //       userId: user.id,
    //       startTime: Between(startDateJS, endDateJS),
    //       endTime: Between(startDateJS, endDateJS),
    //     },
    //     {
    //       userId: user.id,
    //       startTime: LessThan(endDateJS),
    //       endTime: MoreThan(startDateJS),
    //     },
    //   ],
    // });

    const overlappingEvent = await this.eventRepository.findOne({
      where: {
        userId: user.id,
        // Check if the new event overlaps with an existing event
        startTime: LessThan(endDateJS), // Check if the existing event starts before the new event ends
        endTime: MoreThan(startDateJS), // Check if the existing event ends after the new event starts
      },
    });

    if (overlappingEvent) {
      throw new BadRequestException(
        `Event overlaps with another event, title: "${overlappingEvent.title}, id: ${overlappingEvent.id}"`,
      );
    }
  }

  private _generateRecurringEvents(
    createEventDto: TransformedEventDto,
    reccurance: Recurrence,
  ): TransformedEventDto[] {
    const events: TransformedEventDto[] = [];

    if (reccurance == 'once') {
      events.push(createEventDto);
      return events;
    }

    const {
      startTime,
      startTimeLocal,
      startTimeUTC,
      endTime,
      endTimeLocal,
      endTimeUTC,
    } = createEventDto;

    const currentTimes = {
      start: DateTime.fromISO(startTime),
      end: DateTime.fromISO(endTime),
      startLocal: DateTime.fromISO(startTimeLocal),
      endLocal: DateTime.fromISO(endTimeLocal),
      startUTC: DateTime.fromISO(startTimeUTC).toUTC(),
      endUTC: DateTime.fromISO(endTimeUTC).toUTC(),
    };

    const maxReccurance = this.eventConfiguration.maxReccurance;

    for (let i = 0; i < maxReccurance; i++) {
      const newEvent: TransformedEventDto = {
        ...createEventDto,
        startTime: currentTimes.start.toISO(),
        endTime: currentTimes.end.toISO(),
        startTimeLocal: currentTimes.startLocal.toISO(),
        endTimeLocal: currentTimes.endLocal.toISO(),
        startTimeUTC: currentTimes.startUTC.toISO(),
        endTimeUTC: currentTimes.endUTC.toISO(),
      };

      events.push(newEvent);

      const increment =
        reccurance === Recurrence.DAILY ? { days: 1 } : { weeks: 1 };

      currentTimes.start = currentTimes.start.plus(increment);
      currentTimes.end = currentTimes.end.plus(increment);
      currentTimes.startLocal = currentTimes.startLocal.plus(increment);
      currentTimes.endLocal = currentTimes.endLocal.plus(increment);
      currentTimes.startUTC = currentTimes.startUTC.plus(increment);
      currentTimes.endUTC = currentTimes.endUTC.plus(increment);
    }

    return events;
  }

  async getAllEventsByUser(userId: number): Promise<Event[]> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return this.eventRepository.find({ where: { userId } });
  }

  async getEventById(userId: number, id: number): Promise<Event> {
    const event = await this.eventRepository.findOneBy({ id });

    if (!event) {
      throw new NotFoundException('data not found');
    }

    if (userId != event.userId) {
      throw new BadRequestException('Not allowed to view event');
    }

    return event;
  }

  async updateEventById(
    userId: number,
    id: number,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    const eventToUpdate = await this.eventRepository.findOneBy({
      id,
    });

    if (!eventToUpdate) {
      throw new NotFoundException('no record found to update');
    }

    if (userId != eventToUpdate?.userId) {
      throw new BadRequestException('Not allowed to update event');
    }

    try {
      const event = this.eventRepository.create({
        ...eventToUpdate,
        ...updateEventDto,
      });
      return await this.eventRepository.save(event);
    } catch (error) {
      console.log(error);
      throw new Error('Error while updating');
    }
  }

  async deleteEventById(userId: number, id: number): Promise<Event> {
    const event = await this.eventRepository.findOneBy({ id });

    if (!event) {
      throw new NotFoundException('no record found to delete');
    }

    if (userId != event.userId) {
      throw new BadRequestException('Not allowed to delete event');
    }

    const deletedEvent = await this.eventRepository.delete(id);

    if (deletedEvent.affected !== 1) {
      throw new InternalServerErrorException('Failed to delete');
    }
    return event;
  }
}
