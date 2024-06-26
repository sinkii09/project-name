import { Logger,UnauthorizedException,UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectConnection } from "@nestjs/mongoose";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Connection } from "mongoose";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { CreateChatMessageDto } from "./chat.dto";

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    private activeRooms: { [key: string]: Set<string> } = {};
    private defaultRoom: string = "";
    constructor(private readonly jwtService: JwtService,
                private readonly chatService: ChatService,
                @InjectConnection() private readonly connection: Connection,
    ) {
        this.setupChangeStream();   
    };
    @WebSocketServer() server:Server;

    private logger: Logger = new Logger('ChatGateway');

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
        @ConnectedSocket() client: Socket,@MessageBody() data: { oldRoomId: string; newRoomId: string },)
    {
        const {oldRoomId,newRoomId} = data;
        const user = client.data.user;
        if (user) {
            // Leave the old room
            const data={roomId:oldRoomId}
            this.handleLeaveRoom(client,data)
            // Join the new room
            client.join(newRoomId);
            if (!this.activeRooms[newRoomId]) {
                this.activeRooms[newRoomId] = new Set();
              }
              this.activeRooms[newRoomId].add(client.id);
            console.log(`${user.id} joined room ${newRoomId}`);
            
            const recentMessages = await this.chatService.getRecentMessages(newRoomId);
            client.emit('recentMessages', recentMessages);
          } else {
            throw new UnauthorizedException();
          }
    }
    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(
    @ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }){
    const user = client.data.user;
    if (user) {
      client.leave(data.roomId);
      if (this.activeRooms[data.roomId]) {
        this.activeRooms[data.roomId].delete(client.id);
        if (this.activeRooms[data.roomId].size === 0 && data.roomId!=this.defaultRoom) {
          delete this.activeRooms[data.roomId];
        }
      console.log(`${user.id} left room ${data.roomId}`);
    } else {
      console.log('Unauthorized leave attempt');
    }
  }
}

    @SubscribeMessage('chat message')
    async handleMessage(@MessageBody() message: CreateChatMessageDto, @ConnectedSocket() client: Socket): Promise<void> {
        try
        {
            const token = Array.isArray(client.handshake.query.token)
                            ?client.handshake.query.token[0] : client.handshake.query.token;
            const user = await this.jwtService.verifyAsync(token,{ secret : process.env.SECRET_KEY});
            
            const chatMessage = {
                senderId: user.id,
                senderName: user.ingameName,
                roomId: message.roomId,
                message: message.message,
              };
              await this.chatService.create(chatMessage);
              this.logger.log(`Message from ${chatMessage.senderName} ID: ${chatMessage.senderId} message: ${chatMessage.message}`);
        }
        catch(e)
        {
            throw new WsException(e);
        }
    }
    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async handleConnection(client: Socket, ...args: any[]) {
        try
        {
            const token = Array.isArray(client.handshake.query.token)
                            ?client.handshake.query.token[0] : client.handshake.query.token;
            const user = await this.jwtService.verifyAsync(token,{ secret : process.env.SECRET_KEY});
            client.data.user = user;
            this.logger.log(`Client connected: ${client.id} with id:${user.id} and name:${user.ingameName}`);
        }
        catch(e)
        {
            throw new WsException(e);
        }
    }
    private setupChangeStream()
    {
        const chatCollection = this.connection.collection('chat_messages');
        const changeStream = chatCollection.watch();

        changeStream.on('change', (change) =>{
            if(change.operationType === 'insert'){
                
                const newMessage = change.fullDocument;
                if(this.isUserInRoom(newMessage.senderId, newMessage.roomId))
                    {
                        this.server.to(newMessage.roomId).emit('chat message', newMessage);
                    }
                  else
                  {
                    this.server.emit('chat message', newMessage);
                  }
            }
        })
    }
    afterInit(server: Server) {
        this.logger.log('Init');
    }

    private isUserInRoom(clientId: string, roomId: string): boolean {
        return this.activeRooms[roomId] && this.activeRooms[roomId].has(clientId);
        }
}