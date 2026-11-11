import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui';
import { LOCALES, t } from '@/i18n';
import { useLanguage } from '@/state/language';
import { colors, radius, spacing, touch } from '@/theme';

export function LanguageSwitch() {
  const { locale, changeLanguage } = useLanguage();

  return (
    <View style={styles.row} accessibilityLabel={t('common.language')}>
      <Feather name="globe" size={22} color={colors.textMuted} />
      {LOCALES.map(({ code, label }) => {
        const selected = code === locale;
        return (
          <Pressable
            key={code}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => changeLanguage(code)}
            style={[styles.chip, selected && styles.chipSelected]}>
            <Txt variant="label" style={selected && styles.labelSelected}>
              {label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  chip: {
    minHeight: touch.compact,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  labelSelected: { color: colors.onAccent },
});
