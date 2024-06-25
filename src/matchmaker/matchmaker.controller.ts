import { Body, Controller, Param, Post } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { MatchmakerService } from './matchmaker.service';
import { SkipAuth } from 'src/auth/auth.decorator';

@Controller('matchmaker')
export class MatchmakerController {
    constructor( private readonly matchmakerSerivce: MatchmakerService){}

    @SkipAuth()
    @Post('tickets')
    async createMatchmakingTicket(@Body() token:string,playerId:string): Promise<Observable<AxiosResponse<any, any>>>
    {
        return await this.matchmakerSerivce.createMatchmakingTicket(token,playerId)
    }
}
