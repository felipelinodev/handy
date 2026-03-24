import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './repository/users.repository';
import { HashProvider } from 'common/security/security.module';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, HashProvider],
})
export class UserModule {}
