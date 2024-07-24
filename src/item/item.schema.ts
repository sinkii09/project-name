import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema()
export class Item extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;
  
  @Prop()
  icon: string;

  @Prop({ required: true })
  price: number;

  @Prop({default: true})
  unique: boolean;
  
  @Prop({default: 'hat'})
  category?: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
export type ItemDocument =  HydratedDocument<Item>;