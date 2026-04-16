import {ImageSourcePropType} from 'react-native';

export interface Professional {
  id: string;
  name: string;
  rating: number;
  minPrice: number;
  category: string;
  image: ImageSourcePropType;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const professionals: Professional[] = [
  {
    id: '1',
    name: 'Guilherme Films',
    rating: 4.5,
    minPrice: 1200,
    category: 'Video Maker',
    image: require('../assets/images/3d0b5477bbd0ad8a08f413152a44923aabecb426.png'),
  },
  {
    id: '2',
    name: 'Joel Santana',
    rating: 4.1,
    minPrice: 350,
    category: 'Mecânico',
    image: require('../assets/images/9f6bcaae7e57d43fc1992ee6f4e5bba3d427f782.png'),
  },
  {
    id: '3',
    name: 'Paulo Mendes',
    rating: 4.8,
    minPrice: 800,
    category: 'Eletricista',
    image: require('../assets/images/0266ae641f0ee839bcf123c3ded1e70d3bd4d46f.png'),
  },
  {
    id: '4',
    name: 'Carlos Lima',
    rating: 4.3,
    minPrice: 500,
    category: 'Programador',
    image: {uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'},
  },
  {
    id: '5',
    name: 'Ana Beatriz',
    rating: 4.9,
    minPrice: 950,
    category: 'Editor de vídeo',
    image: {uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'},
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
