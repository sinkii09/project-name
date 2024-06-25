import { Logger,UnauthorizedException,UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    constructor(private readonly jwtService: JwtService) {};
    @WebSocketServer() server:Server;

    private logger: Logger = new Logger('ChatGateway');

    @SubscribeMessage('joinRoom')
    handleJoinRoom(
        @ConnectedSocket() client: Socket,@MessageBody() data: { roomId: string },)
    {
        const user = client.data.user;
        if (user) {
            client.join(data.roomId);
            console.log(`${user.sub} joined room ${data.roomId}`);
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
      console.log(`${user.sub} left room ${data.roomId}`);
    } else {
      console.log('Unauthorized leave attempt');
    }
  }

    @SubscribeMessage('chat message')
    async handleMessage(@MessageBody() message: { roomId: string, Message: string }, @ConnectedSocket() client: Socket): Promise<void> {
        try
        {
            const token = Array.isArray(client.handshake.query.token)
                            ?client.handshake.query.token[0] : client.handshake.query.token;
            const user = await this.jwtService.verifyAsync(token,{ secret : process.env.SECRET_KEY});
            const chatMessage = {
                senderId: user.sub,
                senderName: user.ingameName,
                message: message.Message,
              };
              this.logger.log(`Message from ${chatMessage.senderName} ID: ${chatMessage.senderId} message: ${chatMessage.message}`);
              if(message.roomId)
                {
                    this.server.to(message.roomId).emit('chat message', chatMessage);
                }
              else
              {
                this.server.emit('chat message', chatMessage);
              }
        }
        catch(e)
        {
            this.logger.log('Unauthorized');
            client.disconnect();
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
            this.logger.log(`Client connected: ${client.id} with id:${user.sub} and name:${user.ingameName}`);
        }
        catch(e)
        {
            this.logger.log('Unauthorized');
            client.disconnect();
        }
    }
    afterInit(server: Server) {
        this.logger.log('Init');
    }
    
}