import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { ClientRepository } from './repository/client.repository';
import { HashProvider } from 'common/security/security.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ClientController],
  providers: [ClientService, ClientRepository, HashProvider],
})
export class ClientModule {}
