import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { LAYERS, VIEW_H, VIEW_W } from '@/components/explorer/layers';
import { PartInfoPanel } from '@/components/explorer/PartInfoPanel';
import { PhoneExplorer } from '@/components/explorer/PhoneExplorer';
import { Button, ProgressBar, Screen, Txt } from '@/components/ui';
import { t } from '@/i18n';
import { spacing } from '@/theme';
import type { Part } from '@/types/content';

/** Header, text and buttons around the phone, so it fits without much scrolling. */
const CHROME_HEIGHT = 390;
const MIN_PHONE_WIDTH = 170;
const MAX_PHONE_WIDTH = 300;

export default function Explore() {
  const window = useWindowDimensions();
  const [removedCount, setRemovedCount] = useState(0);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  const phoneWidth = Math.max(
    MIN_PHONE_WIDTH,
    Math.min(MAX_PHONE_WIDTH, ((window.height - CHROME_HEIGHT) * VIEW_W) / VIEW_H),
  );

  const total = LAYERS.length;
  const topLayer = LAYERS[removedCount];
  const lastRemoved = LAYERS[removedCount - 1];
  const removeTop = () => setRemovedCount((count) => Math.min(total, count + 1));

  return (
    <Screen>
      <Txt>{t('explore.intro')}</Txt>
      <View style={styles.progress}>
        <ProgressBar progress={removedCount / total} />
        <Txt variant="small">
          {t('explore.layerProgress', { current: removedCount, total })}
        </Txt>
      </View>

      <View style={styles.stage}>
        <PhoneExplorer
          removedCount={removedCount}
          width={phoneWidth}
          onRemoveTop={removeTop}
          onSelectPart={setSelectedPart}
        />
      </View>

      <Txt variant="small">{topLayer ? t('explore.hint') : t('explore.empty')}</Txt>

      {topLayer ? (
        <Button
          label={t('explore.remove', { layer: t(`layer.${topLayer.id}`) })}
          icon="layers"
          onPress={removeTop}
        />
      ) : (
        <Button
          label={t('explore.reassemble')}
          icon="rotate-ccw"
          onPress={() => setRemovedCount(0)}
        />
      )}
      {topLayer && lastRemoved ? (
        <Button
          label={t('explore.putBack', { layer: t(`layer.${lastRemoved.id}`) })}
          icon="corner-up-left"
          variant="secondary"
          onPress={() => setRemovedCount((count) => Math.max(0, count - 1))}
        />
      ) : null}

      <Button
        label={t('explore.testYourself')}
        icon="crosshair"
        variant="secondary"
        onPress={() => router.push('/identify')}
      />

      <PartInfoPanel part={selectedPart} onClose={() => setSelectedPart(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { gap: spacing.xs },
  stage: { alignItems: 'center', paddingVertical: spacing.sm },
});
