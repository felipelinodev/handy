import { Module } from '@nestjs/common';
import { ProviderAvailabilityController } from './provider-availability.controller';
import { ProviderAvailabilityService } from './provider-availability.service';
import { ProviderAvailabilityRepository } from './repository/provider-availability.repository';

@Module({
  controllers: [ProviderAvailabilityController],
  providers: [ProviderAvailabilityService, ProviderAvailabilityRepository],
})
export class ProviderAvailabilityModule {}
