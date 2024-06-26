import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document,Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/schemas/user.schemas';


@Schema({ _id: false })
export class Player {
    @Prop({ type:  MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: User['_id'];

    @Prop({ type: String, required: true })
    username: string;

    @Prop({ type: Number, default: 0 })
    kills: number;

    @Prop({ type: Number, default: 0 })
    deaths: number;

    @Prop({ type: Number, default: 0 })
    rankPointsEarned: number;

    @Prop({ type: Number, default: 0 })
    place: number;
}

@Schema()
export class GameSession extends Document {
    @Prop({ type: String, required: true })
    gameMode: string;

    @Prop({ type: [Player], default: [] })
    players: Player[];
}

export const GameSessionSchema = SchemaFactory.createForClass(GameSession);