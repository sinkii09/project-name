import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Item, ItemDocument } from 'src/item/item.schema';
import { Shop, ShopDocument } from './shop.schema';
import { UserDocument } from 'src/users/schemas/user.schemas';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateShopDto } from './dto/shop.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ShopService {
    constructor(
        @InjectModel('Item') private readonly itemModel: Model<ItemDocument>,
        @InjectModel('Shop') private readonly shopModel: Model<ShopDocument>,
        @InjectModel('User') private readonly userModel: Model<UserDocument>,
        private userService: UsersService
      ) {}


      async createShop(createShopDto: CreateShopDto): Promise<Shop> {
        const newShop = new this.shopModel(createShopDto);
        return newShop.save();
      }
    
      async createItem(createItemDto: CreateItemDto): Promise<ItemDocument> {
        try {
          const newItem = new this.itemModel(createItemDto);
          return await newItem.save();
        } catch (error) {
          throw new BadRequestException('Failed to create item');
        }
      }
      async addItemToShop(shopId: string, itemId: string): Promise<Shop> {
        const shop = await this.shopModel.findById(shopId);
        if (!shop) {
          throw new NotFoundException('Shop not found');
        }
    
        const item = await this.itemModel.findById(itemId);
        if (!item) {
          throw new NotFoundException('Item not found');
        }
    
        shop.shopitems.push(item);
        return shop.save();
      }
      async getShopItems(shopId: string): Promise<Item[]> {
        const shop = await this.shopModel.findById(shopId).exec();
        if (!shop) {
          throw new NotFoundException('Shop not found');
        }
        return shop.shopitems;
      }

      async purchaseItem(shopId: string,userId: string, itemId: string): Promise<any> {
        try {
            const userObjectId = new Types.ObjectId(userId);
            const itemObjectId = new Types.ObjectId(itemId);
      
            const user = await this.userModel.findById(userObjectId).exec();
            if (!user) {
              throw new NotFoundException('User not found');
            }
            const shop = await this.shopModel.findById(shopId).exec();
            if (!shop) {
              throw new Error('Shop not found');
            }
            const shopItem = await this.shopModel.findOne(
                { _id: shopId, 'shopitems._id': itemObjectId },
                { 'shopitems.$': 1 }
              ).exec();
            const alreadyHasItem = user.inventory.some((invItem) => (invItem.itemId as Types.ObjectId).equals(itemObjectId));
            if (alreadyHasItem) {
              throw new BadRequestException('Item already in inventory');
            }
            const item = shopItem.shopitems[0];
            if (user.gold < item.price) {
                throw new BadRequestException('Insufficient funds');
              }
              
            user.gold -= item.price;
            user.inventory.push({ itemId: itemObjectId, equipped: false, quantity: 1 });
            await user.save();
              this.userService.equipItem(userId,item._id.toString())
            return { success: true, message: 'Item purchased successfully' };
          } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
              throw error;
            }
            throw new BadRequestException('Failed to purchase item');
          }
        
    }
}
