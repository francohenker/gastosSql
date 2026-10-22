import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MonthPicker from '../components/MonthPicker';
import { Button, Card, Chips, DateField, Empty, Fab, Field, FormModal } from '../components/ui';
import { useMonth } from '../components/MonthContext';
import { Colors, useColors, useThemedStyles } from '../components/theme';
import { deleteExpense, listExpenses, saveExpense } from '../db/repo/expenses';
import { listCategories, listProducts, saveProduct } from '../db/repo/categories';
import { Category, ExpenseRow, Product } from '../db/types';
import { defaultDateFor, isValidDate, money, parseAmount } from '../utils/format';

export default function ExpensesScreen() {
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  const { month } = useMonth();
  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<ExpenseRow | 'new' | null>(null);

  const reload = useCallback(async () => {
    setRows(await listExpenses(month));
    setCats(await listCategories());
    setProducts(await listProducts());
  }, [month]);
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <MonthPicker />
      <FlatList
        data={rows}
        keyExtractor={(r) => String(r.id)}
        ListEmptyComponent={<Empty text="No hay gastos en este mes" />}
        contentContainerStyle={{ paddingBottom: 90 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => setEditing(item)}>
            <Card>
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.title}>{item.product_name ?? item.category_name}</Text>
                  <Text style={s.sub}>
                    <Text style={{ color: item.category_color }}>● </Text>
                    {item.category_name} · {item.date}
                    {item.quantity !== 1 ? ` · x${item.quantity}` : ''}
                  </Text>
                  {item.note ? <Text style={s.sub}>{item.note}</Text> : null}
                </View>
                <Text style={s.amt}>{money(item.amount * item.quantity)}</Text>
              </View>
            </Card>
          </Pressable>
        )}
      />
      <Fab onPress={() => setEditing('new')} />
      {editing ? (
        <ExpenseForm
          expense={editing === 'new' ? null : editing}
          month={month}
          cats={cats}
          products={products}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      ) : null}
    </View>
  );
}

function ExpenseForm({ expense, month, cats, products, onClose, onSaved }: {
  expense: ExpenseRow | null; month: string; cats: Category[]; products: Product[];
  onClose: () => void; onSaved: () => void;
}) {
  const [date, setDate] = useState(expense?.date ?? defaultDateFor(month));
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [quantity, setQuantity] = useState(expense ? String(expense.quantity) : '1');
  const [categoryId, setCategoryId] = useState<number | null>(expense?.category_id ?? null);
  const [productId, setProductId] = useState<number | null>(expense?.product_id ?? null);
  const [newProduct, setNewProduct] = useState('');
  const [note, setNote] = useState(expense?.note ?? '');

  const catProducts = products.filter((p) => p.category_id === categoryId);

  // Al elegir un producto con precio por defecto, sugerirlo si el monto está vacío.
  useEffect(() => {
    const p = products.find((x) => x.id === productId);
    if (p?.default_price != null && amount === '') setAmount(String(p.default_price));
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    const amt = parseAmount(amount);
    const qty = parseAmount(quantity);
    if (amt == null || amt < 0) return Alert.alert('Monto inválido');
    if (qty == null || qty <= 0) return Alert.alert('Cantidad inválida');
    if (!isValidDate(date)) return Alert.alert('Fecha inválida', 'Usá el formato AAAA-MM-DD');
    if (categoryId == null) return Alert.alert('Elegí una categoría');

    let pid = productId;
    if (pid == null && newProduct.trim()) {
      await saveProduct({ name: newProduct.trim(), category_id: categoryId, default_price: amt });
      pid = (await listProducts(categoryId)).find((p) => p.name === newProduct.trim())?.id ?? null;
    }
    await saveExpense({
      id: expense?.id, date, amount: amt, quantity: qty,
      category_id: categoryId, product_id: pid, note: note.trim() || null,
    });
    onSaved();
  }

  function remove() {
    Alert.alert('Eliminar gasto', '¿Seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await deleteExpense(expense!.id); onSaved(); } },
    ]);
  }

  return (
    <FormModal visible title={expense ? 'Editar gasto' : 'Nuevo gasto'} onClose={onClose}>
      <Field label="Monto (precio unitario)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" />
      <Chips label="Categoría" items={cats} selected={categoryId}
        onSelect={(id) => { setCategoryId(id); setProductId(null); }} />
      {categoryId != null ? (
        <>
          {catProducts.length > 0 ? (
            <Chips label="Producto" items={catProducts} selected={productId} onSelect={setProductId} />
          ) : null}
          {productId == null ? (
            <Field label="O producto nuevo (opcional)" value={newProduct} onChangeText={setNewProduct} placeholder="Ej: Leche" />
          ) : null}
        </>
      ) : null}
      <Field label="Cantidad" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />
      <DateField label="Fecha" value={date} onChange={setDate} />
      <Field label="Nota" value={note} onChangeText={setNote} />
      <Button title="Guardar" onPress={submit} />
      {expense ? <Button title="Eliminar" danger onPress={remove} /> : null}
      <Button title="Cancelar" secondary onPress={onClose} />
    </FormModal>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  sub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  amt: { fontSize: 17, fontWeight: '700', color: colors.expense },
});
