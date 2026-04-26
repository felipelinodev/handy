import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './client/client.module';
import { ProviderModule } from './provider/provider.module';
import { PrismaModule } from './prisma/prisma.module';
import { ContratationsModule } from './contratations/contratations.module';
import { AnalysisModule } from './analysis/analysis.module';
import { ServicesModule } from './services/services.module';
import { BreakpointsModule } from './brakpoints/breakpoints.module';
import { SupportModule } from './support/support.module';
import { MessagesModule } from './messages/messages.module';
import { ConversationsModule } from './conversations/conversations.module';

@Module({
  imports: [
    ClientModule, 
    ProviderModule, 
    PrismaModule, 
    ContratationsModule, 
    AnalysisModule, 
    ServicesModule, 
    BreakpointsModule,
    SupportModule,
    MessagesModule,
    ConversationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
