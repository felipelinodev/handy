import React from 'react';
import { Alert } from 'react-native';
import { IconButton } from './IconButton';

export const NotificationButton = () => {
    return (
        <IconButton
            icon="notifications-outline"
            onPress={() =>
                Alert.alert('Notificações', 'Em breve...')
            }
        />
    );
};