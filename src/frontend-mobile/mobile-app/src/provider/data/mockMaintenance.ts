import { MaintenanceData } from '../types/provider.types';

export type FilterOption = 'Geral' | 'Pendente' | 'Em Andamento' | 'Concluído';

export const FILTER_OPTIONS: FilterOption[] = [
  'Geral',
  'Pendente',
  'Em Andamento',
  'Concluído',
];

export const mockMaintenanceData: MaintenanceData = {
  id: '1',
  titulo: 'Fazer Motor Carro',
  subtitulo: 'Acompanhamento da manutenção',
  contratoId: '42',
  breakpoints: [
    {
      id: '1',
      titulo: 'Diagnóstico',
      descricao:
        'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.',
      data: '28/02/2026',
      comentarios: [
        {
          id: 'c1',
          autor: 'Carlos Silva',
          texto: 'Diagnóstico inicial concluído, motor apresenta desgaste nos pistões.',
          data: '28/02/2026',
        },
        {
          id: 'c2',
          autor: 'Ana Souza',
          texto: 'Confirmado, vamos precisar trocar as peças.',
          data: '01/03/2026',
        },
      ],
      status: 'concluido',
    },
    {
      id: '2',
      titulo: 'Testes no Motor',
      descricao:
        'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.',
      data: '28/02/2026',
      comentarios: [
        {
          id: 'c3',
          autor: 'Carlos Silva',
          texto: 'Testes de compressão sendo realizados nesta etapa.',
          data: '02/03/2026',
        },
      ],
      status: 'em_andamento',
    },
    {
      id: '3',
      titulo: 'Troca de Peças',
      descricao:
        'Substituição dos componentes danificados identificados no diagnóstico. Inclui pistões, anéis e juntas.',
      data: '05/03/2026',
      comentarios: [],
      status: 'pendente',
    },
    {
      id: '4',
      titulo: 'Montagem Final',
      descricao:
        'Remontagem completa do motor com as peças novas e calibragem dos componentes.',
      data: '10/03/2026',
      comentarios: [],
      status: 'pendente',
    },
    {
      id: '5',
      titulo: 'Entrega',
      descricao:
        'Teste final de funcionamento, limpeza e entrega do veículo ao cliente.',
      data: '15/03/2026',
      comentarios: [],
      status: 'pendente',
    },
  ],
};
