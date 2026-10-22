# Gastos

App Android para controlar los gastos e ingresos del mes. Hecha con React Native + Expo (SDK 57) y TypeScript. Los datos se guardan localmente en SQLite, sin cuenta ni servidor.

## Funciones

- **Gastos** con monto, categoría, producto, cantidad, fecha y nota.
- **Ingresos** (por ejemplo, lo que generás con tu trabajo) con fuente, fecha y nota.
- **Categorías** con color y presupuesto mensual opcional, y un catálogo de **productos** con precio habitual.
- **Resumen mensual**: balance (ingresos − gastos) y barras de presupuesto por categoría, que se ponen amarillas al 80% y rojas al superarlo.
- **Gráfico** de dona con el gasto por categoría.
- **Backup**: exportar e importar todos los datos en JSON.
- **Modo oscuro** automático según el tema del sistema.

## Estructura

```
App.tsx                  # navegación por pestañas y tema
src/db/                  # SQLite: esquema y migraciones (database.ts), tipos y repositorios (repo/)
src/screens/             # Inicio, Gastos, Ingresos, Categorías, Gráficos, Ajustes
src/components/          # UI compartida, tema claro/oscuro, selector de mes
src/utils/               # formato de montos y fechas, backup
```

El esquema se versiona con `PRAGMA user_version`; para cambiarlo, agregá un paso en `migrate()` de `src/db/database.ts` y subí `SCHEMA_VERSION`.

## Desarrollo

Requiere Node.js. Para ver la app en el celular, instalá **Expo Go** (debe soportar SDK 57):

```bash
npm install
npx expo start        # escaneá el QR con Expo Go
npx expo start --tunnel   # si el celular no ve la compu por wifi
npx tsc --noEmit      # chequeo de tipos
```

## Generar el APK

Se compila localmente, sin cuenta de Expo. Hace falta JDK 17 y el Android SDK (plataforma 36, build-tools 36.0.0, NDK 27.1.12297006).

```bash
export JAVA_HOME=~/jdk ANDROID_HOME=~/Android   # ajustá a tus rutas
npx expo prebuild -p android --no-install
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

El APK queda en `android/app/build/outputs/apk/release/app-release.apk`. Está firmado con la clave de debug, así que sirve para uso personal pero no para Play Store. Sin `-PreactNativeArchitectures` se compila para todas las arquitecturas (más lento y más pesado).

Alternativa en la nube: `npx eas-cli build -p android --profile preview` (requiere cuenta de Expo; el perfil está en `eas.json`).

## Notas

- `android/` se genera con `expo prebuild` y está en `.gitignore`: no se edita a mano.
- El APK y Expo Go usan bases de datos separadas; para pasar datos de uno a otro, usá el backup de Ajustes.
