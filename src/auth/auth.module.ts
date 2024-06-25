import { Inject, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schemas';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports:[
    UsersModule,
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    MongooseModule.forFeature([{name: User.name, schema:UserSchema}]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1d' }
    })
  ],
  providers: [AuthService,LocalStrategy,JwtModule],
  controllers: [AuthController],
  exports:[AuthService, JwtModule]
})
export class AuthModule {}
