import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schemas';
import { Connection, Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRankDto } from './dto/update-rank.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>){}
    
    async createUser(createUserDto: CreateUserDto): Promise<User>
    {
        const {username,password,name} = createUserDto
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password,salt)
        const createUser = new this.userModel({username,password:hashPassword,name});
        return createUser.save();
    }
    async updateUserRank(updateUserDto: UpdateUserRankDto): Promise<User>
    {
        const{ _id,...updateData} = updateUserDto;
        console.log(`update rank for player ${_id} `);
        return await this.userModel.findByIdAndUpdate({_id},updateData,{new:true, upsert:true});
    }
    async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<any>
    {
        const user = await this.userModel.findById(userId);
        if (!user) {
          throw new NotFoundException('User not found');
        }
        const {name,oldpassword,newpassword} = updateUserDto;
        if(updateUserDto.newpassword)
            {
                const isMatch = await bcrypt.compare(oldpassword, user.password);
                if(!isMatch)
                    {
                        throw new Error('Old password is Incorrect');
                    }
                const hashedNewPassword = await bcrypt.hash(newpassword,10);
                user.password = hashedNewPassword;
            }
        else if(updateUserDto.name)
            {
                const existsUser = await this.findName(updateUserDto.name)
                if(existsUser)
                    {
                        throw new Error('Name Existed, Try another');
                    }
                user.name = name;
            }
            else
            {
                throw new Error('Blank Input');
            }
        
        await user.save();
    }
    async getTopRankUser(): Promise<User[]> {
        const users = await this.userModel.find().sort({ rankpoints: -1 }).limit(10).select('name rankpoints').exec();
        const rankedUsers = users.map((user, index) => ({
            ...user.toObject(),
            rank: index + 1 
          }));
          return rankedUsers;
    }
    async getUserRank(userId: string): Promise<any> {
    
        const user = await this.userModel.findById(userId).select('rankpoints').exec();
        if (!user) {
          throw new Error('User not found');
        }
    
        const rankpoints = user.rankpoints;
    
        const higherRankCount = await this.userModel.countDocuments({ rankpoints: { $gt: rankpoints } }).exec();
    
        const userRank = higherRankCount + 1;
    
        return { userId, rankpoints: rankpoints, rank: userRank };
      }
    async findUserByIdOrName(userInput: string): Promise<User>
    {
        const isObjectId = Types.ObjectId.isValid(userInput);
        const query = isObjectId ? { _id: userInput } : { name: userInput };
        return await this.userModel.findOne(query).exec();
    }
    async findUser(inputUserName : string): Promise<User>{
        const user = await this.userModel.findOne({username:inputUserName}).exec();
        if(user)
            {
                return user;
            }
            return null
    }
    async findName(inputName : string): Promise<User>{
        const user = await this.userModel.findOne({name:inputName}).exec();
        if(user)
            {
                return user;
            }
            return null
    }
    async findAll(): Promise<User[]>
    {
        return this.userModel.find().exec();
    }
}
