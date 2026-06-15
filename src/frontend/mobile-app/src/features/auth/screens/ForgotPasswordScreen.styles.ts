import { StyleSheet } from 'react-native';
import colors from '@/theme/colors';

export const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.muttedSurface,
    borderRadius: 24,
    padding: 24,
    shadowColor: colors.purpleDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  alertBanner: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertBannerError: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  alertBannerSuccess: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  alertText: {
    fontSize: 14,
    fontFamily: 'OpenSans_600SemiBold',
    marginLeft: 8,
    flex: 1,
  },
  alertTextError: {
    color: colors.error,
  },
  alertTextSuccess: {
    color: colors.success,
  },
  buttonsContainer: {
    marginTop: 8,
    gap: 12,
  },
  cancelButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textSecondary,
  },
});
