import { Feather } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Button, Card, Screen, Txt, type IconName } from '@/components/ui';
import { getGuide, getLesson, getLessons } from '@/content';
import { t, type TranslationKey } from '@/i18n';
import { useProgress, type ProgressData } from '@/state/progress';
import { colors, radius, spacing } from '@/theme';

const LINKS: { icon: IconName; title: TranslationKey; hint: TranslationKey; href: Href }[] = [
  { icon: 'book-open', title: 'home.lessons', hint: 'home.lessonsHint', href: '/lessons' },
  { icon: 'search', title: 'home.findModel', hint: 'home.findModelHint', href: '/models' },
  { icon: 'layers', title: 'home.explore', hint: 'home.exploreHint', href: '/explore' },
  { icon: 'crosshair', title: 'home.identify', hint: 'home.identifyHint', href: '/identify' },
  { icon: 'shield', title: 'home.toolsSafety', hint: 'home.toolsSafetyHint', href: '/tools-safety' },
  { icon: 'info', title: 'home.about', hint: 'home.aboutHint', href: '/about' },
];

interface ContinueTarget {
  id: string;
  title: string;
  detail: string;
  open: () => void;
}

function findContinueTarget(data: ProgressData): ContinueTarget | null {
  if (!data.last) return null;
  const { id, kind } = data.last;

  if (kind === 'guide') {
    const guide = getGuide(id);
    const saved = data.guides[id];
    if (!guide || !saved?.active) return null;
    return {
      id,
      title: guide.title,
      detail: t('home.continueStep', {
        current: Math.min(saved.stepIndex + 1, guide.steps.length),
        total: guide.steps.length,
      }),
      open: () => router.push({ pathname: '/guides/[id]', params: { id, resume: '1' } }),
    };
  }

  const lesson = getLesson(id);
  if (!lesson || data.lessons[id]?.completed) return null;
  return {
    id,
    title: lesson.title,
    detail: t('lessons.number', { number: lesson.order }),
    open: () => router.push({ pathname: '/lessons/[id]', params: { id } }),
  };
}

export default function Home() {
  const { data } = useProgress();
  const resume = findContinueTarget(data);
  const featured = getLessons().find(
    (lesson) => !data.lessons[lesson.id]?.completed && lesson.id !== resume?.id,
  );

  return (
    <Screen noHeader>
      <View>
        <Txt variant="display" style={styles.brand}>
          {t('app.name')}
        </Txt>
        <Txt variant="h3">{t('home.tagline')}</Txt>
      </View>

      <LanguageSwitch />

      {resume ? (
        <Card style={styles.feature}>
          <Txt variant="label" style={styles.featureLabel}>
            {t('home.continue')}
          </Txt>
          <Txt variant="h1">{resume.title}</Txt>
          <Txt variant="small">{resume.detail}</Txt>
          <Button label={t('home.continueCta')} icon="arrow-right" onPress={resume.open} />
        </Card>
      ) : null}

      {featured ? (
        <Card style={styles.feature}>
          <Txt variant="label" style={styles.featureLabel}>
            {t('home.featuredLesson')}
          </Txt>
          <Txt variant="h1">{featured.title}</Txt>
          <Txt variant="small">{featured.summary}</Txt>
          <Button
            label={t('home.startLesson')}
            icon="arrow-right"
            variant={resume ? 'secondary' : 'primary'}
            onPress={() =>
              router.push({ pathname: '/lessons/[id]', params: { id: featured.id } })
            }
          />
        </Card>
      ) : null}

      <Txt variant="h2">{t('home.quickLinks')}</Txt>
      {LINKS.map((link) => (
        <Card
          key={link.title}
          onPress={() => router.push(link.href)}
          accessibilityLabel={t(link.title)}
          style={styles.link}>
          <View style={styles.linkIcon}>
            <Feather name={link.icon} size={26} color={colors.accent} />
          </View>
          <View style={styles.flex}>
            <Txt variant="h3">{t(link.title)}</Txt>
            <Txt variant="small">{t(link.hint)}</Txt>
          </View>
          <Feather name="chevron-right" size={26} color={colors.textMuted} />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  brand: { color: colors.accent },
  feature: { gap: spacing.md },
  featureLabel: { color: colors.accent },
  link: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  linkIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
