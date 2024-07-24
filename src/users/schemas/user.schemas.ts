import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import{HydratedDocument, Types} from 'mongoose';
import * as mongoose from 'mongoose';

export type UserDocument =  HydratedDocument<User>;

@Schema()
export class InventoryItem {
  @Prop({ type: Types.ObjectId, ref: 'Item' })
  itemId: Types.ObjectId;

  @Prop()
  quantity: number;

  @Prop({ default: Date.now })
  purchaseDate: Date;
}
export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);
@Schema()
export class User
{
    _id: mongoose.ObjectId

    @Prop({type: String, required:true})
    username: string;
  
    @Prop({type: String, required:true})
    password: string;

    @Prop({type: String, required:true})
    name: string;

    @Prop({type:Number, required:false, default: 1000})
    rating: number;
  
    @Prop({type:Number, required:false, default:1000})
    rankpoints: number;

    @Prop({type:Number, required:false, default: 100})
    gold: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'GameSession', required: false})
    lastGameSession: mongoose.Schema.Types.ObjectId;
    @Prop([
        {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: { type: String }
        }
    ])
    friends: Array<{ id: mongoose.Schema.Types.ObjectId, name: string }>;

    @Prop([{
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String }
    }])
    friendRequests: Array<{ id: mongoose.Schema.Types.ObjectId, name: string }>;

    @Prop([InventoryItem])
    inventory: InventoryItem[];
}
export const UserSchema = SchemaFactory.createForClass(User);