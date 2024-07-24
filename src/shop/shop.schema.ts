import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Item } from 'src/item/item.schema';

@Schema()
export class Shop extends Document {

    @Prop({ required: true })
    name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Item' }] , required: false})
  shopitems?: Item[];
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
export type ShopDocument = HydratedDocument<Shop>;