import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "./auth.service";
import { ServerManager } from "src/server/server.manager";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy)
{
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.SECRET_KEY,
        })
    }
    async validate(payload: any) {
        const { id,role} = payload;
        if(role=== 'server'){
            const serverManager = ServerManager.getInstance();
            serverManager.getServer(id);
            }
        else if(role === 'client'){
            const user = await this.authService.otherValidateUser(id);
            if (!user) {
              throw new UnauthorizedException();
            }
            return user;
        }
        else{
            throw new UnauthorizedException('Invalid role');
}
    }
}