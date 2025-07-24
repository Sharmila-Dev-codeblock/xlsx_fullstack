import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './users/user.module';
import ormdbconfig from './ormdbconfig';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    TypeOrmModule.forRoot(ormdbconfig),
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
