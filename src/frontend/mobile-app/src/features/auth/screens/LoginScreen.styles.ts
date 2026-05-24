import { StyleSheet } from 'react-native';

import colors from '@/theme/colors';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
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
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    marginBottom: 20,
    paddingVertical: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'OpenSans_400Regular',
  },
  footerLink: {
    fontSize: 14,
    color: colors.textLink,
    fontFamily: 'OpenSans_700Bold',
  },
  altLink: {
    fontSize: 13,
    color: colors.primary,
    fontFamily: 'OpenSans_600SemiBold',
  },
});
