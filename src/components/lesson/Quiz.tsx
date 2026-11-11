import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Callout, ProgressBar, Txt } from '@/components/ui';
import { t } from '@/i18n';
import { colors, radius, spacing, touch } from '@/theme';
import type { QuizQuestion } from '@/types/content';

export function Quiz({
  questions,
  onFinish,
}: {
  questions: QuizQuestion[];
  onFinish: (score: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const question = questions[index];
  const total = questions.length;
  const answered = chosen !== null;
  const isLast = index === total - 1;

  const choose = (option: number) => {
    if (answered) return;
    setChosen(option);
    if (option === question.correctIndex) setScore((s) => s + 1);
  };

  const advance = () => {
    if (isLast) {
      onFinish(score);
      return;
    }
    setIndex(index + 1);
    setChosen(null);
  };

  return (
    <>
      <View style={styles.progress}>
        <ProgressBar progress={(index + 1) / total} />
        <Txt variant="small">{t('quiz.questionOf', { current: index + 1, total })}</Txt>
      </View>

      <Txt variant="h1">{question.question}</Txt>

      {question.options.map((option, i) => {
        const isCorrect = answered && i === question.correctIndex;
        const isWrong = answered && i === chosen && !isCorrect;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ disabled: answered }}
            disabled={answered}
            onPress={() => choose(i)}
            style={[styles.option, isCorrect && styles.correct, isWrong && styles.wrong]}>
            <Txt style={styles.flex}>{option}</Txt>
            {isCorrect ? <Feather name="check-circle" size={24} color={colors.success} /> : null}
            {isWrong ? <Feather name="x-circle" size={24} color={colors.danger} /> : null}
          </Pressable>
        );
      })}

      {answered ? (
        <>
          <Callout kind={chosen === question.correctIndex ? 'info' : 'warning'}>
            {`${t(chosen === question.correctIndex ? 'quiz.correct' : 'quiz.incorrect')} ${question.explanation}`}
          </Callout>
          <Button
            label={t(isLast ? 'quiz.seeResult' : 'quiz.next')}
            icon="arrow-right"
            onPress={advance}
          />
        </>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  progress: { gap: spacing.xs },
  option: {
    minHeight: touch.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  correct: { backgroundColor: colors.successBg, borderColor: colors.success },
  wrong: { backgroundColor: colors.dangerBg, borderColor: colors.danger },
});
