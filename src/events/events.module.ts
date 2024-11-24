import { MiddlewareConsumer, Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import eventConfig from './config/event.config';
import { UserIdMiddleware } from 'src/middlewares/user-id.middleware';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, User]),
    ConfigModule.forFeature(eventConfig),
  ],
  providers: [EventsService, UserService],
  controllers: [EventsController],
})
export class EventsModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(AuthMiddleware).forRoutes('*');
    consumer.apply(UserIdMiddleware).forRoutes(EventsController);
  }
}
