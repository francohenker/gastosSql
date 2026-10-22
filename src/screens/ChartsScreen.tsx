import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-gifted-charts';
import MonthPicker from '../components/MonthPicker';
import { Card, Empty } from '../components/ui';
import { useMonth } from '../components/MonthContext';
import { Colors, useColors, useThemedStyles } from '../components/theme';
import { categoryTotals } from '../db/repo/categories';
import { CategoryTotal } from '../db/types';
import { money } from '../utils/format';

export default function ChartsScreen() {
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  const { month } = useMonth();
  const [cats, setCats] = useState<CategoryTotal[]>([]);
  useFocusEffect(useCallback(() => { categoryTotals(month).then(setCats); }, [month]));

  const spent = cats.filter((c) => c.spent > 0);
  const total = spent.reduce((a, c) => a + c.spent, 0);
  const data = spent.map((c) => ({ value: c.spent, color: c.color }));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      <MonthPicker />
      <Card>
        {spent.length === 0 ? (
          <Empty text="No hay gastos para graficar" />
        ) : (
          <>
            <View style={{ alignItems: 'center', marginVertical: 12 }}>
              <PieChart
                data={data}
                donut
                radius={110}
                innerRadius={65}
                innerCircleColor={colors.card}
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>Total</Text>
                    <Text style={{ fontWeight: '700', fontSize: 16, color: colors.text }}>{money(total)}</Text>
                  </View>
                )}
              />
            </View>
            {spent.map((c) => (
              <View key={c.id} style={s.row}>
                <View style={[s.dot, { backgroundColor: c.color }]} />
                <Text style={s.name}>{c.name}</Text>
                <Text style={s.pct}>{((c.spent / total) * 100).toFixed(0)}%</Text>
                <Text style={s.amt}>{money(c.spent)}</Text>
              </View>
            ))}
          </>
        )}
      </Card>
    </ScrollView>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  name: { flex: 1, color: colors.text },
  pct: { color: colors.muted, width: 48, textAlign: 'right' },
  amt: { fontWeight: '600', color: colors.text, width: 100, textAlign: 'right' },
});
