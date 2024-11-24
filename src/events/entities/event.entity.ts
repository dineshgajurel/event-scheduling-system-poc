import { DateAuditBaseEntity } from 'src/common/entities/date_audit_base.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  AfterLoad,
} from 'typeorm';
import { User } from './user.entity';
import { Participant } from 'src/participants/entities/participant.entity';
import { DateTime } from 'luxon';

@Entity('events')
export class Event extends DateAuditBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  title: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamptz' })
  endTime: Date;

  @Column({ name: 'time_zone', length: 50 })
  timeZone: string;

  @Column({ nullable: true })
  location: string;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Participant, (participant) => participant.event)
  participants: Participant[];

  localStartTime?: string;

  localEndTime?: string;

  @AfterLoad()
  transformTime?() {
    if (this.timeZone && this.startTime && this.endTime) {
      this.localStartTime = DateTime.fromJSDate(this.startTime)
        .setZone(this.timeZone)
        .toISO();
      this.localEndTime = DateTime.fromJSDate(this.endTime)
        .setZone(this.timeZone)
        .toISO();
    }
  }
}
