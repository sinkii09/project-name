import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule} from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtStrategy } from './auth/jwt.strategy';
import { MatchmakerModule } from './matchmaker/matchmaker.module';
import { FriendModule } from './friend/friend.module';
import { ChatModule } from './websocket/chat.module';
import { ChatGateway } from './websocket/chat.gateway';
import { GameSessionModule } from './gamesession/game-session.module';
@Module({
  imports: [AppModule, UsersModule,AuthModule,ChatModule,MatchmakerModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI,{
      dbName: "UserDB",
    }),
    FriendModule,
    GameSessionModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    JwtStrategy,
    ChatGateway
  ],
  
})
export class AppModule {}
