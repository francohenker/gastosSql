import React from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { Button, Card } from '../components/ui';
import { Colors, useColors, useThemedStyles } from '../components/theme';
import { exportBackup, importBackup } from '../utils/backup';

export default function SettingsScreen() {
  const colors = useColors();
  async function onExport() {
    try {
      await exportBackup();
    } catch (e) {
      Alert.alert('No se pudo exportar', String((e as Error).message ?? e));
    }
  }

  function onImport() {
    Alert.alert('Importar backup', 'Esto reemplaza TODOS los datos actuales. ¿Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Importar',
        style: 'destructive',
        onPress: async () => {
          try {
            if (await importBackup()) Alert.alert('Backup restaurado');
          } catch (e) {
            Alert.alert('No se pudo importar', String((e as Error).message ?? e));
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: 12 }}>
      <Card>
        <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 6, color: colors.text }}>Backup</Text>
        <Text style={{ color: colors.muted, marginBottom: 8 }}>
          Exportá tus datos a un archivo JSON para guardarlos o pasarlos a otro dispositivo.
        </Text>
        <Button title="Exportar backup" onPress={onExport} />
        <Button title="Importar backup" secondary onPress={onImport} />
      </Card>
    </ScrollView>
  );
}
