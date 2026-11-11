import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GuideIntro } from '@/components/guide/GuideIntro';
import { DiyGateCard, StepContent } from '@/components/guide/StepContent';
import { Button, Callout, ProgressBar, Screen, Txt, type ScrollHandle } from '@/components/ui';
import { getGuide } from '@/content';
import { t } from '@/i18n';
import { useProgress } from '@/state/progress';
import { colors, spacing } from '@/theme';
import type { RepairGuide } from '@/types/content';

type Stage =
  | { kind: 'intro' }
  | { kind: 'step'; index: number }
  | { kind: 'shop' }
  | { kind: 'done' };

function GuideRunner({ guide, resume }: { guide: RepairGuide; resume: boolean }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollHandle>(null);
  const { data, startGuide, setGuideStep, toggleGuideCheck, completeGuide, stopGuide } =
    useProgress();

  const saved = data.guides[guide.id];
  const total = guide.steps.length;
  const savedIndex = saved?.active ? Math.min(saved.stepIndex, total - 1) : null;

  const [stage, setStage] = useState<Stage>(
    resume && savedIndex !== null ? { kind: 'step', index: savedIndex } : { kind: 'intro' },
  );
  // Kept for this visit only. The phone's condition can change between sessions,
  // so a resumed repair asks the safety question again.
  const [passedGates, setPassedGates] = useState<ReadonlySet<number>>(new Set());

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [stage, passedGates]);

  const goToStep = (index: number) => {
    setGuideStep(guide.id, index);
    setStage({ kind: 'step', index });
  };

  if (stage.kind === 'intro') {
    return (
      <GuideIntro
        guide={guide}
        resumeStep={savedIndex === null ? null : savedIndex + 1}
        onStart={() => {
          startGuide(guide.id);
          setPassedGates(new Set());
          setStage({ kind: 'step', index: 0 });
        }}
        onResume={() => {
          if (savedIndex !== null) setStage({ kind: 'step', index: savedIndex });
        }}
      />
    );
  }

  if (stage.kind === 'shop') {
    return (
      <Screen>
        <Txt variant="h1">{t('guide.shopTitle')}</Txt>
        <Callout kind="warning">{t('guide.shopBody')}</Callout>
        <Button label={t('guide.shopBack')} onPress={() => setStage({ kind: 'intro' })} />
      </Screen>
    );
  }

  if (stage.kind === 'done') {
    return (
      <Screen>
        <Txt variant="h1">{t('guide.doneTitle')}</Txt>
        <Txt>{t('guide.doneBody')}</Txt>
        <Button label={t('common.home')} icon="home" onPress={() => router.dismissTo('/')} />
      </Screen>
    );
  }

  const { index } = stage;
  const step = guide.steps[index];
  const isLast = index === total - 1;
  const gated = step.diyGate !== undefined && !passedGates.has(index);
  const checked = new Set(saved?.checks[index] ?? []);

  return (
    <View style={styles.flex}>
      <View style={styles.progress}>
        <ProgressBar progress={(index + 1) / total} />
        <Txt variant="small">{t('guide.stepOf', { current: index + 1, total })}</Txt>
      </View>

      <Screen scrollRef={scrollRef}>
        {step.diyGate && gated ? (
          <DiyGateCard
            gate={step.diyGate}
            onStop={() => {
              stopGuide(guide.id);
              setStage({ kind: 'shop' });
            }}
            onContinue={() => setPassedGates(new Set(passedGates).add(index))}
          />
        ) : (
          <StepContent
            step={step}
            checked={checked}
            onToggle={(item) => toggleGuideCheck(guide.id, index, item)}
          />
        )}
      </Screen>

      <View style={[styles.nav, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={t('guide.back')}
          variant="secondary"
          style={styles.flex}
          onPress={() => (index === 0 ? setStage({ kind: 'intro' }) : goToStep(index - 1))}
        />
        <Button
          label={isLast ? t('guide.finish') : t('guide.next')}
          style={styles.flex}
          disabled={gated}
          onPress={() => {
            if (isLast) {
              completeGuide(guide.id);
              setStage({ kind: 'done' });
            } else {
              goToStep(index + 1);
            }
          }}
        />
      </View>
    </View>
  );
}

export default function GuideScreen() {
  const { id, resume } = useLocalSearchParams<{ id: string; resume?: string }>();
  const guide = getGuide(id);

  if (!guide) {
    return (
      <Screen>
        <Txt>{t('guide.notFound')}</Txt>
      </Screen>
    );
  }

  return <GuideRunner guide={guide} resume={resume === '1'} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  progress: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  nav: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
