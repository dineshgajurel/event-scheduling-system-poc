import { DateAuditBaseEntity } from 'src/common/entities/date_audit_base.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Event } from './event.entity';

@Entity('users')
export class User extends DateAuditBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150, unique: true })
  username: string;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 150 })
  country: string;

  @Column({ name: 'subscription', default: false })
  subscription: boolean;

  @OneToMany(() => Event, (event) => event.user)
  events: Event[];
}
