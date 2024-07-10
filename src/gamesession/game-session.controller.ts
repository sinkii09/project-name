import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { GameSessionService } from './game-session.service';
import { GameSession } from './game-session.schema';
import { SkipAuth } from 'src/auth/auth.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

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
    try {
      await this.gameSessionService.updatePlayerStats(sessionId, body.playerStats);
      return { message: 'Player stats updated successfully' };
    } catch (error) {
      console.error('Error updating player stats:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to update player stats. ' + (error.message || 'Unknown error'),
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get('last-session/:userId')
  async getLastSessionByUserId(@Param('userId') userId: string) {
    return this.gameSessionService.getLastSessionByUserId(userId);
  }
}