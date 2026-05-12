import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
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
import { ProviderAvailabilityModule } from './provider-availability/provider-availability.module';
import { DevAuthGuard } from './auth/dev-auth.guard';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
          },
          ttl: 60 * 1000 * 5, // 5 minutos padrão
        }),
      }),
    }),
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
    AuthModule,
    ProviderAvailabilityModule
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
