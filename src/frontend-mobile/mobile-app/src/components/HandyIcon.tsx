import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

type IconName =
  | 'hugeicons:agreement-02'
  | 'carbon:chat'
  | 'material-symbols:home-rounded'
  | 'carbon:for-loop'
  | 'hugeicons:menu-11'
  | 'solar:star-bold'
  | 'solar:star-line-duotone'
  | 'hugeicons:user-group'
  | 'solar:chart-square'
  | 'hugeicons:credit-card';

interface HandyIconProps {
  name: IconName;
  size?: number;
  color?: string;
}

interface IconDefinition {
  viewBox: string;
  render: (color: string) => React.ReactElement;
}

const ICONS: Record<IconName, IconDefinition> = {
  'hugeicons:agreement-02': {
    viewBox: '0 0 24 24',
    render: (color) => (
      <G fill="none" stroke={color} strokeLinecap="round" strokeWidth={1.5}>
        <Path
          strokeLinejoin="round"
          d="M22 6.75h-2.789c-.601 0-.902 0-1.185-.086s-.534-.252-1.034-.586c-.75-.5-1.606-1.07-2.031-1.2c-.425-.128-.876-.128-1.778-.128c-1.226 0-2.016 0-2.568.228c-.55.229-.984.662-1.852 1.53L8 7.27c-.195.196-.293.294-.353.39a1 1 0 0 0 .062 1.149c.07.089.178.176.393.349c.796.64 1.943.576 2.664-.149L12 7.768h1l6 6.036a1.43 1.43 0 0 1 0 2.011a1.41 1.41 0 0 1-2 0l-.5-.502m-3-3.018l3 3.018m0 0a1.43 1.43 0 0 1 0 2.011a1.41 1.41 0 0 1-2 0l-1-1.006m0 0a1.43 1.43 0 0 1 0 2.012a1.41 1.41 0 0 1-2 0L10 16.821m3.5-.503l-2-2m-2 2l.5.503m0 0a1.43 1.43 0 0 1 0 2.012a1.41 1.41 0 0 1-2 0l-2.824-2.882c-.58-.592-.87-.889-1.242-1.045c-.371-.156-.786-.156-1.615-.156H2"
        />
        <Path d="M22 14.75h-2.5m-11-8H2" />
      </G>
    ),
  },
  'carbon:chat': {
    viewBox: '0 0 32 32',
    render: (color) => (
      <G fill={color}>
        <Path d="M17.74 30L16 29l4-7h6a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9v2H6a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-4.84Z" />
        <Path d="M8 10h16v2H8zm0 6h10v2H8z" />
      </G>
    ),
  },
  'material-symbols:home-rounded': {
    viewBox: '0 0 24 24',
    render: (color) => (
      <Path
        fill={color}
        d="M4 19v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.588 1.413T18 21h-3q-.425 0-.712-.288T14 20v-5q0-.425-.288-.712T13 14h-2q-.425 0-.712.288T10 15v5q0 .425-.288.713T9 21H6q-.825 0-1.412-.587T4 19"
      />
    ),
  },
  'carbon:for-loop': {
    viewBox: '0 0 32 32',
    render: (color) => (
      <Path
        fill={color}
        d="M23 23h7v7h-2v-3.352A8.95 8.95 0 0 1 21 30H11c-5 0-9-4-9-9v-8h2v8c0 3.9 3.1 7 7 7h10a6.95 6.95 0 0 0 5.752-3H23zM21 2H11a8.95 8.95 0 0 0-7 3.352V2H2v7h7V7H5.248A6.95 6.95 0 0 1 11 4h10c3.9 0 7 3.1 7 7v8h2v-8c0-5-4-9-9-9z"
      />
    ),
  },
  'hugeicons:menu-11': {
    viewBox: '0 0 24 24',
    render: (color) => (
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 12H10m10-7H4m16 14H4"
      />
    ),
  },
  'solar:star-bold': {
    viewBox: '0 0 24 24',
    render: (color) => (
      <Path
        fill={color}
        d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"
      />
    ),
  },
  'solar:star-line-duotone': {
    viewBox: '0 0 24 24',
    render: (color) => (
      <Path
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"
      />
    ),
  },
  'hugeicons:user-group': {
    viewBox: '0 0 24 24',
    render: (color) => (
      <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <Path d="M9 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
        <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </G>
    ),
  },
  'solar:chart-square': {
    viewBox: '0 0 24 24',
    render: (color) => (
      <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <Path d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6z" />
        <Path d="M7 14l3-3 3 3 4-4" />
      </G>
    ),
  },
  'hugeicons:credit-card': {
    viewBox: '0 0 24 24',
    render: (color) => (
      <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <Path d="M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8z" />
        <Path d="M3 11h18" />
        <Path d="M7 15h2m4 0h4" />
      </G>
    ),
  },
};

export const HandyIcon: React.FC<HandyIconProps> = ({ name, size = 24, color = '#000' }) => {
  const def = ICONS[name];
  if (!def) return null;
  return (
    <Svg width={size} height={size} viewBox={def.viewBox}>
      {def.render(color)}
    </Svg>
  );
};
