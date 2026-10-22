import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMonth } from './MonthContext';
import { monthLabel, shiftMonth } from '../utils/format';
import { Colors, useColors, useThemedStyles } from './theme';

export default function MonthPicker() {
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  const { month, setMonth } = useMonth();
  return (
    <View style={s.row}>
      <Pressable onPress={() => setMonth(shiftMonth(month, -1))} hitSlop={12}>
        <Text style={s.arrow}>‹</Text>
      </Pressable>
      <Text style={s.label}>{monthLabel(month)}</Text>
      <Pressable onPress={() => setMonth(shiftMonth(month, 1))} hitSlop={12}>
        <Text style={s.arrow}>›</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 8 },
  arrow: { fontSize: 32, color: colors.primary, paddingHorizontal: 16 },
  label: { fontSize: 18, fontWeight: '600', color: colors.text },
});
