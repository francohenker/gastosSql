import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MonthPicker from '../components/MonthPicker';
import BudgetBar from '../components/BudgetBar';
import { Card, Empty } from '../components/ui';
import { useMonth } from '../components/MonthContext';
import { Colors, useColors, useThemedStyles } from '../components/theme';
import { monthSummary, MonthSummary } from '../db/repo/summary';
import { categoryTotals } from '../db/repo/categories';
import { CategoryTotal } from '../db/types';
import { money } from '../utils/format';

export default function HomeScreen() {
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  const { month } = useMonth();
  const [sum, setSum] = useState<MonthSummary>({ income: 0, expense: 0, balance: 0 });
  const [cats, setCats] = useState<CategoryTotal[]>([]);

  useFocusEffect(
    useCallback(() => {
      monthSummary(month).then(setSum);
      categoryTotals(month).then(setCats);
    }, [month]),
  );

  const visible = cats.filter((c) => c.spent > 0 || c.monthly_budget);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      <MonthPicker />
      <Card>
        <Text style={s.small}>Balance del mes</Text>
        <Text style={[s.balance, { color: sum.balance >= 0 ? colors.income : colors.expense }]}>{money(sum.balance)}</Text>
        <View style={s.row}>
          <View>
            <Text style={s.small}>Ingresos</Text>
            <Text style={[s.amt, { color: colors.income }]}>{money(sum.income)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.small}>Gastos</Text>
            <Text style={[s.amt, { color: colors.expense }]}>{money(sum.expense)}</Text>
          </View>
        </View>
      </Card>
      <Card>
        <Text style={s.section}>Gasto por categoría</Text>
        {visible.length === 0 ? <Empty text="Todavía no hay gastos este mes" /> : null}
        {visible.map((c) => (
          <BudgetBar key={c.id} name={c.name} color={c.color} spent={c.spent} budget={c.monthly_budget} />
        ))}
      </Card>
    </ScrollView>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  small: { color: colors.muted, fontSize: 13 },
  balance: { fontSize: 34, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  amt: { fontSize: 20, fontWeight: '600' },
  section: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: colors.text },
});
