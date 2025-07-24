// src/ormconfig.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

const ormdbconfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST?.trim(),
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER?.trim(),
  password: process.env.DB_PASSWORD?.trim(),
  database: process.env.DB_NAME?.trim(),
  entities: [User],
  synchronize: true,
};

export default ormdbconfig;
