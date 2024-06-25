import { Module } from '@nestjs/common';
import { MatchmakerService } from './matchmaker.service';
import { MatchmakerController } from './matchmaker.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports:[
        HttpModule.registerAsync({
            useFactory: () => ({
              timeout: 5000,
              maxRedirects: 5,
            }),
          })
     ],
    providers:[MatchmakerService],
    exports: [MatchmakerService],
    controllers: [MatchmakerController]
})
export class MatchmakerModule {}
