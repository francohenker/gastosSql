import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, useColors, useThemedStyles } from './theme';
import { money } from '../utils/format';

export default function BudgetBar({ name, color, spent, budget }: { name: string; color: string; spent: number; budget: number | null }) {
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  const ratio = budget ? spent / budget : 0;
  const barColor = ratio > 1 ? colors.expense : ratio >= 0.8 ? colors.warn : color;
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text style={s.name}>{name}</Text>
        <Text style={[s.amt, ratio > 1 && { color: colors.expense }]}>
          {money(spent)}{budget ? ` / ${money(budget)}` : ''}
        </Text>
      </View>
      {budget ? (
        <View style={s.track}>
          <View style={[s.fill, { width: `${Math.min(ratio, 1) * 100}%`, backgroundColor: barColor }]} />
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  wrap: { marginBottom: 14 },
  head: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontWeight: '600', color: colors.text },
  amt: { color: colors.muted },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
});
