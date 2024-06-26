import { Injectable } from '@nestjs/common';
import { Player } from './game-session.schema';

@Injectable()
export class ScoringSystem {
  public UpdateRatingsForSession(players: any[]) {
    const K = 32;
    for (let i = 0; i < players.length; i++) {
      for (let j = 0; j < players.length; j++) {
        if (i !== j) {
          const playerA = players[i];
          const playerB = players[j];

          let KFactor = K;
          if (playerB.rating > 2400) {
            KFactor = 10;
          } else if (playerB.rating > 2000) {
            KFactor = 20;
          }

          const scoreA = this.CalculateScore(playerA);
          const scoreB = this.CalculateScore(playerB);

          this.UpdateRatings(playerA, playerB, scoreA, scoreB, KFactor);
        }
      }
    }
  }

  public CalculateScore(userData: any) {
    return userData.playerKill * 2 - userData.playerDead;
  }

  public UpdateRatings(playerA: any, playerB: any, scoreA: number, scoreB: number, K: number = 32) {
    const expectedScoreA = this.CalculateExpectedScore(playerA, playerB);
    const expectedScoreB = this.CalculateExpectedScore(playerB, playerA);

    const normScoreA = scoreA > scoreB ? 1.0 : (scoreA === scoreB ? 0.5 : 0.0);
    const normScoreB = 1 - normScoreA;

    playerA.rating = Math.round(playerA.rating + K * (normScoreA - expectedScoreA));
    playerB.rating = Math.round(playerB.rating + K * (normScoreB - expectedScoreB));

    playerA.playerScore = Math.round(playerA.playerScore + K * (normScoreA - expectedScoreA));
    playerB.playerScore = Math.round(playerB.playerScore + K * (normScoreB - expectedScoreB));
  }

  public CalculateExpectedScore(playerA: any, playerB: any) {
    return 1.0 / (1.0 + Math.pow(10, (playerB.rating - playerA.rating) / 400.0));
  }

  public UpdateRankPoints(players: any[]) {
    players.forEach(player => {
      const rankPointsEarned = this.CalculateRankPoints(player);
      player.rankpoints += rankPointsEarned;
      if (player.rankpoints < 0) {
        player.rankpoints = 0;
      }
      console.log(`Player ${player.userId} earned ${player.playerScore} rank points. Total rank points: ${player.rankpoints} with rating: ${player.rating}`);
    });
  }

  public CalculateRankPoints(player: any) {
    player.playerScore += this.CalculateScore(player);
    if (player.playerScore > 150) {
      player.playerScore = 150;
    } else if (player.playerScore < -50) {
      player.playerScore = -50;
    }
    return player.playerScore;
  }
  public CalculatePlayerPlace(players: any[]) {
    players.sort((p1, p2) => {
      let result = p2.playerKill - p1.playerKill;
      if (result === 0) {
        result = p1.playerDead - p2.playerDead;
        if (result === 0) {
          result = p2.Rating - p1.Rating;
        }
      }
      return result;
    });

    for (let i = 0; i < players.length; i++) {
      players[i].playerPlace = i + 1;
    }
  }
}