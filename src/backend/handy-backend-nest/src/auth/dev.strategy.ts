import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class DevStrategy extends PassportStrategy(Strategy, 'jwt-dev') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('x-dev-token'),
      ignoreExpiration: false,
      secretOrKey: process.env.DEV_JWT_SECRET!,
    });
  }

  validate(payload: any) {
    return payload;
  }
}
