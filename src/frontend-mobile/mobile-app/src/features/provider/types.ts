export interface ProviderService {
  id: string;
  title: string;
  minPrice: number;
  description: string;
}

export interface ProviderReview {
  id: string;
  author: string;
  authorAvatar?: any;
  rating: number;
  comment: string;
  date: string;
}

export interface ProviderProfileData {
  id: string;
  name: string;
  profession: string;
  rating: number;
  avatar: any;
  totalClients: number;
  address: string;
  experienceText: string[];
  services: ProviderService[];
  reviews: ProviderReview[];
}

export interface BreakpointComment {
  id: string;
  autor: string;
  texto: string;
  data: string;
}

export interface Breakpoint {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  comentarios: BreakpointComment[];
  status: 'pendente' | 'em_andamento' | 'concluido';
}

export interface MaintenanceData {
  id: string;
  titulo: string;
  subtitulo: string;
  contratoId: string;
  breakpoints: Breakpoint[];
}
