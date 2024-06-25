
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class MatchmakerService {
    constructor(private readonly httpService: HttpService) {}
    createMatchmakingTicket(token: string,playerId: string): Observable<AxiosResponse<any>>
    {
        const url = 'https://matchmaker.services.api.unity.com/v2/tickets';
        const headers = {
            'Content-Type' : 'application/json',
            'Authorization': `Bearer ` + token, // Replace with your actual token
            'impersonated-user-id': playerId, // Replace with the player ID
        };
        const requestBody = {
            attributes: {
                platform: 'PC',
            },
            players: [
                {
                    id: playerId, // Player ID
                },
            ],
        };
        try {
        return this.httpService.post(url, requestBody, { headers });
        }
        catch(error)
        {
             
                console.error('Error making request:', error.message);
                throw new Error('rrr');
            
        }
    }
}
