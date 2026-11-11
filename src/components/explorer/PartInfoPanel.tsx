import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BulletList, Callout, Tabs, Txt } from '@/components/ui';
import { t } from '@/i18n';
import { colors, radius, spacing, touch } from '@/theme';
import type { Part } from '@/types/content';

const TABS = ['overview', 'symptoms', 'tools', 'safety'] as const;
type Tab = (typeof TABS)[number];

function PanelBody({ part, onClose }: { part: Part; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.header}>
        <Txt variant="h1" style={styles.flex}>
          {part.name}
        </Txt>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={onClose}
          style={styles.close}>
          <Feather name="x" size={28} color={colors.text} />
        </Pressable>
      </View>

      <Tabs
        tabs={TABS.map((id) => ({ id, label: t(`part.tab.${id}`) }))}
        selected={tab}
        onSelect={setTab}
      />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {tab === 'overview' ? <Txt>{part.description}</Txt> : null}
        {tab === 'symptoms' ? <BulletList items={part.commonSymptoms} /> : null}
        {tab === 'tools' ? <BulletList items={part.tools} /> : null}
        {tab === 'safety'
          ? part.safetyNotes.map((note) => (
              <Callout key={note} kind="warning">
                {note}
              </Callout>
            ))
          : null}
      </ScrollView>
    </View>
  );
}

export function PartInfoPanel({ part, onClose }: { part: Part | null; onClose: () => void }) {
  return (
    <Modal visible={part !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modal}>
        <Pressable
          style={styles.flex}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        />
        {part ? <PanelBody key={part.id} part={part} onClose={onClose} /> : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  modal: { flex: 1, backgroundColor: colors.backdrop },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    maxHeight: '75%',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  close: {
    width: touch.min,
    height: touch.min,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flexGrow: 0, minHeight: 180 },
  bodyContent: { gap: spacing.md, paddingBottom: spacing.sm },
});
