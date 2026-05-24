import { ProviderProfileData } from '@/features/provider/types';

export const mockProviderProfile: ProviderProfileData = {
  id: 'pro_1',
  name: 'Guilherme Films',
  profession: 'Video Maker',
  rating: 4.1,
  avatar: require('../../../../assets/images/favicon.png'),
  totalClients: 502,
  address: 'Rua da Cachaça 27, Centro, Belo Horizonte',
  experienceText: [
    'Mussum Ipsum, cacilds vidis litro abertis. Mauris nec dolor in eros commodo tempor. Aenean aliquam molestie leo, vitae iaculis nisl. Suco de cevadiss deixa as pessoas mais interessantis. Delegadis gente finis, bibendum egestas augue arcu ut est. Morbi viverra placerat justo, vel pharetra turpis.',
    'Mussum Ipsum, cacilds vidis litro abertis. Mauris nec dolor in eros commodo tempor. Aenean aliquam molestie leo, vitae iaculis nisl. Suco de cevadiss deixa as pessoas mais interessantis. Delegadis gente finis, bibendum egestas augue arcu ut est. Morbi viverra placerat justo, vel pharetra turpis.'
  ],
  services: [
    {
      id: 'srv_1',
      title: 'Captação de vídeo',
      minPrice: 1200,
      description: 'gravação de cenas, entrevistas, eventos, produtos, making of, etc.'
    },
    {
      id: 'srv_2',
      title: 'Edição de vídeo',
      minPrice: 500,
      description: 'montagem, cortes, efeitos, trilha, color grading básico'
    },
    {
      id: 'srv_3',
      title: 'Color Grading',
      minPrice: 300,
      description: 'Aprimoramento de cores para produções audiovisuais.'
    }
  ],
  reviews: [
    {
      id: 'rev_1',
      author: 'Colleen',
      rating: 3,
      comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporlabore et dolore magna aliqua.',
      date: '14 de novembro de 2025'
    },
    {
      id: 'rev_2',
      author: 'Dianne',
      rating: 3,
      comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporlabore et dolore magna aliqua.',
      date: '14 de setembro de 2025'
    }
  ]
};
