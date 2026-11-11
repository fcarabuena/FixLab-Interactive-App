import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Polyline } from 'react-native-svg';

import { Txt } from '@/components/ui';
import { t, type TranslationKey } from '@/i18n';
import { colors, spacing } from '@/theme';

const STROKE = { stroke: colors.text, strokeWidth: 3, fill: 'none' } as const;

const SYMBOLS: { label: TranslationKey; drawing: ReactElement }[] = [
  {
    label: 'symbol.resistor',
    drawing: <Polyline points="0,24 20,24 25,12 35,36 45,12 55,36 65,12 71,24 96,24" {...STROKE} />,
  },
  {
    label: 'symbol.capacitor',
    drawing: (
      <>
        <Line x1={0} y1={24} x2={43} y2={24} {...STROKE} />
        <Line x1={43} y1={8} x2={43} y2={40} {...STROKE} />
        <Line x1={53} y1={8} x2={53} y2={40} {...STROKE} />
        <Line x1={53} y1={24} x2={96} y2={24} {...STROKE} />
      </>
    ),
  },
  {
    label: 'symbol.inductor',
    drawing: <Path d="M0 24 H20 a7 7 0 0 1 14 0 a7 7 0 0 1 14 0 a7 7 0 0 1 14 0 a7 7 0 0 1 14 0 H96" {...STROKE} />,
  },
  {
    label: 'symbol.diode',
    drawing: (
      <>
        <Line x1={0} y1={24} x2={36} y2={24} {...STROKE} />
        <Polygon points="36,8 36,40 60,24" fill={colors.text} />
        <Line x1={60} y1={8} x2={60} y2={40} {...STROKE} />
        <Line x1={60} y1={24} x2={96} y2={24} {...STROKE} />
      </>
    ),
  },
  {
    label: 'symbol.ground',
    drawing: (
      <>
        <Line x1={48} y1={4} x2={48} y2={22} {...STROKE} />
        <Line x1={30} y1={22} x2={66} y2={22} {...STROKE} />
        <Line x1={37} y1={31} x2={59} y2={31} {...STROKE} />
        <Line x1={43} y1={40} x2={53} y2={40} {...STROKE} />
      </>
    ),
  },
  {
    label: 'symbol.testPoint',
    drawing: (
      <>
        <Line x1={0} y1={24} x2={42} y2={24} {...STROKE} />
        <Circle cx={54} cy={24} r={12} {...STROKE} />
        <Circle cx={54} cy={24} r={4} fill={colors.text} />
      </>
    ),
  },
];

/** Original chart of common schematic symbols, used in the circuit diagrams lesson. */
export function CircuitSymbols() {
  return (
    <View style={styles.grid}>
      {SYMBOLS.map(({ label, drawing }) => (
        <View key={label} style={styles.cell}>
          <Svg width={96} height={48} viewBox="0 0 96 48" accessibilityLabel={t(label)}>
            {drawing}
          </Svg>
          <Txt variant="label">{t(label)}</Txt>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    rowGap: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cell: { width: 104, alignItems: 'center', gap: spacing.xs },
});
