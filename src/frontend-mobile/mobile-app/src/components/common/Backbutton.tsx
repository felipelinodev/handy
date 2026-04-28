import React from 'react';
import { useRouter } from 'expo-router';
import { IconButton } from './IconButton';

export const BackButton = () => {
  const router = useRouter();

  return (
    <IconButton
      icon="chevron-back"
      onPress={() => router.back()}
    />
  );
};