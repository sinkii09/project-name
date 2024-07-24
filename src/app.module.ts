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
import { ItemModule } from './item/item.module';
import { ShopController } from './shop/shop.controller';
import { ShopService } from './shop/shop.service';
import { ShopModule } from './shop/shop.module';
@Module({
  imports: [AppModule, UsersModule,AuthModule,ChatModule,MatchmakerModule,ItemModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI,{
      dbName: "UserDB",
    }),
    FriendModule,
    GameSessionModule,
    ShopModule,
  ],
  controllers: [AppController, ShopController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    JwtStrategy,
    ChatGateway,
    ShopService
  ],
  
})
export class AppModule {}
