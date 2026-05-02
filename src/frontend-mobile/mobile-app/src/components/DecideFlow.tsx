
import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image } from 'react-native';

import { useFonts } from 'expo-font';

import {
    OpenSans_400Regular,
    OpenSans_600SemiBold,
    OpenSans_700Bold
} from "@expo-google-fonts/open-sans";
import { useRouter } from 'expo-router';

export default function DecideFlow() {
    const [fontsLoaded] = useFonts({ OpenSans_400Regular, OpenSans_600SemiBold, OpenSans_700Bold });
    const router = useRouter();

    if (!fontsLoaded) return null; //IMPEDE O SISTEMA DE CARREGAR TELAS SEM AS FONTES DESEJADAS. EVITA CARREGAR FONTES RIDÍCULAS DO SISTEMAS.

    return (
        <ImageBackground
            source={require('../assets/fundo_principal.png')}
            style={styles.container}
        >
            {/* PARTE DE CIMA - LOGO  */}
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/logo_completa.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            {/* PARTE DE BAIXO - TEXTO E BOTÕES*/}
            <View style={styles.contentContainer}>
                <Text style={styles.textTitle}>Para te orientar no App</Text>

                <Text style={styles.textSubtitle}>
                    você quer prestar serviços ou contratar prestadores?
                </Text>

                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={styles.buttonPrimary}
                        onPress={() => router.push('/auth/login' as any)}
                    >
                        <Text style={styles.buttonText}>Serviços</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.buttonSegundary}
                        onPress={() => router.push('/auth/provider-login' as any)}
                    >
                        <Text style={styles.buttonText}>Prestar Serviços</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    logo: {
        width: 131.51
    },
    contentContainer: {
        flex: 2,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    textTitle: {
        fontSize: 24,
        fontFamily: 'OpenSans_700Bold',
        color: '#6366f1',
        textAlign: 'center',
        marginBottom: 10,
    },
    textSubtitle: {
        fontSize: 16,
        fontFamily: 'OpenSans_400Regular',
        color: '#121341',
        textAlign: 'center',
        width: 280,
        marginBottom: 40,
    },
    buttonGroup: {
        gap: 13,
        width: '100%',
        alignItems: 'center',
    },
    buttonPrimary: {
        width: 309,
        height: 60,
        backgroundColor: '#6366f1',
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonSegundary: {
        width: 309,
        height: 60,
        backgroundColor: '#0f172a',
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontFamily: 'OpenSans_600SemiBold',
        color: '#fff',
    },
});
