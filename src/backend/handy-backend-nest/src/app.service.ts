import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getMensagemUrlRaiz(): string {
    return 'Você está acessando a api oficial do Handy, por favor consulte a documentação.Para usar a Api corretamente.';
  }
}
