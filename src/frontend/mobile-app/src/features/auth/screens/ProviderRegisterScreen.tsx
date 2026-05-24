import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Logo from '@/shared/components/Logo';
import InputField from '@/features/auth/components/InputField';
import AuthButton from '@/features/auth/components/AuthButton';
import { SpecialtyPickerSheet } from '@/features/professionals/components/SpecialtyPickerSheet';
import { useProviderRegister } from '@/features/auth/hooks/useProviderRegister';

import { styles } from './ProviderRegisterScreen.styles';

export default function ProviderRegisterScreen() {
  const {
    nome,
    email,
    cpf,
    senha,
    loading,
    nomeError,
    emailError,
    cpfError,
    senhaError,
    especialidades,
    selectedEspecialidades,
    showSpecialties,
    onChangeNome,
    onChangeEmail,
    onChangeCpf,
    onChangeSenha,
    openSpecialties,
    closeSpecialties,
    toggleEspecialidade,
    submit,
    goToProviderLogin,
  } = useProviderRegister();

  const selectedCount = selectedEspecialidades.length;

  return (
    <ImageBackground
      source={require('../../../../assets/images/fundo_neutro.png')}
      style={styles.background}
    >
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.logoContainer}>
          <Logo />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.subtitle}>Área do Prestador</Text>
              <Text style={styles.title}>Criar Conta</Text>

              <InputField
                placeholder="Nome completo"
                value={nome}
                onChangeText={onChangeNome}
                autoCapitalize="words"
                errorMessage={nomeError}
              />

              <InputField
                placeholder="E-mail"
                value={email}
                onChangeText={onChangeEmail}
                keyboardType="email-address"
                errorMessage={emailError}
              />

              <InputField
                placeholder="CPF (00000000000)"
                value={cpf}
                onChangeText={onChangeCpf}
                keyboardType="numeric"
                errorMessage={cpfError}
              />

              <InputField
                placeholder="Senha"
                value={senha}
                onChangeText={onChangeSenha}
                isPassword
                errorMessage={senhaError}
              />

              <View style={styles.chipSection}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  activeOpacity={0.7}
                  onPress={openSpecialties}
                >
                  <View style={styles.accordionLeft}>
                    <Text style={styles.sectionLabel}>Especialidades</Text>
                    {selectedCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {selectedCount} selecionada{selectedCount > 1 ? 's' : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.chevron}>
                    {selectedCount > 0 ? 'Editar' : 'Selecionar'}
                  </Text>
                </TouchableOpacity>
              </View>

              <AuthButton
                label="Criar conta de prestador"
                onPress={submit}
                loading={loading}
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Já tem uma conta? </Text>
                <TouchableOpacity onPress={goToProviderLogin} activeOpacity={0.7}>
                  <Text style={styles.footerLink}>Entrar.</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <SpecialtyPickerSheet
        visible={showSpecialties}
        onClose={closeSpecialties}
        especialidades={especialidades}
        selectedIds={selectedEspecialidades}
        onToggle={toggleEspecialidade}
      />
    </ImageBackground>
  );
}
