import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg from 'react-native-svg';

import { getPart } from '@/content';
import { t } from '@/i18n';
import { illustration, touch } from '@/theme';
import type { Part } from '@/types/content';

import { FrameDrawing, LAYERS, VIEW_H, VIEW_W, type Hotspot } from './layers';

export interface Size {
  width: number;
  height: number;
}

function PhoneSvg({ size, children }: { size: Size; children: ReactNode }) {
  return (
    <Svg width={size.width} height={size.height} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
      {children}
    </Svg>
  );
}

function AnimatedLayer({
  removed,
  size,
  children,
}: {
  removed: boolean;
  size: Size;
  children: ReactNode;
}) {
  const progress = useSharedValue(removed ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(removed ? 1 : 0, { duration: 380 });
  }, [removed, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: progress.value * size.width * 0.8 },
      { translateY: progress.value * -24 },
      { rotate: `${progress.value * 12}deg` },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <PhoneSvg size={size}>{children}</PhoneSvg>
    </Animated.View>
  );
}

/** The frame and every layer, with removed layers animated off the phone. */
export function PhoneStack({ removedCount, size }: { removedCount: number; size: Size }) {
  return (
    <>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <PhoneSvg size={size}>
          <FrameDrawing />
        </PhoneSvg>
      </View>
      {/* Inner layers draw first so the outer layers end up on top. */}
      {[...LAYERS].reverse().map((layer) => (
        <AnimatedLayer key={layer.id} size={size} removed={LAYERS.indexOf(layer) < removedCount}>
          <layer.Drawing />
        </AnimatedLayer>
      ))}
    </>
  );
}

function HotspotDot({
  hotspot,
  scale,
  onPress,
}: {
  hotspot: Hotspot;
  scale: number;
  onPress: () => void;
}) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1100 }), -1, false);
  }, [pulse]);

  const ring = useAnimatedStyle(() => ({
    opacity: 0.6 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 1.1 }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={getPart(hotspot.partId)?.name}
      onPress={onPress}
      style={[
        styles.hotspot,
        { left: hotspot.x * scale - touch.min / 2, top: hotspot.y * scale - touch.min / 2 },
      ]}>
      <Animated.View style={[styles.hotspotRing, ring]} />
      <View style={styles.hotspotDot}>
        <View style={styles.hotspotCore} />
      </View>
    </Pressable>
  );
}

interface PhoneExplorerProps {
  /** How many layers have been taken off, counted from the outside. */
  removedCount: number;
  width: number;
  onRemoveTop: () => void;
  onSelectPart: (part: Part) => void;
}

export function PhoneExplorer({
  removedCount,
  width,
  onRemoveTop,
  onSelectPart,
}: PhoneExplorerProps) {
  const size = { width, height: (width * VIEW_H) / VIEW_W };
  const scale = width / VIEW_W;
  const topLayer = LAYERS[removedCount];

  return (
    <View style={size}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          topLayer ? t('explore.remove', { layer: t(`layer.${topLayer.id}`) }) : undefined
        }
        disabled={!topLayer}
        onPress={onRemoveTop}
        style={StyleSheet.absoluteFill}>
        <PhoneStack removedCount={removedCount} size={size} />
      </Pressable>
      {topLayer?.hotspots.map((hotspot) => (
        <HotspotDot
          key={hotspot.partId}
          hotspot={hotspot}
          scale={scale}
          onPress={() => {
            const part = getPart(hotspot.partId);
            if (part) onSelectPart(part);
          }}
        />
      ))}
    </View>
  );
}

const DOT = 30;

const styles = StyleSheet.create({
  hotspot: {
    position: 'absolute',
    width: touch.min,
    height: touch.min,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotspotRing: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: illustration.hotspot,
  },
  hotspotDot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 3,
    borderColor: illustration.hotspotCore,
    backgroundColor: illustration.hotspot,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotspotCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: illustration.hotspotCore,
  },
});
