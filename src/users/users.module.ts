import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import {MongooseModule} from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schemas';
import { UsersController } from './users.controller';
import { AuthService } from 'src/auth/auth.service';
import { HttpModule, HttpService } from '@nestjs/axios';
@Module({
  imports: [HttpModule,MongooseModule.forFeature([{name: User.name,schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService,AuthService],
  exports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),UsersService],
})
export class UsersModule {}
