import { Body, Headers, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/schemas/user.schemas';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosHeaders, AxiosResponse } from 'axios';
import { Observable, identity } from 'rxjs';
import { TokenExchangeDto } from './dto/token-exchange.dto';
import { CustomIdAuthDto } from './dto/custom-id-auth.dto';
import { RouterModule } from '@nestjs/core';
import { ServerManager } from 'src/server/server.manager';

@Injectable()
export class AuthService {
    constructor(private userService: UsersService,
                private jwtService: JwtService,
    ) {}
    async otherValidateUser(userId:string)
    {
        return await this.userService.findUserByIdOrName(userId);
    }
    async validateUser(username: string, password: string): Promise<User>
    {
        const user: User = await this.userService.findUser(username)

        if(!user)
            {
                throw new UnauthorizedException("user not exists!")
            }

        const passwordValid = await bcrypt.compare(password, user.password)
        if(!passwordValid)
            {
                throw new UnauthorizedException("wrong password!")
            }    
        return user
    }
    async signIn(user: User): Promise<any>{
        const payload = {id:user._id, username:user.username, ingameName:user.name, rankpoint:user.rankpoints, role: 'client'}
        const access_token = this.jwtService.sign(payload,{secret:process.env.SECRET_KEY})
        return {
            access_token,
            payload,
        };   
    }
    async serverSignIn(id:string): Promise<any>
    {
      const payload = {id, role: 'server'}
      const access_token = this.jwtService.sign(payload,{secret:process.env.SECRET_KEY})
      console.log("server signin with id: " + {id});
      return{
          access_token,
          payload
      };
    }
    async signUp(createUserDto:CreateUserDto): Promise<any>
    {
        const user = await this.userService.findUser(createUserDto.username)
        const userWithName = await this.userService.findName(createUserDto.name)
        if(user)
            {
                throw new UnauthorizedException("user exists!")
            }
        if(userWithName)
            {
                throw new UnauthorizedException("name have been chosen, please use other name!")
            }
        const createUser = await this.userService.createUser(createUserDto);
        return this.signIn(createUser)
    }
    async exchangeToken(): Promise<string>
    {
        const projectId = process.env.Project_ID;
        const environmentId = process.env.ENV_UNITY_ID;
        const serviceAccountKeyId = process.env.KEY_ID_UNITY;
        const secretKey = process.env.SECRET_KEY_UNITY;
        const url = `https://services.api.unity.com/auth/v1/token-exchange?projectId=${projectId}&environmentId=${environmentId}`;

        try {
          const response = await axios.post(
            url,
            {},
            {
              headers: {
                'Authorization': `Basic ${Buffer.from(`${serviceAccountKeyId}:${secretKey}`).toString('base64')}`,
              },
            },
          );
    
          if (response.data) {
            return response.data.accessToken;
          } else {
            throw new InternalServerErrorException('Token exchange failed');
          }
        } catch (error) {
          throw new InternalServerErrorException('An error occurred during token exchange');
        }
    }
    async authenticateWithCustomId(statelessToken: string, customIdAuthDto: CustomIdAuthDto): Promise<any> {
        const { externalId, signInOnly } = customIdAuthDto;
        const projectId = process.env.Project_ID;
        const url = `https://player-auth.services.api.unity.com/v1/projects/${projectId}/authentication/server/custom-id`;
    
        try {
          const response = await axios.post(
            url,
            {
              externalId : externalId,
              signInOnly : signInOnly,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${statelessToken}`,
              },
              
            },
          );
        if(response.data)
            {
                return response.data;
            }
          else
          {
            {
                throw new InternalServerErrorException('Token exchange failed');
              }
          }
        } catch (error) {
            throw new InternalServerErrorException('An error occurred during custom ID authentication');
        }}
}

