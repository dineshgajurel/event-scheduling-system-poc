import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'event_scheduling_system',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: false, // Use false in production!
  migrations: [path.join(__dirname, '../../db/migrations/', '*.{ts,js}')],
};

export const configure = new DataSource(
  typeOrmConfig as PostgresConnectionOptions,
);
