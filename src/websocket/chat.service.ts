import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from './chat-message.schema';
import { CreateChatMessageDto } from './chat.dto';

@Injectable()
export class ChatService {
    private readonly maxMessages = 100;
    constructor(@InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessageDocument>) {}

  async create(createChatMessageDto: CreateChatMessageDto): Promise<ChatMessage> {
    const createdChatMessage = new this.chatMessageModel(createChatMessageDto);
    await createdChatMessage.save();

    const messageCount = await this.chatMessageModel.countDocuments().exec();
    if (messageCount > this.maxMessages) {
      const oldestMessage = await this.chatMessageModel.find().sort({ timestamp: 1 }).limit(1).exec();
      if (oldestMessage.length > 0) {
        await this.chatMessageModel.deleteOne({ _id: oldestMessage[0]._id }).exec();
      }
    return createdChatMessage;
}}
    async getRecentMessages(roomId: string, limit: number = 10): Promise<ChatMessage[]> {
    return await this.chatMessageModel.find({ roomId }).sort({ createdAt: -1 }).limit(limit).exec();
}
  
  async findAll(roomId: string): Promise<ChatMessage[]> {
    return this.chatMessageModel.find({ roomId }).exec();
  }
}
