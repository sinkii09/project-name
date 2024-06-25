import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schemas';
import { UsersService } from 'src/users/users.service';
import { FriendAcceptDto, FriendRequestDto } from './friend_request.dto';

@Injectable()
export class FriendService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private userService: UsersService){}

    async addFriend(userId:string, friendRequestDto: FriendRequestDto): Promise<void>{
        const user = await this.userModel.findById(userId);
        const friend = await this.userModel.findOne({ name: friendRequestDto.friendName });

        if(!user || !friend)
        {
            throw new NotFoundException('User or friend not found');
        }
        
        const friendRequestExists = friend.friendRequests.some(
            (request) => request.id === user._id
          );
      
          const alreadyFriends = user.friends.some(
            (f) => f.id.toString() === friend._id.toString()
          );
      
          if (friendRequestExists || alreadyFriends) {
            // Friend request already sent or they are already friends
            return;
          }
        friend.friendRequests.push(
            {
                id:user._id,
                name:user.name
            });
        await friend.save();
    }
    async acceptFriend(userId:string, friendAcceptDto: FriendAcceptDto): Promise<void>{
        const user = await this.userModel.findById(userId);
        const friend = await this.userModel.findById(friendAcceptDto.friendId);

        if (!user || !friend) {
            throw new NotFoundException('User or friend not found');
          }
        //   const friendRequestIndex = user.friendRequests.findIndex(
        //     (request) => request.id && request.id === friend._id
        //   );
        
        //   if (friendRequestIndex === -1) {
        //     // Friend request not found
        //     console.log("not found");
        //     return;
        //   }
        user.friends.push({
            id: friend._id,
            name:friend.name
        });

        friend.friends.push({
            id:user._id,
            name:user.name
        });
        user.friendRequests = user.friendRequests.filter(requestId => requestId.id === friend._id);
        //user.friendRequests.splice(friendRequestIndex, 1);
        await user.save();
        await friend.save();
    }
    async deniedRequest(userId:string, friendAcceptDto: FriendAcceptDto): Promise<void>{
        const user = await this.userModel.findById(userId);
        const friend = await this.userModel.findById(friendAcceptDto.friendId);

        if (!user || !friend) {
            throw new NotFoundException('User or friend not found');
          }
        user.friendRequests = user.friendRequests.filter(requestId => requestId.id === friend._id);
        await user.save();
    }
    async deleteFriend(userId:string, friendAcceptDto: FriendAcceptDto): Promise<void>{
        const user = await this.userModel.findById(userId);
        const friend = await this.userModel.findById(friendAcceptDto.friendId);

        if (!user || !friend) {
            throw new NotFoundException('User or friend not found');
          }
        user.friends = user.friends.filter(requestId => requestId.id === friend._id);
        friend.friends = friend.friends.filter(requestID => requestID.id === user._id);
        await user.save();
        await friend.save();
    }
    async getFriendRequests(userId: string): Promise<any> {
    
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException('User not found');
          }
          return user.friendRequests; 
    }
    async getFriendList(userId: string): Promise<any> {
    
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException('User not found');
          }
          return user.friends; 
    }
}
