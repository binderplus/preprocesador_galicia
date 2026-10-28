# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Propósito

App web estática (React 18 + Vite) que preprocesa el reporte de movimientos de Office Banking del Banco Galicia (`.xlsx`/`.xls`) para que se pueda importar en Odoo. Todo corre en el navegador: no hay backend. Publicada en https://pregal.binderplus.com.ar/.

El repo se derivó de un preprocesador de MercadoPago (de ahí `"name": "mercadopago_preprocess"` en `package.json`).

## Comandos

```bash
npm ci           # instalar dependencias (xlsx se baja del CDN de SheetJS, no de npm)
npm run dev      # servidor de desarrollo de Vite
npm run build    # build a dist/
npm run preview  # servir el build
npm run lint     # ESLint (flat config en eslint.config.js)
```

No hay tests automatizados. Para verificar un cambio, levantar `npm run dev`, cargar un reporte real del Galicia y revisar el archivo descargado y los logs `IN:` / `OUT:` en la consola.

## Deploy

`.github/workflows/main.yml` hace build y publica `dist/` en GitHub Pages en cada push a `main`. Un push a `main` es un deploy a producción.

## Arquitectura

El flujo cruza varios archivos:

1. `src/FileHandler.jsx` — zona de drop (`react-dropzone`, un solo archivo). Máquina de estados simple `initial` / `processing` / `error` que define ícono, mensaje y color. Llama a `process()`.
2. `src/Preprocessor.js` — crea un Web Worker de módulo (`new URL('./PreprocessorWorker.js', import.meta.url)`), le pasa el `File`, y cuando recibe el resultado dispara la descarga con un `<a>` temporal. Los errores del worker rechazan la promesa y se muestran en la UI.
3. `src/PreprocessorWorker.js` — la lógica de transformación, con SheetJS:
   - Lee solo la **primera hoja**, la convierte a JSON con `sheet_to_json` (las claves son los encabezados de columna del reporte).
   - `getReplacementRows(row)` decide qué hacer con cada fila; devuelve un array de filas de reemplazo. Acá va cualquier regla nueva de filtrado/transformación.
   - Reglas actuales: descarta filas cuyo `Tipo de movimiento` no es `'Imputado'` (vacías o pendientes; filtrar pendientes desde Office Banking pone el saldo en 0, por eso se hace acá). Exige la columna `ID de movimiento` y si falta lanza un error que ve el usuario — el reporte tiene que exportarse con todas las columnas.
   - Ojo: las filas descartadas devuelven `[[]]` (una fila vacía), no `[]`.
   - Reescribe la hoja con `json_to_sheet` (fechas `dd/mm/yyyy`) y genera `<nombre>.procesado.<ext>` con la misma extensión que la entrada.

Los textos de la UI y los mensajes de error están en español.
