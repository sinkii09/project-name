import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FriendService } from './friend.service';
import { FriendAcceptDto, FriendRequestDto } from './friend_request.dto';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendController {
    constructor(private readonly friendsService: FriendService) {}
    @Post('add')
    async addFriend(@Req() req, @Body() friendRequestDto: FriendRequestDto )
    {
        await this.friendsService.addFriend(req.user._id, friendRequestDto);
    }

    @Post('accept')
    async acceptFriend(@Req() req, @Body() friendAcceptDto: FriendAcceptDto) {

        await this.friendsService.acceptFriend(req.user._id, friendAcceptDto);
      }
    @Post('denied')
    async DeniedFriend(@Req() req, @Body() friendAcceptDto: FriendAcceptDto) {

        await this.friendsService.deniedRequest(req.user._id, friendAcceptDto);
      }
    @Post('delete')
    async DeleteFriend(@Req() req, @Body() friendAcceptDto: FriendAcceptDto) {

        await this.friendsService.deleteFriend(req.user._id, friendAcceptDto);
    }
    @Get('requests')
    async getFriendRequests(@Req() req) {
    const userId = req.user._id;
    return this.friendsService.getFriendRequests(userId);
    }
    @Get('friendList')
    async getFriendList(@Req() req) {
    const userId = req.user._id;
    return this.friendsService.getFriendList(userId);
    }
}
