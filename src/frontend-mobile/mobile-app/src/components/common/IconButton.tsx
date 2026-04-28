import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface IconButtonProps {
    icon: any;
    onPress: () => void;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, onPress }) => {
    return (
        <TouchableOpacity
            style={styles.navBtn}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Ionicons name={icon} size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    navBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.purpleDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
});