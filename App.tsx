import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getDb } from './src/db/database';
import { MonthProvider } from './src/components/MonthContext';
import { useColors, useIsDark } from './src/components/theme';
import HomeScreen from './src/screens/HomeScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import IncomesScreen from './src/screens/IncomesScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import ChartsScreen from './src/screens/ChartsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const icon = (glyph: string) => ({ color }: { color: string }) => (
  <Text style={{ fontSize: 18, color }}>{glyph}</Text>
);

export default function App() {
  const colors = useColors();
  const dark = useIsDark();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDb().then(() => setReady(true)).catch((e) => setError(String(e)));
  }, []);

  if (error) return <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.bg }}><Text style={{ color: colors.text }}>Error de base de datos: {error}</Text></View>;
  if (!ready) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.bg }}><ActivityIndicator size="large" /></View>;

  return (
    <SafeAreaProvider>
      <MonthProvider>
        <NavigationContainer
          theme={{
            ...(dark ? DarkTheme : DefaultTheme),
            colors: { ...(dark ? DarkTheme : DefaultTheme).colors, background: colors.bg, card: colors.card, text: colors.text, border: colors.border, primary: colors.primary },
          }}
        >
          <Tab.Navigator screenOptions={{ tabBarActiveTintColor: colors.primary, tabBarLabelStyle: { fontSize: 11 } }}>
            <Tab.Screen name="Inicio" component={HomeScreen} options={{ tabBarIcon: icon('⌂') }} />
            <Tab.Screen name="Gastos" component={ExpensesScreen} options={{ tabBarIcon: icon('−') }} />
            <Tab.Screen name="Ingresos" component={IncomesScreen} options={{ tabBarIcon: icon('+') }} />
            <Tab.Screen name="Categorías" component={CategoriesScreen} options={{ tabBarIcon: icon('▤') }} />
            <Tab.Screen name="Gráficos" component={ChartsScreen} options={{ tabBarIcon: icon('◔') }} />
            <Tab.Screen name="Ajustes" component={SettingsScreen} options={{ tabBarIcon: icon('⚙') }} />
          </Tab.Navigator>
        </NavigationContainer>
      </MonthProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
