import { getDb } from '../database';

export type MonthSummary = { income: number; expense: number; balance: number };

export async function monthSummary(month: string): Promise<MonthSummary> {
  const db = await getDb();
  const inc = await db.getFirstAsync<{ t: number }>(
    'SELECT COALESCE(SUM(amount), 0) AS t FROM incomes WHERE substr(date, 1, 7) = ?',
    month,
  );
  const exp = await db.getFirstAsync<{ t: number }>(
    'SELECT COALESCE(SUM(amount * quantity), 0) AS t FROM expenses WHERE substr(date, 1, 7) = ?',
    month,
  );
  const income = inc?.t ?? 0;
  const expense = exp?.t ?? 0;
  return { income, expense, balance: income - expense };
}
