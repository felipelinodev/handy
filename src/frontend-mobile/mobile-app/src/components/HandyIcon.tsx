import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

type IconName =
  | 'hugeicons:agreement-02'
  | 'carbon:chat'
  | 'material-symbols:home-rounded'
  | 'carbon:for-loop'
  | 'hugeicons:menu-11'
  | 'handy:people'
  | 'handy:chart'
  | 'handy:credit-card';

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
  'handy:people': {
    viewBox: '0 0 24 24',
    render: (color) => (
      <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <Path d="M18 7.16C17.94 7.15 17.87 7.15 17.81 7.16C16.43 7.11 15.33 5.98 15.33 4.58C15.33 3.15 16.48 2 17.91 2C19.34 2 20.49 3.16 20.49 4.58C20.48 5.98 19.38 7.11 18 7.16Z" />
        <Path d="M16.97 14.44C18.34 14.67 19.85 14.43 20.91 13.72C22.32 12.78 22.32 11.24 20.91 10.3C19.84 9.59 18.31 9.35 16.97 9.59" />
        <Path d="M5.97 7.16C6.03 7.15 6.1 7.15 6.16 7.16C7.54 7.11 8.64 5.98 8.64 4.58C8.64 3.15 7.49 2 6.06 2C4.63 2 3.48 3.16 3.48 4.58C3.49 5.98 4.59 7.11 5.97 7.16Z" />
        <Path d="M7 14.44C5.63 14.67 4.12 14.43 3.06 13.72C1.65 12.78 1.65 11.24 3.06 10.3C4.13 9.59 5.66 9.35 7 9.59" />
        <Path d="M12 14.63C11.94 14.62 11.87 14.62 11.81 14.63C10.43 14.58 9.33 13.45 9.33 12.05C9.33 10.62 10.48 9.47 11.91 9.47C13.34 9.47 14.49 10.63 14.49 12.05C14.48 13.45 13.38 14.59 12 14.63Z" />
        <Path d="M9.09 17.78C7.68 18.72 7.68 20.26 9.09 21.2C10.69 22.27 13.31 22.27 14.91 21.2C16.32 20.26 16.32 18.72 14.91 17.78C13.32 16.72 10.69 16.72 9.09 17.78Z" />
      </G>
    ),
  },
  'handy:chart': {
    viewBox: '0 0 24 24',
    render: (color) => (
      <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <Path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" />
        <Path d="M7.33 14.49L9.71 11.4C10.05 10.96 10.68 10.88 11.12 11.22L12.95 12.66C13.39 13 14.02 12.92 14.36 12.49L16.67 9.51" />
      </G>
    ),
  },
  'handy:credit-card': {
    viewBox: '0 0 24 24',
    render: (color) => (
      <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <Path d="M2 12.61H19" />
        <Path d="M19 10.28V17.43C18.97 20.28 18.19 21 15.22 21H5.78C2.76 21 2 20.25 2 17.27V10.28C2 7.58 2.63 6.71 5 6.57C5.24 6.55 5.5 6.55 5.78 6.55H15.22C18.24 6.55 19 7.3 19 10.28Z" />
        <Path d="M22 6.73V13.72C22 16.42 21.37 17.29 19 17.43V10.28C19 7.3 18.24 6.55 15.22 6.55H5.78C5.5 6.55 5.24 6.55 5 6.57C5.03 3.72 5.81 3 8.78 3H18.22C21.24 3 22 3.75 22 6.73Z" />
        <Path d="M5.25 17.81H6.97" />
        <Path d="M9.27 17.81H12.71" />
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
