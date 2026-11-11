import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Tag, Txt } from '@/components/ui';
import { getBrands, getConstructionType, getModels } from '@/content';
import { t } from '@/i18n';
import { colors, radius, spacing, touch, type as typeScale } from '@/theme';
import type { PhoneModel } from '@/types/content';

function ModelCard({ model }: { model: PhoneModel }) {
  return (
    <Card
      accessibilityLabel={model.name}
      onPress={() => router.push({ pathname: '/models/[id]', params: { id: model.id } })}>
      <Txt variant="h3">{model.name}</Txt>
      <Txt variant="small">{getConstructionType(model.constructionType)?.name}</Txt>
      <View style={styles.tags}>
        {model.isSample ? <Tag label={t('common.sample')} tone="accent" /> : null}
        {model.availableRepairs.map((repair) => (
          <Tag key={repair} label={t(`repair.${repair}`)} />
        ))}
      </View>
    </Card>
  );
}

function BrandChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}>
      <Txt variant="label" style={selected && styles.chipLabelSelected}>
        {label}
      </Txt>
    </Pressable>
  );
}

export default function ModelPicker() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState<string | null>(null);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = getModels().filter(
      (m) =>
        (brand === null || m.brand === brand) &&
        (q === '' || `${m.brand} ${m.name}`.toLowerCase().includes(q)),
    );
    return getBrands()
      .map((title) => ({ title, data: matches.filter((m) => m.brand === title) }))
      .filter((section) => section.data.length > 0);
  }, [query, brand]);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      stickySectionHeadersEnabled={false}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.search}>
            <Feather name="search" size={22} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('models.searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              autoCorrect={false}
              style={styles.searchInput}
            />
          </View>
          <View style={styles.tags}>
            <BrandChip
              label={t('models.all')}
              selected={brand === null}
              onPress={() => setBrand(null)}
            />
            {getBrands().map((name) => (
              <BrandChip
                key={name}
                label={name}
                selected={brand === name}
                onPress={() => setBrand(name)}
              />
            ))}
          </View>
        </View>
      }
      renderSectionHeader={({ section }) => <Txt variant="h2">{section.title}</Txt>}
      renderItem={({ item }) => <ModelCard model={item} />}
      ItemSeparatorComponent={Separator}
      SectionSeparatorComponent={Separator}
      ListEmptyComponent={<Txt>{t('models.noResults')}</Txt>}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  header: { gap: spacing.md, marginBottom: spacing.md },
  search: {
    minHeight: touch.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchInput: { ...typeScale.body, flex: 1, minHeight: touch.compact },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: touch.compact,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipLabelSelected: { color: colors.onAccent },
  separator: { height: spacing.md },
});
