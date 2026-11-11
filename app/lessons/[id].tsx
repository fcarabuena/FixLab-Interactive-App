import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { CircuitSymbols } from '@/components/lesson/CircuitSymbols';
import { Quiz } from '@/components/lesson/Quiz';
import { Button, Callout, Card, Screen, Txt, type ScrollHandle } from '@/components/ui';
import { getLesson, getLessons } from '@/content';
import { t } from '@/i18n';
import { passingScore, useProgress } from '@/state/progress';
import type { Lesson } from '@/types/content';

type Stage = { kind: 'read' } | { kind: 'quiz' } | { kind: 'result'; score: number };

function LessonRunner({ lesson }: { lesson: Lesson }) {
  const { openLesson, recordQuiz } = useProgress();
  const scrollRef = useRef<ScrollHandle>(null);
  const [stage, setStage] = useState<Stage>({ kind: 'read' });

  useEffect(() => {
    openLesson(lesson.id);
  }, [lesson.id, openLesson]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [stage]);

  const total = lesson.quiz.length;
  const lessons = getLessons();
  const next = lessons[lessons.findIndex((l) => l.id === lesson.id) + 1];

  return (
    <Screen scrollRef={scrollRef}>
      <Stack.Screen options={{ title: t('lessons.number', { number: lesson.order }) }} />

      {stage.kind === 'read' ? (
        <>
          <Txt variant="h1">{lesson.title}</Txt>
          <Txt>{lesson.summary}</Txt>
          {lesson.sections.map((section) => (
            <Card key={section.heading}>
              <Txt variant="h2">{section.heading}</Txt>
              <Txt>{section.body}</Txt>
              {section.diagram === 'circuit-symbols' ? <CircuitSymbols /> : null}
            </Card>
          ))}
          <Button
            label={t('lesson.startQuiz')}
            icon="arrow-right"
            onPress={() => setStage({ kind: 'quiz' })}
          />
        </>
      ) : null}

      {stage.kind === 'quiz' ? (
        <Quiz
          questions={lesson.quiz}
          onFinish={(score) => {
            recordQuiz(lesson.id, score, total);
            setStage({ kind: 'result', score });
          }}
        />
      ) : null}

      {stage.kind === 'result' ? (
        <>
          <Txt variant="h1">
            {t(stage.score >= passingScore(total) ? 'quiz.passTitle' : 'quiz.failTitle')}
          </Txt>
          <Txt variant="h2">{t('quiz.score', { score: stage.score, total })}</Txt>
          {stage.score >= passingScore(total) ? (
            <Callout kind="info">{t('quiz.passBody')}</Callout>
          ) : (
            <>
              <Callout kind="warning">
                {t('quiz.failBody', { needed: passingScore(total), total })}
              </Callout>
              <Button
                label={t('quiz.retry')}
                icon="rotate-ccw"
                onPress={() => setStage({ kind: 'read' })}
              />
            </>
          )}
          {stage.score >= passingScore(total) && next ? (
            <Button
              label={t('quiz.nextLesson')}
              icon="arrow-right"
              onPress={() => router.replace({ pathname: '/lessons/[id]', params: { id: next.id } })}
            />
          ) : null}
          <Button
            label={t('quiz.backToLessons')}
            variant="secondary"
            onPress={() => router.dismissTo('/lessons')}
          />
        </>
      ) : null}
    </Screen>
  );
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = getLesson(id);

  if (!lesson) {
    return (
      <Screen>
        <Txt>{t('lesson.notFound')}</Txt>
      </Screen>
    );
  }

  return <LessonRunner key={lesson.id} lesson={lesson} />;
}
