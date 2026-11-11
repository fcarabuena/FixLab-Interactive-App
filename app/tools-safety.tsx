import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BulletList, Callout, Card, Screen, Tabs, Txt, type IconName } from '@/components/ui';
import { getSafetyTopics, getTools } from '@/content';
import { t } from '@/i18n';
import { colors, spacing } from '@/theme';

const EMERGENCY_TOPIC = 'battery-emergency';

const TOPIC_ICONS: Record<string, IconName> = {
  [EMERGENCY_TOPIC]: 'alert-octagon',
  esd: 'zap',
  battery: 'battery-charging',
  workspace: 'thermometer',
};

function ToolList() {
  return (
    <>
      {getTools().map((tool) => (
        <Card key={tool.id}>
          <Txt variant="h2">{tool.name}</Txt>
          <Txt>{tool.description}</Txt>
          <Txt variant="label">{t('tools.usedFor')}</Txt>
          <Txt>{tool.usedFor}</Txt>
          <Callout kind="warning">{tool.caution}</Callout>
        </Card>
      ))}
    </>
  );
}

function SafetyList() {
  return (
    <>
      {getSafetyTopics().map((topic) => {
        const emergency = topic.id === EMERGENCY_TOPIC;
        return (
          <Card key={topic.id}>
            <View style={styles.header}>
              <Feather
                name={TOPIC_ICONS[topic.id] ?? 'shield'}
                size={26}
                color={emergency ? colors.danger : colors.accent}
              />
              <Txt variant="h2" style={styles.flex}>
                {topic.title}
              </Txt>
            </View>
            {emergency ? (
              <Callout kind="danger">{topic.summary}</Callout>
            ) : (
              <Txt variant="small">{topic.summary}</Txt>
            )}
            <BulletList items={topic.rules} />
          </Card>
        );
      })}
    </>
  );
}

export default function ToolsAndSafety() {
  const [tab, setTab] = useState<'tools' | 'safety'>('tools');

  return (
    <Screen>
      <Tabs
        tabs={[
          { id: 'tools', label: t('tools.tabTools') },
          { id: 'safety', label: t('tools.tabSafety') },
        ]}
        selected={tab}
        onSelect={setTab}
      />
      {tab === 'tools' ? <ToolList /> : <SafetyList />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
