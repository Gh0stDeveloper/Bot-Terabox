# Bot-Terabox

Bot de WhatsApp dedicado exclusivamente a la descarga de archivos desde enlaces de **TeraBox**.

## Características

- Gestión de **una única sesión** de TeraBox (cookie `NDUS`)
- Creación semi-automática de cuenta usando correo temporal (Mail.tm)
- Validación automática de la sesión
- Comando de descarga `.terabox` con scraping anti-bot y múltiples fallbacks
- Sistema de alertas al propietario (con control de frecuencia)
- Soporte de proxies residenciales
- Técnicas de anti-detección en Playwright y en el scraper
- Rotación de User-Agents
- CI con GitHub Actions

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

Solo el propietario puede ejecutar este comando. Genera un correo temporal, completa el registro y guarda la cookie `NDUS`.

### 3. Comprobar estado de la sesión

```
.teraboxsession
```

### 4. Descargar un archivo

```
.terabox https://www.terabox.com/s/1AbC123...
```

Si la sesión ha expirado, el bot avisará y el propietario deberá ejecutar `.teraboxcreate` de nuevo.

## Sistema de alertas

El bot notifica automáticamente al propietario cuando:

- La sesión de TeraBox expira
- Se crea una cuenta correctamente
- Falla el registro de una cuenta
- Falla una descarga

Las alertas tienen un cooldown de 1 minuto para evitar spam.

## Anti-bot en el scraper

El módulo de extracción de archivos utiliza:

- Headers realistas (sec-ch-ua, sec-fetch-*, Accept-Language, etc.)
- User-Agent rotativo
- Delays aleatorios entre peticiones
- Tres niveles de obtención del enlace (API → API alternativa → scraping HTML)

## CI (GitHub Actions)

En cada push o pull request a `main` se ejecuta un workflow que:

- Instala dependencias
- Verifica que existan los archivos principales
- Comprueba imports básicos
- Instala Chromium de Playwright

## Estructura del proyecto

```
src/
├── index.ts
├── commands/
│   ├── terabox.ts
│   └── terabox-session.ts
└── services/
    ├── alerts.ts
    ├── temp-email.ts
    ├── terabox-session.ts
    ├── terabox-register.ts
    ├── terabox-scraper.ts
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
- No incluye rotación ni creación masiva de cuentas.
- Cuando la sesión expire, cree una nueva de forma controlada con `.teraboxcreate`.
- Use proxies residenciales de calidad para mayor estabilidad.

## Licencia

Uso personal.
