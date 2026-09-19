# Bot-Terabox

Bot de WhatsApp dedicado exclusivamente a la descarga de archivos desde enlaces de **TeraBox**.

## Características

- Gestión de una única sesión de TeraBox (cookie `NDUS`)
- Creación semi-automática de cuenta usando correo temporal (Mail.tm)
- Validación automática de la sesión
- Comando de descarga `.terabox` con scraping de respaldo
- Sistema de alertas al propietario (sesión expirada, errores de descarga, etc.)
- Soporte de proxies residenciales
- Técnicas básicas de anti-detección en Playwright
- Rotación de User-Agents

## Instalación

```bash
git clone https://github.com/Gh0stDeveloper/Bot-Terabox.git
cd Bot-Terabox
npm install
npx playwright install chromium
cp .env.example .env
```

Edite el archivo `.env` y agregue su número de propietario (`OWNER_NUMBER`).

## Uso

### 1. Iniciar el bot

```bash
npm start
```

Escanee el código QR con WhatsApp.

### 2. Crear la cuenta de TeraBox (solo una vez)

```
.teraboxcreate
```

El bot generará un correo temporal, completará el registro y guardará la cookie `NDUS`.

### 3. Comprobar estado de la sesión

```
.teraboxsession
```

### 4. Descargar un archivo

```
.terabox https://www.terabox.com/s/1AbC123...
```

## Sistema de alertas

El bot notifica automáticamente al propietario cuando:

- La sesión de TeraBox expira
- Se crea una cuenta correctamente
- Falla el registro de una cuenta
- Falla una descarga

## Estructura del proyecto

```
src/
├── index.ts
├── commands/
│   ├── terabox.ts
│   └── terabox-session.ts
└── services/
    ├── alerts.ts              # Sistema de alertas al propietario
    ├── temp-email.ts
    ├── terabox-session.ts
    ├── terabox-register.ts
    ├── terabox-scraper.ts     # Extracción de enlaces (API + scraping)
    ├── proxy-manager.ts
    └── user-agents.ts
```

## Proxies

Coloque sus proxies residenciales (uno por línea) en:

```
sessions/proxies.txt
```

## Notas importantes

- Este bot está diseñado para **una sola cuenta** de TeraBox.
- No se recomienda la creación masiva de cuentas.
- Use proxies residenciales de calidad para mayor estabilidad.
- La primera ejecución de `.teraboxcreate` se recomienda con el navegador visible.

## Licencia

Uso personal.
