export type Category = { id: number; name: string; color: string; monthly_budget: number | null };
export type Product = { id: number; name: string; category_id: number; default_price: number | null };
export type Expense = {
  id: number;
  date: string;
  amount: number;
  quantity: number;
  category_id: number;
  product_id: number | null;
  note: string | null;
};
export type ExpenseRow = Expense & { category_name: string; category_color: string; product_name: string | null };
export type Income = { id: number; date: string; amount: number; source: string; note: string | null };
export type CategoryTotal = Category & { spent: number };
