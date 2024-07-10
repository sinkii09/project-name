import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameSession, GameSessionSchema, Player } from './game-session.schema';
import { User } from 'src/users/schemas/user.schemas';
import { ScoringSystem } from './scoring-system';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class GameSessionService {
    private scoringSystem: ScoringSystem;
    constructor(@InjectModel(GameSession.name) private gameSessionModel: Model<GameSession>,
                @InjectModel(User.name) private readonly userModel: Model<User>) {this.scoringSystem = new ScoringSystem();}

    async createGameSession(gameMode: string, playerIds: string[]): Promise<GameSession> {
        const players = []; 
    
        for (const playerId of playerIds) {
            const user = await this.userModel.findById(playerId);
            if (!user) {
            throw new NotFoundException(`User with ID ${playerId} not found.`);
            }
            players.push({
            userId: user._id,
            username: user.name,
            kills: 0,
            deaths: 0,
            rankPointsEarned: 0,
            place: 0,
            });
        }
    
        // Create the game session
        const createdGameSession = await this.gameSessionModel.create({
            gameMode,
            players,
        });
    
        // Update users' lastGameSession field
        await Promise.all(
            playerIds.map(async (playerId) => {
            await this.userModel.findByIdAndUpdate(playerId, { lastGameSession: createdGameSession._id });
            }),
        );
    
        return createdGameSession;
    }
    async updatePlayerStats(sessionId: string, playerStats: { playerId: string, kills: number, deaths: number }[]) {
      try {  
        const gameSession = await this.gameSessionModel.findById(sessionId).exec();

        if (!gameSession) {
          throw new Error('Game session not found');
        }
    
        const userIds = playerStats.map(stat => stat.playerId);
        const users = await this.userModel.find({ _id: { $in: userIds } }).exec();
    
        const userIdMap = users.reduce((acc, user) => {
            acc[user._id.toString()] = user;
            return acc;
          }, {});

        for (const stat of playerStats) {
          const player = gameSession.players.find(p => p.userId.toString() === stat.playerId);
          if (!player) {
            throw new Error(`Player with ID ${stat.playerId} not found in game session`);
          }
          player.kills += stat.kills;
          player.deaths += stat.deaths;
        }
    
        const playersData = gameSession.players.map(p => {
            const user = userIdMap[p.userId.toString()];
            
            if (!user) {
              console.warn(`User with ID ${p.userId.toString()} not found in user map`);
              return null;
            }
            return {
              ...p,
              userId: user._id,
              rating: user.rating,
              username: p.username,
              playerKill: p.kills,
              playerDead: p.deaths,
              playerScore: p.rankPointsEarned,
              playerPlace: p.place,
              rankpoints: user.rankpoints
            };
          }).filter(p => p !== null);
    
        this.scoringSystem.UpdateRatingsForSession(playersData);
        this.scoringSystem.UpdateRankPoints(playersData);
        this.scoringSystem.CalculatePlayerPlace(playersData);
    
        for (const playerData of playersData) {
      const user = userIdMap[playerData.userId.toString()];
      if (user) {
        user.rating = playerData.rating;
        user.rankpoints = playerData.rankpoints;
        await user.save();
      }
    }
        gameSession.players = playersData.map(p => ({
        userId: p.userId,
        username: p.username,
        kills: p.playerKill,
        deaths: p.playerDead,
        rankPointsEarned: p.playerScore,
        place: p.playerPlace,
      }));
        await gameSession.save();
    }catch (error) {
      console.error('Error update session:', error);
      return { success: false, error: error.message };
      }
    }
    async getLastSessionByUserId(userId: string) {
        const user = await this.userModel.findById(userId);
        const lastSession = await this.gameSessionModel.findById(user.lastGameSession)

    
        if (!lastSession) {
          throw new NotFoundException('No game session found for this user');
        }
        const playerIds = lastSession.players.map(p => p.userId);
        const playerResult = await this.userModel.find({ _id: { $in: playerIds } }).exec();
        // Map player details to session data
        const playerInfo = lastSession.players.map(p => {
           const user = playerResult.find(u => u._id.toString() === p.userId.toString());
          return {
            name: user?.name,
            kills: p.kills,
            deaths: p.deaths,
            place: p.place,
            rpEarn: p.rankPointsEarned,
            rank:user.rankpoints
          };
        });
    
        return {
          sessionId: lastSession._id,
          gameMode: lastSession.gameMode,
          gameResult: playerInfo,
        };
      }
    async findGameSessions(): Promise<GameSession[]> {
        return await this.gameSessionModel.find().exec();
    }
}