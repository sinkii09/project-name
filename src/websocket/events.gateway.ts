import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { OnGatewayInit, OnGatewayConnection,OnGatewayDisconnect } from "@nestjs/websockets";
import { Logger } from "@nestjs/common";

@WebSocketGateway()
export class EventsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
        private readonly logger = new Logger(EventsGateway.name);

        @WebSocketServer() server: Server;
       
        afterInit(server: any) {
            this.logger.log("Initialized");
        }
        handleConnection(client: any, ...args: any[]) {
            const {sockets} = this.server.sockets;
            this.logger.log(`Client id: ${client.id} connected`);
            this.logger.debug(`Number of connected clients: ${sockets.size}`);
        }
        handleDisconnect(client: any) {
            this.logger.log(`Cliend id:${client.id} disconnected`);
        }


        @SubscribeMessage('events')
        handleSendMessage(client: any, data: any)
        {
            this.logger.log(`Message received from client id: ${client.id}`);
            this.logger.debug(`Payload: ${data}`);
            return {
                event: "pong",
                data,
            };
        }
    } 
