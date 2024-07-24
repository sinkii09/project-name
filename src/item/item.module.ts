import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { Item, ItemSchema } from './item.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }])],
  controllers: [ItemController],
  providers: [ItemService],
  exports: [MongooseModule],
})
export class ItemModule {}
