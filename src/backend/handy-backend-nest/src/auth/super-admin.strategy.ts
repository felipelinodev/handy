import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class SuperAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('x-admin-token'),
      ignoreExpiration: false,
      secretOrKey: process.env.ADMIN_JWT_SECRET!,
    });
  }

  validate(payload: any) {
    return payload;
  }
}
