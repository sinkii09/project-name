import { Body, Controller, Post, UseGuards, Request, UnauthorizedException, InternalServerErrorException, Param, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { SkipAuth } from './auth.decorator';
import { LocalAuthGuard } from './local-auth.guard';
import axios from 'axios';
import { response } from 'express';
import { CustomIdAuthDto } from './dto/custom-id-auth.dto';

@SkipAuth()
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}
    @Post('serverSignIn/:serverId')
    async serverSignIn(@Param('serverId') id:string):Promise<any>{
      return await this.authService.serverSignIn(id);
    }
    
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
      return this.authService.signIn(req.user);
    }

    @Post("register")
    async SignUp(@Body() CreateUserDto: CreateUserDto): Promise<any>{
            return await this.authService.signUp(CreateUserDto);
    }
    @Post('exchange-token')
    async exchangeToken()
    {
      try {
        const token = await this.authService.exchangeToken();
        return { statelessToken: token };
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
    }

    @Post('authenticate-custom-id')
    async authenticateWithCustomId(
    @Body() customIdAuthDto: CustomIdAuthDto) {
    try {
      const statelessToken = await this.authService.exchangeToken();
      const authResponse = await this.authService.authenticateWithCustomId(statelessToken, customIdAuthDto);
      return authResponse;
    } catch (error) {
      console.error('Error during custom ID authentication:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

}
