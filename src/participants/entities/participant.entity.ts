import { DateAuditBaseEntity } from 'src/common/entities/date_audit_base.entity';
import { RsvpStatus } from 'src/common/enums/participant.enum';
import { Event } from 'src/events/entities/event.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity('participants')
@Unique(['event', 'email'])
export class Participant extends DateAuditBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event_id' })
  eventId: number;

  @ManyToOne(() => Event, (event) => event.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({
    name: 'rsvp_status',
    enum: RsvpStatus,
    default: RsvpStatus.PENDING,
  })
  rsvpStatus: RsvpStatus;
}
