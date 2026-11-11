import { StyleSheet, View } from 'react-native';

import { BulletList, Button, Callout, Card, Screen, Tag, Txt } from '@/components/ui';
import { t } from '@/i18n';
import { spacing } from '@/theme';
import type { RepairGuide } from '@/types/content';

export function GuideIntro({
  guide,
  resumeStep,
  onStart,
  onResume,
}: {
  guide: RepairGuide;
  /** Step number to continue from, or null if no repair is under way. */
  resumeStep: number | null;
  onStart: () => void;
  onResume: () => void;
}) {
  return (
    <Screen>
      <Txt variant="h1">{guide.title}</Txt>
      <View style={styles.tags}>
        <Tag label={t('common.sample')} tone="accent" />
        <Tag label={t(`difficulty.${guide.difficulty}`)} />
        <Tag label={guide.estimatedTime} />
      </View>

      <Card>
        <Txt variant="h2">{t('guide.diyTitle')}</Txt>
        <Callout kind="info">{guide.diyCheck.summary}</Callout>
        <Txt variant="h3">{t('guide.shopIf')}</Txt>
        <BulletList items={guide.diyCheck.goToShopIf} />
      </Card>

      <Card>
        <Txt variant="h2">{t('guide.tools')}</Txt>
        <BulletList items={guide.tools} />
      </Card>

      <Card>
        <Txt variant="h2">{t('guide.parts')}</Txt>
        <BulletList items={guide.parts} />
      </Card>

      {resumeStep === null ? (
        <Button label={t('guide.start')} icon="arrow-right" onPress={onStart} />
      ) : (
        <>
          <Button
            label={t('guide.continue', { step: resumeStep })}
            icon="arrow-right"
            onPress={onResume}
          />
          <Button
            label={t('guide.startOver')}
            icon="rotate-ccw"
            variant="secondary"
            onPress={onStart}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
