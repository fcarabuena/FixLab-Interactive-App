import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { findTappedPart } from '@/components/explorer/hitTest';
import { LAYERS, VIEW_H, VIEW_W } from '@/components/explorer/layers';
import { PhoneStack } from '@/components/explorer/PhoneExplorer';
import { Button, Callout, ProgressBar, Screen, Tag, Txt } from '@/components/ui';
import { getIdentifyTargets } from '@/content';
import { t } from '@/i18n';
import { useProgress } from '@/state/progress';
import { colors, spacing } from '@/theme';
import type { IdentifyTarget } from '@/types/content';

const HEADER_HEIGHT = 56;
const PROMPT_HEIGHT = 84;
const PANEL_HEIGHT = 176;
const MIN_PHONE_WIDTH = 160;
const MAX_PHONE_WIDTH = 300;
const MAX_WRONG_TAPS = 2;

type Feedback =
  | { kind: 'idle' }
  | { kind: 'wrong'; tapped: IdentifyTarget | null }
  | { kind: 'correct' }
  | { kind: 'revealed' };

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Works through the phone from the outside in, in a new order within each layer. */
function buildDeck(): IdentifyTarget[] {
  const targets = getIdentifyTargets();
  return LAYERS.flatMap((layer) => shuffled(targets.filter((t2) => t2.layer === layer.id)));
}

const layerIndex = (target: IdentifyTarget) => LAYERS.findIndex((l) => l.id === target.layer);

function ZoneOutlines({
  target,
  scale,
  color,
}: {
  target: IdentifyTarget;
  scale: number;
  color: string;
}) {
  return target.zones.map((zone) => (
    <View
      key={`${zone.x}-${zone.y}`}
      pointerEvents="none"
      style={[
        styles.outline,
        {
          left: zone.x * scale - 3,
          top: zone.y * scale - 3,
          width: zone.w * scale + 6,
          height: zone.h * scale + 6,
          borderColor: color,
        },
      ]}
    />
  ));
}

function FeedbackMessage({
  feedback,
  target,
}: {
  feedback: Feedback;
  target: IdentifyTarget;
}) {
  if (feedback.kind === 'correct') {
    return (
      <>
        <View style={styles.correctRow}>
          <Feather name="check-circle" size={24} color={colors.success} />
          <Txt variant="h3">{t('identify.correct')}</Txt>
        </View>
        <Txt>{target.fact}</Txt>
      </>
    );
  }
  if (feedback.kind === 'revealed') {
    return (
      <>
        <Txt variant="h3">{t('identify.revealed')}</Txt>
        <Txt>{target.fact}</Txt>
      </>
    );
  }
  if (feedback.kind === 'wrong') {
    return (
      <>
        <Callout kind="warning">
          {feedback.tapped
            ? t('identify.wrongPart', { part: feedback.tapped.name })
            : t('identify.wrongSpot')}
        </Callout>
        <Txt variant="small">{target.clue}</Txt>
      </>
    );
  }
  return (
    <>
      <Txt variant="h3">{t('identify.tapPrompt')}</Txt>
      <Txt>{target.clue}</Txt>
    </>
  );
}

function Simulation({ onRetry }: { onRetry: () => void }) {
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { data, recordIdentify } = useProgress();

  const [deck] = useState(buildDeck);
  const [index, setIndex] = useState(0);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>({ kind: 'idle' });
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  // The touch-down event carries the position on every platform; the press event may not.
  const touchPoint = useRef({ x: 0, y: 0 });

  const total = deck.length;

  if (finished) {
    return (
      <Screen>
        <Txt variant="h1">{t('identify.doneTitle')}</Txt>
        <Txt variant="h2">{t('identify.score', { score, total })}</Txt>
        {data.identifyBest ? (
          <Callout kind="info">
            {t('identify.best', {
              score: data.identifyBest.score,
              total: data.identifyBest.total,
            })}
          </Callout>
        ) : null}
        <Button label={t('identify.retry')} icon="rotate-ccw" onPress={onRetry} />
        <Button
          label={t('common.home')}
          icon="home"
          variant="secondary"
          onPress={() => router.dismissTo('/')}
        />
      </Screen>
    );
  }

  const target = deck[index];
  const removedCount = layerIndex(target);
  const answered = feedback.kind === 'correct' || feedback.kind === 'revealed';
  const isLast = index === total - 1;

  const available =
    window.height - HEADER_HEIGHT - insets.top - insets.bottom - PROMPT_HEIGHT - PANEL_HEIGHT - 24;
  const width = Math.max(
    MIN_PHONE_WIDTH,
    Math.min(MAX_PHONE_WIDTH, (available * VIEW_W) / VIEW_H),
  );
  const size = { width, height: (width * VIEW_H) / VIEW_W };
  const scale = width / VIEW_W;

  const rememberTouch = (event: GestureResponderEvent) => {
    touchPoint.current = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY };
  };

  const handleTap = () => {
    if (answered) return;
    const tapped = findTappedPart(
      getIdentifyTargets(),
      removedCount,
      touchPoint.current.x / scale,
      touchPoint.current.y / scale,
    );
    if (tapped && (tapped.id === target.id || target.includes?.includes(tapped.id))) {
      if (wrongTaps === 0) setScore(score + 1);
      setFeedback({ kind: 'correct' });
      return;
    }
    const wrong = wrongTaps + 1;
    setWrongTaps(wrong);
    setFeedback(wrong >= MAX_WRONG_TAPS ? { kind: 'revealed' } : { kind: 'wrong', tapped });
  };

  const goNext = () => {
    if (isLast) {
      recordIdentify(score, total);
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setWrongTaps(0);
    setFeedback({ kind: 'idle' });
  };

  return (
    <View style={styles.flex}>
      <View style={styles.prompt}>
        <ProgressBar progress={(index + 1) / total} />
        <View style={styles.statusRow}>
          <Txt variant="small">{t('identify.progress', { current: index + 1, total })}</Txt>
          <Tag label={t('identify.layer', { layer: t(`layer.${target.layer}`) })} />
        </View>
        <Txt variant="h2" numberOfLines={1}>
          {t('identify.find', { part: target.name })}
        </Txt>
      </View>

      <View style={styles.stage}>
        <View style={size}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('identify.find', { part: target.name })}
            onPressIn={rememberTouch}
            onPress={handleTap}
            style={StyleSheet.absoluteFill}>
            <PhoneStack removedCount={removedCount} size={size} />
          </Pressable>
          {feedback.kind === 'wrong' && feedback.tapped ? (
            <ZoneOutlines target={feedback.tapped} scale={scale} color={colors.warningBorder} />
          ) : null}
          {answered ? (
            <ZoneOutlines
              target={target}
              scale={scale}
              color={feedback.kind === 'correct' ? colors.success : colors.accent}
            />
          ) : null}
        </View>
      </View>

      <View style={[styles.panel, { height: PANEL_HEIGHT + insets.bottom, paddingBottom: insets.bottom + spacing.md }]}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.panelContent}>
          <FeedbackMessage feedback={feedback} target={target} />
        </ScrollView>
        {answered ? (
          <Button
            label={t(isLast ? 'identify.seeResult' : 'identify.next')}
            icon="arrow-right"
            onPress={goNext}
          />
        ) : null}
      </View>
    </View>
  );
}

export default function Identify() {
  const [run, setRun] = useState(0);
  return <Simulation key={run} onRetry={() => setRun(run + 1)} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  prompt: { height: PROMPT_HEIGHT, paddingHorizontal: spacing.lg, gap: spacing.xs },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  outline: { position: 'absolute', borderWidth: 4, borderRadius: 10 },
  panel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  panelContent: { gap: spacing.xs },
  correctRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
