import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { DevStrategy } from './dev.strategy';
import { SuperAdminStrategy } from './super-admin.strategy';

@Module({
  imports: [
    PassportModule, 
    JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: {expiresIn: '7d'},
    }),
  ],
  providers: [JwtStrategy, DevStrategy, SuperAdminStrategy],
  exports: [JwtModule],
})

export class AuthModule {}
