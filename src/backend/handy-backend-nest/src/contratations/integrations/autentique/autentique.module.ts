import { Module } from '@nestjs/common';
import { AutentiqueService } from './autentique.service';

@Module({
  providers: [AutentiqueService],
  exports: [AutentiqueService], // Exportamos para que outros módulos possam usá-lo
})
export class AutentiqueModule {}