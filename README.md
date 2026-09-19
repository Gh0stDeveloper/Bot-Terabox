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
- CI con GitHub Actions (tests de comandos, proxies, sesión y flujo de auth de WhatsApp mockeado)

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

Solo el propietario puede ejecutar este comando.

### 3. Comprobar estado de la sesión

```
.teraboxsession
```

### 4. Descargar un archivo

```
.terabox https://www.terabox.com/s/1AbC123...
```

## Tests locales

```bash
npm test
```

O por separado:

```bash
npm run test:proxy      # Lectura de sessions/proxies.txt
npm run test:session    # Guardado/carga de sesión TeraBox
npm run test:commands   # Registro de comandos y extractSurl
npm run test:wa         # Flujo de auth WhatsApp (sin número real)
```

## CI (GitHub Actions)

En cada push o pull request a `main` se ejecuta:

1. Instalación de dependencias y Chromium
2. Verificación de archivos principales
3. Test de carga del archivo de proxies
4. Test de sesión (save/load/cookie)
5. Test de comandos (`.terabox`, `.teraboxsession`, `.teraboxcreate`)
6. Test del flujo de vinculación WhatsApp **mockeado** (sin número real ni QR)

> **Nota:** No es posible completar el emparejamiento real de WhatsApp dentro de GitHub Actions, porque Baileys requiere escanear un código QR con un teléfono. El CI valida que el código de autenticación y la estructura de conexión funcionan correctamente.

## Proxies

Coloque sus proxies residenciales (uno por línea) en:

```
sessions/proxies.txt
```

Formato:
```
http://usuario:contraseña@ip:puerto
http://ip:puerto
```

El CI comprueba que el módulo lee correctamente este archivo.

## Notas importantes

- Una sola cuenta de TeraBox.
- Sin rotación ni creación masiva de cuentas.
- Cuando la sesión expire, use `.teraboxcreate` de forma controlada.

## Licencia

Uso personal.
