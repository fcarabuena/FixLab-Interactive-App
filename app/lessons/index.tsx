import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card, ProgressBar, Screen, Tag, Txt } from '@/components/ui';
import { getLessons } from '@/content';
import { t } from '@/i18n';
import { useProgress } from '@/state/progress';
import { colors, spacing } from '@/theme';

export default function LessonTrack() {
  const { data } = useProgress();
  const lessons = getLessons();
  const done = lessons.filter((lesson) => data.lessons[lesson.id]?.completed).length;

  return (
    <Screen>
      <View style={styles.progress}>
        <ProgressBar progress={lessons.length > 0 ? done / lessons.length : 0} />
        <Txt variant="small">{t('lessons.progress', { done, total: lessons.length })}</Txt>
      </View>

      {lessons.map((lesson) => {
        const saved = data.lessons[lesson.id];
        return (
          <Card
            key={lesson.id}
            accessibilityLabel={lesson.title}
            onPress={() => router.push({ pathname: '/lessons/[id]', params: { id: lesson.id } })}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Txt variant="label" style={styles.number}>
                  {t('lessons.number', { number: lesson.order })}
                </Txt>
                <Txt variant="h2">{lesson.title}</Txt>
              </View>
              <Feather
                name={saved?.completed ? 'check-circle' : 'chevron-right'}
                size={28}
                color={saved?.completed ? colors.success : colors.textMuted}
              />
            </View>
            <Txt variant="small">{lesson.summary}</Txt>
            {saved ? (
              <View style={styles.tags}>
                <Tag
                  tone={saved.completed ? 'accent' : 'neutral'}
                  label={t(saved.completed ? 'lessons.statusDone' : 'lessons.statusRetry', {
                    score: saved.bestScore,
                    total: saved.total,
                  })}
                />
              </View>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  progress: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  number: { color: colors.accent },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
