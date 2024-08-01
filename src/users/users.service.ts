import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { InventoryItem, User } from './schemas/user.schemas';
import { Connection, Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRankDto } from './dto/update-rank.dto';
import { Item, ItemDocument } from 'src/item/item.schema';
import { UserInventoryDto } from './dto/inventory.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>,
                @InjectModel(Item.name) private itemModel: Model<ItemDocument>,){}
    
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

    async addItemToUserInventory(userId: string, itemId: string, quantity: number): Promise<User> {
        const user = await this.userModel.findById(userId);
        const item = await this.itemModel.findById(itemId);
    
        if (!user || !item) {
          throw new Error('User or Item not found');
        }
    
        const inventoryItem = user.inventory.find(i => i.itemId.toString() === itemId);
    
        if (inventoryItem) {
            if(item.unique)
            {
                throw new Error('User already have this item');
            }
            else
            {
                inventoryItem.quantity += quantity;
                inventoryItem.purchaseDate = new Date();
            }
        } else {
          user.inventory.push({ itemId: new Types.ObjectId(itemId), equipped: false, quantity, purchaseDate: new Date() });
        }
    
        return user.save();
      }
    async getUserInventory(userId: string): Promise<UserInventoryDto> {
        const user = await this.userModel.findById(userId).populate('inventory.itemId').exec();
    
        const inventory = user.inventory.map(item => ({
          //itemId: item.itemId._id.toString(),
          itemDetails: item.itemId,
          equipped: item.equipped,
          quantity: item.quantity,
          purchaseDate: item.purchaseDate,
           
        }));
    
        return { inventory };
      }
    async equipItem(userId: string, itemId: string): Promise<any> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        if (itemId === null || itemId === undefined || itemId.trim() === "") {
            console.log("ItemId is empty:", itemId);}
        if(itemId === null || itemId === undefined || itemId === '""')
        {
            console.log(itemId.toString())
            const unequipPromises = user.inventory
        .filter(i => i.equipped)
        .map(async (i) => {
            const itemInInventory = await this.itemModel.findById(i.itemId).exec();
            if (itemInInventory) {
                i.equipped = false;
            }
        });
        await Promise.all(unequipPromises);
        await user.save();
        return {message:"unequipItem success"};
        }
        const inventoryItem = user.inventory.find(i => i.itemId.toString() === itemId);
        if (!inventoryItem) {
            throw new HttpException('Item not found in user inventory', HttpStatus.NOT_FOUND);
        }

        const item = await this.itemModel.findById(itemId).exec();
        if (!item) {
            throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
        }

        if (inventoryItem.equipped) {
            throw new HttpException('Item is already equipped', HttpStatus.BAD_REQUEST);
        }
        const category = item.category;
        const unequipPromises = user.inventory
        .filter(i => i.itemId.toString() !== itemId && i.equipped)
        .map(async (i) => {
            const itemInInventory = await this.itemModel.findById(i.itemId).exec();
            if (itemInInventory && itemInInventory.category === category) {
                i.equipped = false;
            }
        });
        await Promise.all(unequipPromises);
        inventoryItem.equipped = true;
        await user.save();
        const itemDetails = item;
        return {itemDetails};
      }
async getEquippedItemsForUsers(userIds: Types.ObjectId[]): Promise<any[]> {

    // Find users and populate their inventory's itemId
    const users = await this.userModel
        .find({ _id: { $in: userIds } })
        .populate('inventory.itemId') // Populate item details
        .exec();


    const itemIds = users.flatMap(user => user.inventory.map(item => item.itemId));


    const items = await this.itemModel.find({ _id: { $in: itemIds } }).exec();


    const itemDictionary = items.reduce((dict, item) => {
      dict[item._id.toString()] = item;
      return dict;
    }, {} as { [key: string]: ItemDocument });

    const equippedItems = await Promise.all(users.map(async user => {
        const inventoryItems = await Promise.all(user.inventory
          .filter(item => item.equipped)
          .map(async inventoryItem => {
            const itemDetails = await this.itemModel.findById(inventoryItem.itemId).exec();
            return {
              itemId: itemDetails._id.toString(),
              name: itemDetails.name,
              category: itemDetails.category,
              quantity: inventoryItem.quantity,
              purchaseDate: inventoryItem.purchaseDate,
            };
          })
        );
      
        return {
          userId: user._id.toString(),
          equippedItems: inventoryItems,
        };
      }));

    return equippedItems;
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
