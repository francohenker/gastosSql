import { getDb } from '../database';
import { Income } from '../types';

export async function listIncomes(month: string): Promise<Income[]> {
  const db = await getDb();
  return db.getAllAsync<Income>(
    'SELECT * FROM incomes WHERE substr(date, 1, 7) = ? ORDER BY date DESC, id DESC',
    month,
  );
}

export async function saveIncome(i: Omit<Income, 'id'> & { id?: number }) {
  const db = await getDb();
  if (i.id) {
    await db.runAsync(
      'UPDATE incomes SET date = ?, amount = ?, source = ?, note = ? WHERE id = ?',
      i.date, i.amount, i.source, i.note, i.id,
    );
  } else {
    await db.runAsync(
      'INSERT INTO incomes (date, amount, source, note) VALUES (?, ?, ?, ?)',
      i.date, i.amount, i.source, i.note,
    );
  }
}

export async function deleteIncome(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM incomes WHERE id = ?', id);
}
