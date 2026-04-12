import { Periodo } from "common/utils/periodoDate";

export type ServicesAnalysis = {
  prestador_id: number;
  periodo?: Periodo;
  total_revenue?: number;
  total_contratacoes?: number;
  media_avaliacao?: number;
  servicos: {
    servico_id: number;
    nome_servico: string;
    total_contratacoes?: number;
    revenue?: number;
    media_avaliacao?: number;
  }[];
};

export type ClientsAnalysis = {
  prestador_id: number;
  periodo?: Periodo;
  total_clientes: number;
  clientes: {
    cliente_id: number;
    nome: string;
    total_contratacoes: number;
  }[];
};