import { Feather } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { StyleSheet, View } from 'react-native';

import { BulletList, Button, Callout, Card, Screen, Tag, Txt } from '@/components/ui';
import { findGuideFor, getConstructionType, getModel, getPart } from '@/content';
import { t } from '@/i18n';
import { colors, spacing } from '@/theme';

export default function ModelDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const model = getModel(id);

  if (!model) {
    return (
      <Screen>
        <Txt>{t('model.notFound')}</Txt>
      </Screen>
    );
  }

  const construction = getConstructionType(model.constructionType);
  const partNames = model.parts.flatMap((partId) => getPart(partId)?.name ?? []);

  return (
    <Screen>
      <Stack.Screen options={{ title: model.brand }} />
      <Txt variant="h1">{model.name}</Txt>
      <View style={styles.tags}>
        {model.isSample ? <Tag label={t('common.sample')} tone="accent" /> : null}
        <Tag label={t(`difficulty.${model.difficulty}`)} />
      </View>
      {model.isSample ? <Callout kind="info">{t('model.sampleNote')}</Callout> : null}

      {construction ? (
        <Card>
          <Txt variant="h2">{t('model.construction')}</Txt>
          <Txt variant="h3">{construction.name}</Txt>
          <Txt>{construction.description}</Txt>
          <Txt variant="h3">{t('model.opening')}</Txt>
          <Txt>{construction.openingMethod}</Txt>
          <Txt variant="h3">{t('model.risks')}</Txt>
          <BulletList items={construction.riskNotes} />
        </Card>
      ) : null}

      <Txt variant="h2">{t('model.repairs')}</Txt>
      {model.availableRepairs.map((repair) => {
        const guide = findGuideFor(model, repair);
        return (
          <Card
            key={repair}
            accessibilityLabel={t(`repair.${repair}`)}
            onPress={
              guide
                ? () => router.push({ pathname: '/guides/[id]', params: { id: guide.id } })
                : undefined
            }
            style={styles.repair}>
            <View style={styles.flex}>
              <Txt variant="h3">{t(`repair.${repair}`)}</Txt>
              <Txt variant="small">
                {guide ? `${guide.title} · ${guide.estimatedTime}` : t('model.guideComing')}
              </Txt>
            </View>
            {guide ? <Feather name="chevron-right" size={26} color={colors.textMuted} /> : null}
          </Card>
        );
      })}

      <Card>
        <Txt variant="h2">{t('model.parts')}</Txt>
        <BulletList items={partNames} />
      </Card>
      <Button
        label={t('model.explore')}
        icon="layers"
        variant="secondary"
        onPress={() => router.push('/explore')}
      />

      {model.externalLinks.length > 0 ? (
        <>
          <Txt variant="h2">{t('model.links')}</Txt>
          {model.externalLinks.map((link) => (
            <Card
              key={link.url}
              accessibilityLabel={link.title}
              onPress={() => {
                WebBrowser.openBrowserAsync(link.url).catch((error: unknown) => {
                  console.warn('Could not open link', error);
                });
              }}>
              <Txt variant="h3">{link.title}</Txt>
              <Txt variant="small">
                {t('model.linkMeta', { source: link.source, license: link.license })}
              </Txt>
            </Card>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  repair: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
