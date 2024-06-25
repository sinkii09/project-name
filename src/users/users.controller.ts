import { Body, Controller, Param, Patch, Put, UseGuards,Request, Get, Post, UnauthorizedException, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schemas';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { SkipAuth } from 'src/auth/auth.decorator';
import { UpdateUserRankDto } from './dto/update-rank.dto';
import { JwtService } from '@nestjs/jwt';


@Controller('users')
export class UsersController {
    constructor(private readonly userService:UsersService,
                private readonly jwtService: JwtService
    ){}

    // @UseGuards(JwtAuthGuard)
    // @Put(':id')
    // async update(@Param('id') id:string, @Body() user:User):Promise<User>
    // {
    //     return await this.userService.updateUser(id,user);
    // }
    @UseGuards(JwtAuthGuard)
    @Patch('update-rank-server')
    async updateUserRank(@Request() req,@Body() updateUserDto: UpdateUserRankDto): Promise<User>
    {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7, authHeader.length);
        const payload = await this.jwtService.verify(token,{ secret : process.env.SECRET_KEY});
        
        if(payload.role != 'server')
            {
                throw new UnauthorizedException();
            }
        }
        else
        {
            throw new UnauthorizedException();
        }
        return this.userService.updateUserRank(updateUserDto);
    }
    @UseGuards(JwtAuthGuard)
    @Get('get-user-server/:userInput')
    async getProfileServer(@Req() req, @Param('userInput') userId: string)
    {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7, authHeader.length);
        const payload = await this.jwtService.verify(token,{ secret : process.env.SECRET_KEY});
        
        if(payload.role != 'server')
            {
                throw new UnauthorizedException();
            } 
        }
        else
        {
            throw new UnauthorizedException();
        }
        const user = await this.userService.findUserByIdOrName(userId);   
        if(user)
            {
                const payload = {userId:user._id, rating:user.rating, rankpoints : user.rankpoints};
                return payload;
            }
            throw new UnauthorizedException();
    }

    @UseGuards(JwtAuthGuard)
    @Patch('updateUser')
    async updateUserNameOrPassword(@Req() req, @Body() updateUserDto: UpdateUserDto)
    {
        const id = req.user._id;

        return await this.userService.updateUser(id,updateUserDto);
    }
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
      return this.userService.findUserByIdOrName(req.user._id);
    }
    @UseGuards(JwtAuthGuard)
    @Get(':userInput')
    async FindUserWithNameOrId(@Param('userInput') userInput: string)
    {
        const user = await this.userService.findUserByIdOrName(userInput);
        if(user)
            {
                const payload = {id:user._id, ingameName:user.name};
                return payload;
            }
            throw new UnauthorizedException();
    }
}
