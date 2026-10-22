import { getDb } from '../database';
import { Category, CategoryTotal, Product } from '../types';

export async function listCategories(): Promise<Category[]> {
  const db = await getDb();
  return db.getAllAsync<Category>('SELECT * FROM categories ORDER BY name');
}

export async function saveCategory(c: Omit<Category, 'id'> & { id?: number }) {
  const db = await getDb();
  if (c.id) {
    await db.runAsync(
      'UPDATE categories SET name = ?, color = ?, monthly_budget = ? WHERE id = ?',
      c.name, c.color, c.monthly_budget, c.id,
    );
  } else {
    await db.runAsync(
      'INSERT INTO categories (name, color, monthly_budget) VALUES (?, ?, ?)',
      c.name, c.color, c.monthly_budget,
    );
  }
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM categories WHERE id = ?', id);
}

/** Todas las categorías con lo gastado en el mes (YYYY-MM). */
export async function categoryTotals(month: string): Promise<CategoryTotal[]> {
  const db = await getDb();
  return db.getAllAsync<CategoryTotal>(
    `SELECT c.*, COALESCE(SUM(e.amount * e.quantity), 0) AS spent
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id AND substr(e.date, 1, 7) = ?
      GROUP BY c.id
      ORDER BY spent DESC, c.name`,
    month,
  );
}

export async function listProducts(categoryId?: number): Promise<Product[]> {
  const db = await getDb();
  if (categoryId) {
    return db.getAllAsync<Product>('SELECT * FROM products WHERE category_id = ? ORDER BY name', categoryId);
  }
  return db.getAllAsync<Product>('SELECT * FROM products ORDER BY name');
}

export async function saveProduct(p: Omit<Product, 'id'> & { id?: number }) {
  const db = await getDb();
  if (p.id) {
    await db.runAsync(
      'UPDATE products SET name = ?, category_id = ?, default_price = ? WHERE id = ?',
      p.name, p.category_id, p.default_price, p.id,
    );
  } else {
    await db.runAsync(
      'INSERT INTO products (name, category_id, default_price) VALUES (?, ?, ?)',
      p.name, p.category_id, p.default_price,
    );
  }
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM products WHERE id = ?', id);
}
