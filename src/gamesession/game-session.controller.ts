import { Body, Controller, Param, Post } from '@nestjs/common';
import { GameSessionService } from './game-session.service';
import { GameSession } from './game-session.schema';
import { SkipAuth } from 'src/auth/auth.decorator';

@SkipAuth()
@Controller('game-sessions')
export class GameSessionController {
  constructor(private readonly gameSessionService: GameSessionService) {}

  @Post('create-session')
  async createSession(
    @Body('gameMode') gameMode: string,
    @Body('playerIds') playerIds: string[],
  ): Promise<any> {
    const gamesession = await this.gameSessionService.createGameSession(gameMode, playerIds);
    return gamesession._id;
  }

  @Post('/update-player-stats/:sessionId')
  async updatePlayerStats(
    @Param('sessionId') sessionId: string,
    @Body() body: { playerStats: { playerId: string, kills: number, deaths: number }[] }
  ) {
    await this.gameSessionService.updatePlayerStats(sessionId, body.playerStats);
    return { message: 'Player stats updated successfully' };
  }
}