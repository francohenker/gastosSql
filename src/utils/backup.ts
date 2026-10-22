import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getDb } from '../db/database';

const TABLES = ['categories', 'products', 'expenses', 'incomes'] as const;
// Orden de inserción que respeta las claves foráneas.
type Dump = { version: 1; tables: Record<(typeof TABLES)[number], Record<string, unknown>[]> };

export async function exportBackup() {
  const db = await getDb();
  const tables = {} as Dump['tables'];
  for (const t of TABLES) tables[t] = await db.getAllAsync(`SELECT * FROM ${t}`);
  const dump: Dump = { version: 1, tables };

  const stamp = new Date().toISOString().slice(0, 10);
  const file = new File(Paths.cache, `gastos-backup-${stamp}.json`);
  if (file.exists) file.delete();
  file.create();
  await file.write(JSON.stringify(dump));
  if (!(await Sharing.isAvailableAsync())) throw new Error('Compartir no está disponible en este dispositivo');
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Guardar backup' });
}

function validate(raw: unknown): Dump {
  const d = raw as Dump;
  if (!d || d.version !== 1 || !d.tables) throw new Error('Archivo de backup inválido');
  for (const t of TABLES) {
    if (!Array.isArray(d.tables[t])) throw new Error(`Falta la tabla "${t}"`);
  }
  return d;
}

/** Reemplaza todos los datos por los del backup. Devuelve false si el usuario canceló. */
export async function importBackup(): Promise<boolean> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/*'], copyToCacheDirectory: true });
  if (res.canceled) return false;
  const text = await new File(res.assets[0].uri).text();
  const dump = validate(JSON.parse(text));

  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const t of [...TABLES].reverse()) await db.runAsync(`DELETE FROM ${t}`);
    for (const t of TABLES) {
      for (const row of dump.tables[t]) {
        const cols = Object.keys(row);
        await db.runAsync(
          `INSERT INTO ${t} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
          cols.map((c) => row[c] as string | number | null),
        );
      }
    }
  });
  return true;
}
