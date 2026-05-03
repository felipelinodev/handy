import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { ReviewRepository } from './repository/review.repository';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository, PrismaService],
  exports: [ReviewService],
})
export class ReviewModule {}
