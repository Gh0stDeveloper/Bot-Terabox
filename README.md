# Bot-Terabox

Bot de WhatsApp dedicado exclusivamente a la descarga de archivos desde enlaces de **TeraBox**.

## Características

- Gestión de una única sesión de TeraBox (cookie `NDUS`)
- Creación semi-automática de cuenta usando correo temporal (Mail.tm)
- Validación automática de la sesión
- Comando de descarga `.terabox`
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

Edite el archivo `.env` y agregue su número de propietario.

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

El bot generará un correo temporal, completará el registro y guardará la cookie `NDUS` en `sessions/terabox.json`.

### 3. Comprobar estado de la sesión

```
.teraboxsession
```

### 4. Descargar un archivo

```
.terabox https://www.terabox.com/s/1AbC123...
```

## Estructura del proyecto

```
src/
├── index.ts                 # Punto de entrada del bot
├── commands/
│   ├── terabox.ts           # Comando de descarga
│   └── terabox-session.ts   # Comandos de sesión y creación
└── services/
    ├── temp-email.ts        # Correo temporal (Mail.tm)
    ├── terabox-session.ts   # Gestión y validación de sesión
    ├── terabox-register.ts  # Registro semi-automático
    ├── proxy-manager.ts     # Rotación de proxies
    └── user-agents.ts       # Rotación de User-Agents
```

## Proxies

Coloque sus proxies residenciales (uno por línea) en:

```
sessions/proxies.txt
```

Formato aceptado:
```
http://usuario:contraseña@ip:puerto
http://ip:puerto
```

## Notas importantes

- Este bot está diseñado para **una sola cuenta** de TeraBox.
- No se recomienda la creación masiva de cuentas.
- Use proxies residenciales de calidad para mayor estabilidad.
- La primera ejecución de `.teraboxcreate` se recomienda con el navegador visible (`headless: false`).

## Licencia

Uso personal.
