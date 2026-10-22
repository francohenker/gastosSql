import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MonthPicker from '../components/MonthPicker';
import { Button, Card, DateField, Empty, Fab, Field, FormModal } from '../components/ui';
import { useMonth } from '../components/MonthContext';
import { Colors, useColors, useThemedStyles } from '../components/theme';
import { deleteIncome, listIncomes, saveIncome } from '../db/repo/incomes';
import { Income } from '../db/types';
import { defaultDateFor, isValidDate, money, parseAmount } from '../utils/format';

export default function IncomesScreen() {
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  const { month } = useMonth();
  const [rows, setRows] = useState<Income[]>([]);
  const [editing, setEditing] = useState<Income | 'new' | null>(null);

  const reload = useCallback(async () => setRows(await listIncomes(month)), [month]);
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <MonthPicker />
      <FlatList
        data={rows}
        keyExtractor={(r) => String(r.id)}
        ListEmptyComponent={<Empty text="No hay ingresos en este mes" />}
        contentContainerStyle={{ paddingBottom: 90 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => setEditing(item)}>
            <Card>
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.title}>{item.source}</Text>
                  <Text style={s.sub}>{item.date}{item.note ? ` · ${item.note}` : ''}</Text>
                </View>
                <Text style={s.amt}>{money(item.amount)}</Text>
              </View>
            </Card>
          </Pressable>
        )}
      />
      <Fab onPress={() => setEditing('new')} />
      {editing ? (
        <IncomeForm
          income={editing === 'new' ? null : editing}
          month={month}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      ) : null}
    </View>
  );
}

function IncomeForm({ income, month, onClose, onSaved }: {
  income: Income | null; month: string; onClose: () => void; onSaved: () => void;
}) {
  const [amount, setAmount] = useState(income ? String(income.amount) : '');
  const [source, setSource] = useState(income?.source ?? 'Trabajo');
  const [date, setDate] = useState(income?.date ?? defaultDateFor(month));
  const [note, setNote] = useState(income?.note ?? '');

  async function submit() {
    const amt = parseAmount(amount);
    if (amt == null || amt <= 0) return Alert.alert('Monto inválido');
    if (!source.trim()) return Alert.alert('Indicá la fuente del ingreso');
    if (!isValidDate(date)) return Alert.alert('Fecha inválida', 'Usá el formato AAAA-MM-DD');
    await saveIncome({ id: income?.id, date, amount: amt, source: source.trim(), note: note.trim() || null });
    onSaved();
  }

  function remove() {
    Alert.alert('Eliminar ingreso', '¿Seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await deleteIncome(income!.id); onSaved(); } },
    ]);
  }

  return (
    <FormModal visible title={income ? 'Editar ingreso' : 'Nuevo ingreso'} onClose={onClose}>
      <Field label="Monto" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" />
      <Field label="Fuente" value={source} onChangeText={setSource} placeholder="Trabajo, freelance..." />
      <DateField label="Fecha" value={date} onChange={setDate} />
      <Field label="Nota" value={note} onChangeText={setNote} />
      <Button title="Guardar" onPress={submit} />
      {income ? <Button title="Eliminar" danger onPress={remove} /> : null}
      <Button title="Cancelar" secondary onPress={onClose} />
    </FormModal>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  sub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  amt: { fontSize: 17, fontWeight: '700', color: colors.income },
});
