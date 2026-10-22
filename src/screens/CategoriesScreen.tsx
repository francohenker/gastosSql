import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Card, Empty, Fab, Field, FormModal } from '../components/ui';
import { Colors, useColors, useThemedStyles } from '../components/theme';
import {
  deleteCategory, deleteProduct, listCategories, listProducts, saveCategory, saveProduct,
} from '../db/repo/categories';
import { Category, Product } from '../db/types';
import { money, parseAmount } from '../utils/format';

const PALETTE = ['#ef6c00', '#1e88e5', '#8e24aa', '#e53935', '#43a047', '#00897b', '#fdd835', '#6d4c41', '#757575'];

export default function CategoriesScreen() {
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  const [cats, setCats] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | 'new' | null>(null);

  const reload = useCallback(async () => setCats(await listCategories()), []);
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={cats}
        keyExtractor={(c) => String(c.id)}
        ListEmptyComponent={<Empty text="Sin categorías" />}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 90 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => setEditing(item)}>
            <Card>
              <View style={s.row}>
                <View style={[s.dot, { backgroundColor: item.color }]} />
                <Text style={s.title}>{item.name}</Text>
                <Text style={s.sub}>
                  {item.monthly_budget ? `Presupuesto ${money(item.monthly_budget)}` : 'Sin presupuesto'}
                </Text>
              </View>
            </Card>
          </Pressable>
        )}
      />
      <Fab onPress={() => setEditing('new')} />
      {editing ? (
        <CategoryForm
          category={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      ) : null}
    </View>
  );
}

function CategoryForm({ category, onClose, onSaved }: { category: Category | null; onClose: () => void; onSaved: () => void }) {
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  const [name, setName] = useState(category?.name ?? '');
  const [color, setColor] = useState(category?.color ?? PALETTE[0]);
  const [budget, setBudget] = useState(category?.monthly_budget ? String(category.monthly_budget) : '');
  const [products, setProducts] = useState<Product[]>([]);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');

  const loadProducts = useCallback(async () => {
    if (category) setProducts(await listProducts(category.id));
  }, [category]);
  React.useEffect(() => { loadProducts(); }, [loadProducts]);

  async function submit() {
    if (!name.trim()) return Alert.alert('Poné un nombre');
    const b = budget.trim() === '' ? null : parseAmount(budget);
    if (budget.trim() !== '' && (b == null || b <= 0)) return Alert.alert('Presupuesto inválido');
    try {
      await saveCategory({ id: category?.id, name: name.trim(), color, monthly_budget: b });
      onSaved();
    } catch {
      Alert.alert('Ya existe una categoría con ese nombre');
    }
  }

  function remove() {
    Alert.alert('Eliminar categoría', 'Se borrarán también sus gastos y productos.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await deleteCategory(category!.id); onSaved(); } },
    ]);
  }

  async function addProduct() {
    if (!category || !prodName.trim()) return;
    const price = prodPrice.trim() === '' ? null : parseAmount(prodPrice);
    if (prodPrice.trim() !== '' && price == null) return Alert.alert('Precio inválido');
    await saveProduct({ name: prodName.trim(), category_id: category.id, default_price: price });
    setProdName(''); setProdPrice('');
    loadProducts();
  }

  return (
    <FormModal visible title={category ? 'Editar categoría' : 'Nueva categoría'} onClose={onClose}>
      <Field label="Nombre" value={name} onChangeText={setName} />
      <Field label="Presupuesto mensual (opcional)" value={budget} onChangeText={setBudget} keyboardType="decimal-pad" />
      <Text style={s.label}>Color</Text>
      <View style={[s.row, { flexWrap: 'wrap', gap: 10, marginBottom: 12 }]}>
        {PALETTE.map((c) => (
          <Pressable key={c} onPress={() => setColor(c)}
            style={[s.swatch, { backgroundColor: c }, c === color && s.swatchOn]} />
        ))}
      </View>

      {category ? (
        <>
          <Text style={[s.label, { marginTop: 8 }]}>Productos</Text>
          {products.length === 0 ? <Text style={s.sub}>Sin productos todavía</Text> : null}
          {products.map((p) => (
            <View key={p.id} style={[s.row, { paddingVertical: 6 }]}>
              <Text style={[s.title, { flex: 1 }]}>{p.name}{p.default_price != null ? ` · ${money(p.default_price)}` : ''}</Text>
              <Pressable onPress={async () => { await deleteProduct(p.id); loadProducts(); }} hitSlop={10}>
                <Text style={{ color: colors.expense }}>Quitar</Text>
              </Pressable>
            </View>
          ))}
          <View style={{ marginTop: 8 }}>
            <Field label="Nuevo producto" value={prodName} onChangeText={setProdName} />
            <Field label="Precio habitual (opcional)" value={prodPrice} onChangeText={setProdPrice} keyboardType="decimal-pad" />
            <Button title="Agregar producto" secondary onPress={addProduct} />
          </View>
        </>
      ) : null}

      <Button title="Guardar" onPress={submit} />
      {category ? <Button title="Eliminar categoría" danger onPress={remove} /> : null}
      <Button title="Cerrar" secondary onPress={onClose} />
    </FormModal>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text, flex: 1 },
  sub: { color: colors.muted, fontSize: 13 },
  label: { fontSize: 13, color: colors.muted, marginBottom: 4 },
  swatch: { width: 34, height: 34, borderRadius: 17 },
  swatchOn: { borderWidth: 3, borderColor: colors.text },
});
