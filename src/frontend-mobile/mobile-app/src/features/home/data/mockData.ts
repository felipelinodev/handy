import {ImageSourcePropType} from 'react-native';

export interface Professional {
  id: string;
  name: string;
  rating: number;
  minPrice: number;
  category: string;
  image: ImageSourcePropType;
  clientsCount: number;
  address: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

const LOREM =
  'Mussum Ipsum, cacilds vidis litro abertis. Mauris nec dolor in eros commodo tempor. Aenean aliquam molestie leo, vitae iaculis nisl. Suco de cevadiss deixa as pessoas mais interessantis. Delegadis gente fina, bibendum egestas augue arcu ut est. Morbi viverra placerat justo, vel pharetra turpis.';

export const professionals: Professional[] = [
  {
    id: '1',
    name: 'Guilherme Films',
    rating: 4.5,
    minPrice: 1200,
    category: 'Video Maker',
    image: require('../../../assets/images/3d0b5477bbd0ad8a08f413152a44923aabecb426.jpg'),
    clientsCount: 502,
    address: 'Rua da Cachaça 27, Centro, Belo Horizonte',
    description: LOREM,
  },
  {
    id: '2',
    name: 'Joel Santana',
    rating: 4.1,
    minPrice: 350,
    category: 'Mecânico',
    image: require('../../../assets/images/9f6bcaae7e57d43fc1992ee6f4e5bba3d427f782.jpg'),
    clientsCount: 318,
    address: 'Av. Brasil 1200, Savassi, Belo Horizonte',
    description: LOREM,
  },
  {
    id: '3',
    name: 'Paulo Mendes',
    rating: 4.8,
    minPrice: 800,
    category: 'Eletricista',
    image: require('../../../assets/images/0266ae641f0ee839bcf123c3ded1e70d3bd4d46f.jpg'),
    clientsCount: 781,
    address: 'Rua dos Andradas 88, Lourdes, Belo Horizonte',
    description: LOREM,
  },
  {
    id: '4',
    name: 'Carlos Lima',
    rating: 4.3,
    minPrice: 500,
    category: 'Programador',
    image: {uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'},
    clientsCount: 124,
    address: 'Rua Paraíba 330, Funcionários, Belo Horizonte',
    description: LOREM,
  },
  {
    id: '5',
    name: 'Ana Beatriz',
    rating: 4.9,
    minPrice: 950,
    category: 'Editor de vídeo',
    image: {uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'},
    clientsCount: 956,
    address: 'Rua Sergipe 1000, Funcionários, Belo Horizonte',
    description: LOREM,
  },
];

export const categories: Category[] = [
  { id: '1', name: 'Video Maker', icon: 'videocam' },
  { id: '2', name: 'Mecânico', icon: 'build' },
  { id: '3', name: 'Mecânica', icon: 'construct' },
  { id: '4', name: 'Eletricista', icon: 'flash' },
  { id: '5', name: 'Chaveiro', icon: 'key' },
  { id: '6', name: 'Desentupidor', icon: 'water' },
  { id: '7', name: 'Programador', icon: 'code-slash' },
  { id: '8', name: 'Editor de vídeo', icon: 'film' },
];
