import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Card, Txt, type IconName } from '@/components/ui';
import { t, type TranslationKey } from '@/i18n';
import { colors, spacing } from '@/theme';

const RISKS: { icon: IconName; title: TranslationKey; body: TranslationKey }[] = [
  {
    icon: 'battery-charging',
    title: 'onboarding.risk.battery.title',
    body: 'onboarding.risk.battery.body',
  },
  { icon: 'thermometer', title: 'onboarding.risk.heat.title', body: 'onboarding.risk.heat.body' },
  { icon: 'scissors', title: 'onboarding.risk.glass.title', body: 'onboarding.risk.glass.body' },
  { icon: 'user-check', title: 'onboarding.risk.own.title', body: 'onboarding.risk.own.body' },
];

/** The safety disclaimer, shown at first launch and on the About screen. */
export function RiskCards() {
  return (
    <>
      {RISKS.map((risk) => (
        <Card key={risk.title}>
          <View style={styles.header}>
            <Feather name={risk.icon} size={24} color={colors.accent} />
            <Txt variant="h3" style={styles.title}>
              {t(risk.title)}
            </Txt>
          </View>
          <Txt>{t(risk.body)}</Txt>
        </Card>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  title: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
