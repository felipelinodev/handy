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
  subtitle: {
    fontSize: 12,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    marginBottom: 20,
    paddingVertical: 12,
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
  chipSection: {
    marginTop: 4,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  chevron: {
    fontSize: 11,
    color: colors.primary,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textWhite,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
    marginBottom: 4,
  },
});
