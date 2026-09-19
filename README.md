# 📦 Bot-Terabox

Bot de WhatsApp **dedicado exclusivamente** a la descarga de archivos desde enlaces públicos de **TeraBox**.

> **Alcance estricto:** una sola cuenta de TeraBox por instancia. No incluye rotación de cuentas, creación masiva ni pools de sesiones.

---

## ✨ Características

| Área | Descripción |
|------|-------------|
| 🔐 Sesión | Gestión de **una única** cookie `NDUS` |
| 📧 Registro | Creación semi-automática con correo temporal (Mail.tm) |
| ✅ Validación | Comprobación automática del estado de la sesión |
| ⬇️ Descarga | Comando `.terabox` con API + scraping y fallbacks |
| 🔔 Alertas | Notificaciones al propietario (con cooldown anti-spam) |
| 🌐 Proxies | Soporte de proxies residenciales vía archivo local |
| 🛡️ Anti-detección | Headers realistas, delays humanos, User-Agents rotativos |
| 🧪 CI | GitHub Actions: proxies, sesión, comandos y auth WhatsApp mockeado |

---

## 📋 Requisitos

- Node.js 20+ (recomendado 22)
- Cuenta de WhatsApp para vincular el bot (QR)
- (Opcional) Proxies residenciales propios

---

## 🚀 Instalación

```bash
git clone https://github.com/Gh0stDeveloper/Bot-Terabox.git
cd Bot-Terabox
npm install
npx playwright install chromium
cp .env.example .env
```

Edite `.env` y defina **obligatoriamente**:

```env
OWNER_NUMBER=54911xxxxxxxx
```

> Use el número en formato internacional **sin** el signo `+`.

---

## ▶️ Uso

### 1. Iniciar el bot

```bash
npm start
```

Escanee el código QR con WhatsApp. La sesión de WhatsApp se guarda en `sessions/auth/`.

### 2. Crear la cuenta de TeraBox *(solo una vez)*

```
.teraboxcreate
```

- **Solo el propietario** puede ejecutarlo.
- Genera correo temporal, completa el registro y guarda `NDUS` en `sessions/terabox.json`.
- La primera vez se recomienda dejar el navegador visible (`headless: false`) para verificar el flujo.

### 3. Comprobar el estado de la sesión

```
.teraboxsession
```

Muestra si la sesión es válida, el email asociado y las fechas de creación / última validación.

### 4. Descargar un archivo

```
.terabox https://www.terabox.com/s/1AbC123...
```

Alias disponible: `.tb`

Si la sesión ha expirado, el bot avisará y el propietario deberá ejecutar `.teraboxcreate` de nuevo.

---

## 🧪 Tests locales

```bash
npm test
```

| Script | Qué valida |
|--------|------------|
| `npm run test:proxy` | Lectura de `sessions/proxies.txt` |
| `npm run test:session` | Guardado / carga de sesión y header `Cookie` |
| `npm run test:commands` | Registro de comandos y `extractSurl` |
| `npm run test:wa` | Flujo de auth Baileys **sin número real** |

---

## ⚙️ CI — GitHub Actions

En cada **push** o **pull request** a `main` se ejecuta el workflow **CI**, que:

1. Instala dependencias y Chromium (Playwright)
2. Verifica la existencia de los archivos principales
3. Ejecuta los tests de proxies, sesión y comandos
4. Valida el flujo de autenticación de WhatsApp de forma **mockeada**

> ⚠️ **Limitación:** no es posible vincular un número real de WhatsApp dentro de Actions. Baileys requiere escanear un QR con un teléfono. El CI solo comprueba que el código de auth state y la estructura de conexión son correctos.

---

## 🌐 Proxies

Archivo: `sessions/proxies.txt` (un proxy por línea).

```text
# Comentarios permitidos
http://usuario:contraseña@ip:puerto
http://ip:puerto
```

- Use **proxies residenciales de calidad**. Las listas públicas gratuitas no son recomendables.
- El módulo elige uno al azar en el registro semi-automático.
- El CI comprueba que la lectura del archivo funciona correctamente.

---

## 📁 Estructura del proyecto

```text
src/
├── index.ts                      # Entrada del bot (Baileys)
├── commands/
│   ├── terabox.ts                # .terabox / .tb
│   └── terabox-session.ts        # .teraboxsession / .teraboxcreate
└── services/
    ├── alerts.ts                 # Alertas al propietario
    ├── temp-email.ts             # Mail.tm
    ├── terabox-session.ts        # Persistencia y validación NDUS
    ├── terabox-register.ts       # Registro semi-automático
    ├── terabox-scraper.ts        # Extracción de enlaces (API + HTML)
    ├── proxy-manager.ts          # Lectura de proxies
    └── user-agents.ts            # Rotación de User-Agents
tests/                            # Tests ejecutados en CI y en local
.github/workflows/ci.yml          # Pipeline de integración continua
sessions/                         # Auth WhatsApp, terabox.json, proxies.txt
```

---

## ⚠️ Reglas de uso (estrictas)

1. **Una sola cuenta** de TeraBox por despliegue del bot.
2. **No** hay rotación ni creación masiva de cuentas.
3. Cuando la sesión expire, cree una nueva de forma **manual** con `.teraboxcreate`.
4. No abuse de la frecuencia de descargas; un uso moderado reduce el riesgo de bloqueo.
5. Los selectores de la web de TeraBox pueden cambiar; si el registro falla, habrá que revisarlos.

---

## 📄 Licencia

Uso **personal**. No se garantiza soporte ni compatibilidad continua con cambios de la API o la interfaz de TeraBox.
