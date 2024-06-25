import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './auth.decorator';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private jwtService: JwtService,private reflector: Reflector) {
        super();
    }
    canActivate(context: ExecutionContext) {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isPublic) {
        return true;
      }
      

      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers['authorization'];
    
      if (!authHeader) {
        throw new UnauthorizedException('Authorization header not found');
      }

      const token = authHeader.split(' ')[1];
      const decodedToken = this.jwtService.verify(token, { secret: process.env.SECRET_KEY });
    
      if (decodedToken.role === 'server') {
        return true;
      }
      else if (decodedToken.role === 'client'){
            return super.canActivate(context);
      }
      else {
          throw new UnauthorizedException('Invalid role');
      }
    }
  }
    // canActivate(context: ExecutionContext): boolean {
    //   const request = context.switchToHttp().getRequest();
    //   const token = request.headers.authorization?.split(' ')[1];
    //   if (!token) {
    //     return false;
    //   }
  
    //   try {
    //     const payload = this.jwtService.verify(token, { secret: process.env.SECRET_KEY });
    //     request.user = payload;
    //     return true;
    //   } catch (error) {
    //     return false;
    //   }
    // }
    

