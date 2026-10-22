import { getDb } from '../database';
import { Expense, ExpenseRow } from '../types';

export async function listExpenses(month: string): Promise<ExpenseRow[]> {
  const db = await getDb();
  return db.getAllAsync<ExpenseRow>(
    `SELECT e.*, c.name AS category_name, c.color AS category_color, p.name AS product_name
       FROM expenses e
       JOIN categories c ON c.id = e.category_id
       LEFT JOIN products p ON p.id = e.product_id
      WHERE substr(e.date, 1, 7) = ?
      ORDER BY e.date DESC, e.id DESC`,
    month,
  );
}

export async function saveExpense(e: Omit<Expense, 'id'> & { id?: number }) {
  const db = await getDb();
  if (e.id) {
    await db.runAsync(
      `UPDATE expenses SET date = ?, amount = ?, quantity = ?, category_id = ?, product_id = ?, note = ?
        WHERE id = ?`,
      e.date, e.amount, e.quantity, e.category_id, e.product_id, e.note, e.id,
    );
  } else {
    await db.runAsync(
      `INSERT INTO expenses (date, amount, quantity, category_id, product_id, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      e.date, e.amount, e.quantity, e.category_id, e.product_id, e.note,
    );
  }
}

export async function deleteExpense(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM expenses WHERE id = ?', id);
}
