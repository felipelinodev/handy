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
