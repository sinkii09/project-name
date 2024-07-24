import { Module } from '@nestjs/common';
import { Shop, ShopSchema } from './shop.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { Item, ItemSchema } from 'src/item/item.schema';
import { User, UserSchema } from 'src/users/schemas/user.schemas';

@Module({
    imports: [MongooseModule.forFeature([{ name: Shop.name, schema: ShopSchema }]), 
            MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }]),
            MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [MongooseModule],
})
export class ShopModule {}
