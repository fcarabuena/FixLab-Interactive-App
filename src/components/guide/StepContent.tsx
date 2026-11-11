import { Image, StyleSheet, View } from 'react-native';

import { Button, Callout, Card, CheckRow, Txt } from '@/components/ui';
import { resolveStepImage } from '@/content';
import { t } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import type { DiyGate, Step } from '@/types/content';

export function StepContent({
  step,
  checked,
  onToggle,
}: {
  step: Step;
  checked: ReadonlySet<number>;
  onToggle: (index: number) => void;
}) {
  const image = resolveStepImage(step.image);
  return (
    <>
      <Txt variant="h1">{step.title}</Txt>
      {image ? (
        <View style={styles.imageFrame}>
          <Image
            source={image}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={step.title}
          />
        </View>
      ) : null}
      <Txt>{step.body}</Txt>
      {step.warnings.map((warning) => (
        <Callout key={warning} kind="danger">
          {warning}
        </Callout>
      ))}
      {step.checklist.length > 0 ? (
        <Card>
          <Txt variant="h2">{t('guide.checklist')}</Txt>
          {step.checklist.map((item, index) => (
            <CheckRow
              key={item}
              label={item}
              checked={checked.has(index)}
              onToggle={() => onToggle(index)}
            />
          ))}
          <Txt variant="small">
            {t('guide.checked', { done: checked.size, total: step.checklist.length })}
          </Txt>
        </Card>
      ) : null}
    </>
  );
}

export function DiyGateCard({
  gate,
  onContinue,
  onStop,
}: {
  gate: DiyGate;
  onContinue: () => void;
  onStop: () => void;
}) {
  return (
    <>
      <Txt variant="h1">{t('guide.diyTitle')}</Txt>
      <Callout kind="danger">{gate.question}</Callout>
      <Card>
        <Txt variant="h3">{t('guide.gateStop')}</Txt>
        <View style={styles.stopList}>
          {gate.stopIf.map((reason) => (
            <Callout key={reason} kind="warning">
              {reason}
            </Callout>
          ))}
        </View>
      </Card>
      <Button label={t('guide.gateShop')} icon="x-octagon" onPress={onStop} />
      <Button
        label={t('guide.gateContinue')}
        icon="check"
        variant="secondary"
        onPress={onContinue}
      />
    </>
  );
}

const styles = StyleSheet.create({
  imageFrame: {
    width: '100%',
    aspectRatio: 8 / 5,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  image: { width: '100%', height: '100%' },
  stopList: { gap: spacing.sm },
});
