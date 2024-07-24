import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './item.schema';


@Injectable()
export class ItemService {
  constructor(@InjectModel(Item.name) private itemModel: Model<Item>) {}

  async createItem(name: string, description: string,icon: string, price: number, unique?: boolean, category?: string): Promise<Item> {
    const newItem = new this.itemModel({ name, description,icon, price, unique ,category });
    return newItem.save();
  }

  async getItems(): Promise<Item[]> {
    return this.itemModel.find().exec();
  }
}
