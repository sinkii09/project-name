import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatMessage, ChatMessageSchema } from './chat-message.schema';
import { ChatService } from './chat.service';

@Module({
    imports:[MongooseModule.forFeature([{ name: ChatMessage.name, schema: ChatMessageSchema }])],
    providers:[ChatService],
    exports:[ChatService]
})
export class ChatModule {}