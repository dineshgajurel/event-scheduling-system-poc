import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { DateValidationPipe } from 'src/common/pipes/date_validation.pipe';
// import { UserId } from 'src/common/decorators/user-id.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventService: EventsService) {}

  @Post()
  @UsePipes(DateValidationPipe)
  async create(
    @Headers('user-id') userId: number,
    @Body() createEventDto: CreateEventDto,
  ) {
    const event = await this.eventService.createEvent(createEventDto, userId);

    // console.log(createEventDto);

    if (event) {
      return {
        message: 'Event Created Successfully',
        data: event,
      };
    }
    return event;
  }

  @Get()
  async getAllEventsByUser(@Headers('user-id') userId: number) {
    const events = await this.eventService.getAllEventsByUser(userId);
    if (events) {
      return {
        message: 'Event created by user fetched Successfully',
        data: events,
      };
    }
  }

  @Get(':id')
  async findOne(
    @Headers('user-id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const event = await this.eventService.getEventById(userId, id);
    if (event) {
      return {
        message: 'Event found',
        data: event,
      };
    }
  }

  @Patch(':id')
  async update(
    @Headers('user-id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const event = await this.eventService.updateEventById(
      userId,
      id,
      updateEventDto,
    );
    if (event) {
      return {
        message: 'Event updated successfully',
        data: event,
      };
    }
  }

  @Delete(':id')
  async remove(
    @Headers('user-id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const event = await this.eventService.deleteEventById(userId, id);
    if (event) {
      return {
        message: 'Event deleted successfully',
        data: event,
      };
    }
  }
}
