import { Controller,Request ,Get, UseGuards, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { SkipAuth } from './auth/auth.decorator';

@Controller()
export class AppController {
  @SkipAuth()
  @Get()
  getHello(): string {
    return 'Hello World!';
  }
}
