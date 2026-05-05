import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
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
import { CategoryModule } from './category/category.module';
import { ReviewModule } from './review/review.module';
import { AuthModule } from './auth/auth.module';
import { DevAuthGuard } from './auth/dev-auth.guard';

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
    ConversationsModule,
    CategoryModule,
    ReviewModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: DevAuthGuard,
    },
  ],
})
export class AppModule {}
