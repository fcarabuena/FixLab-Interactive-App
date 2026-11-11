import { Feather } from '@expo/vector-icons';
import {
  useEffect,
  type ComponentProps,
  type ComponentRef,
  type ReactNode,
  type Ref,
} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, touch, type as typeScale } from '@/theme';

export type IconName = ComponentProps<typeof Feather>['name'];
export type ScrollHandle = ComponentRef<typeof ScrollView>;

export function Txt({
  variant = 'body',
  style,
  ...rest
}: TextProps & { variant?: keyof typeof typeScale }) {
  return <Text {...rest} style={[typeScale[variant], style]} />;
}

interface ScreenProps {
  children: ReactNode;
  /** Set when the screen has no navigation header above it. */
  noHeader?: boolean;
  scrollRef?: Ref<ScrollHandle>;
}

export function Screen({ children, noHeader, scrollRef }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      ref={scrollRef}
      style={styles.flex}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.screen,
        { paddingTop: noHeader ? insets.top + spacing.xl : spacing.sm },
        { paddingBottom: insets.bottom + spacing.xl },
      ]}>
      {children}
    </ScrollView>
  );
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', icon, disabled, style }: ButtonProps) {
  const primary = variant === 'primary';
  const contentColor = disabled ? colors.textMuted : primary ? colors.onAccent : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonSecondary,
        pressed && (primary ? styles.buttonPrimaryPressed : styles.buttonSecondaryPressed),
        disabled && styles.buttonDisabled,
        style,
      ]}>
      {icon ? <Feather name={icon} size={22} color={contentColor} /> : null}
      <Text style={[styles.buttonLabel, { color: contentColor }]}>{label}</Text>
    </Pressable>
  );
}

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, onPress, accessibilityLabel, style }: CardProps) {
  if (!onPress) return <View style={[styles.card, style]}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed, style]}>
      {children}
    </Pressable>
  );
}

export function Tag({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'accent' }) {
  return (
    <View style={[styles.tag, tone === 'accent' && styles.tagAccent]}>
      <Text style={[styles.tagLabel, tone === 'accent' && styles.tagLabelAccent]}>{label}</Text>
    </View>
  );
}

export function Tabs<T extends string>({
  tabs,
  selected,
  onSelect,
}: {
  tabs: { id: T; label: string }[];
  selected: T;
  onSelect: (id: T) => void;
}) {
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {tabs.map(({ id, label }) => {
        const isSelected = id === selected;
        return (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(id)}
            style={[styles.tab, isSelected && styles.tabSelected]}>
            <Text style={[typeScale.label, isSelected && styles.tabLabelSelected]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const CALLOUTS = {
  info: { icon: 'info', bg: colors.surfaceMuted, border: colors.border, fg: colors.text },
  warning: {
    icon: 'alert-triangle',
    bg: colors.warningBg,
    border: colors.warningBorder,
    fg: colors.warning,
  },
  danger: {
    icon: 'alert-octagon',
    bg: colors.dangerBg,
    border: colors.dangerBorder,
    fg: colors.danger,
  },
} as const;

export function Callout({
  kind,
  children,
}: {
  kind: keyof typeof CALLOUTS;
  children: ReactNode;
}) {
  const c = CALLOUTS[kind];
  return (
    <View style={[styles.callout, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Feather name={c.icon} size={22} color={c.fg} style={styles.calloutIcon} />
      <Text style={[typeScale.body, styles.flex, { color: c.fg }]}>{children}</Text>
    </View>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.bullets}>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <Txt style={styles.flex}>{item}</Txt>
        </View>
      ))}
    </View>
  );
}

export function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      style={styles.checkRow}>
      <View style={[styles.checkBox, checked && styles.checkBoxOn]}>
        {checked ? <Feather name="check" size={20} color={colors.onAccent} /> : null}
      </View>
      <Txt style={styles.flex}>{label}</Txt>
    </Pressable>
  );
}

export function ProgressBar({ progress }: { progress: number }) {
  const value = useSharedValue(progress);

  useEffect(() => {
    value.value = withTiming(progress, { duration: 250 });
  }, [progress, value]);

  const fill = useAnimatedStyle(() => ({ width: `${value.value * 100}%` }));

  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
      <Animated.View style={[styles.fill, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  button: {
    minHeight: touch.min,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonPrimary: { backgroundColor: colors.accent },
  buttonPrimaryPressed: { backgroundColor: colors.accentPressed },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  buttonSecondaryPressed: { backgroundColor: colors.surfaceMuted },
  buttonDisabled: { backgroundColor: colors.disabled, borderColor: colors.disabled },
  buttonLabel: { fontSize: 18, lineHeight: 24, fontWeight: '700', textAlign: 'center', flexShrink: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardPressed: { backgroundColor: colors.surfaceMuted },
  tag: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tagAccent: { backgroundColor: colors.accentSoft },
  tagLabel: { ...typeScale.label },
  tagLabelAccent: { color: colors.accentPressed },
  tabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    minHeight: touch.compact,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  tabSelected: { backgroundColor: colors.accent },
  tabLabelSelected: { color: colors.onAccent },
  callout: {
    flexDirection: 'row',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  calloutIcon: { marginTop: 2 },
  bullets: { gap: spacing.sm },
  bulletRow: { flexDirection: 'row', gap: spacing.md },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 9,
    backgroundColor: colors.accent,
  },
  checkRow: {
    minHeight: touch.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  checkBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  track: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.accent },
});
