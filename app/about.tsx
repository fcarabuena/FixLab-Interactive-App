import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

import { RiskCards } from '@/components/RiskCards';
import { BulletList, Card, Screen, Txt } from '@/components/ui';
import { getLinkedSources } from '@/content';
import { t } from '@/i18n';

export default function About() {
  const sources = getLinkedSources();
  const version = Constants.expoConfig?.version;

  return (
    <Screen>
      <Card>
        <Txt variant="h2">{t('about.what')}</Txt>
        <Txt>{t('about.whatBody')}</Txt>
      </Card>

      <Txt variant="h2">{t('about.disclaimer')}</Txt>
      <RiskCards />

      <Txt variant="h2">{t('about.sources')}</Txt>
      {sources.length === 0 ? <Txt variant="small">{t('about.noSources')}</Txt> : null}
      {sources.map((link) => (
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
            {t('about.sourceMeta', { source: link.source, license: link.license })}
          </Txt>
        </Card>
      ))}

      <Card>
        <Txt variant="h2">{t('about.credits')}</Txt>
        <BulletList
          items={[
            t('about.creditContent'),
            t('about.creditArt'),
            t('about.creditFont'),
            t('about.creditIcons'),
            t('about.creditBuilt'),
          ]}
        />
      </Card>

      {version ? <Txt variant="small">{t('about.version', { version })}</Txt> : null}
    </Screen>
  );
}
