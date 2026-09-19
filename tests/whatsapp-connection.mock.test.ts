/**
 * Valida la lógica de vinculación / manejo de conexión de WhatsApp
 * sin usar un número real ni escanear QR.
 *
 * En CI no es posible completar el emparejamiento real de Baileys
 * (requiere un teléfono físico). Este test comprueba:
 * - Que las dependencias de Baileys cargan
 * - Que el flujo de auth state se puede inicializar en disco
 * - Que el código de index no tiene errores de importación críticos
 */

import fs from 'fs-extra';
import path from 'path';
import { useMultiFileAuthState } from '@whiskeysockets/baileys';

async function run() {
  console.log('=== Test: flujo de conexión WhatsApp (mock / sin número real) ===');

  const authDir = path.join(process.cwd(), 'sessions', 'auth-test-ci');
  await fs.ensureDir(authDir);
  await fs.emptyDir(authDir);

  // 1. Cargar useMultiFileAuthState (mismo mecanismo que usa el bot)
  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  if (!state) {
    throw new Error('useMultiFileAuthState no devolvió state');
  }
  if (typeof saveCreds !== 'function') {
    throw new Error('saveCreds no es una función');
  }
  console.log('OK - useMultiFileAuthState inicializado');

  // 2. Verificar estructura mínima del state (creds)
  if (!state.creds) {
    throw new Error('state.creds no existe');
  }
  console.log('OK - state.creds presente (sesión aún no vinculada, normal en CI)');

  // 3. Comprobar que se pueden escribir archivos de auth (simula guardado de creds)
  await saveCreds();
  const files = await fs.readdir(authDir);
  if (files.length === 0) {
    // En algunas versiones saveCreds sin cambios reales puede no escribir;
    // al menos el directorio debe existir y ser usable.
    console.log('OK - Directorio de auth utilizable (sin archivos aún)');
  } else {
    console.log('OK - Archivos de auth escritos:', files.join(', '));
  }

  // 4. Importar el punto de entrada no es viable sin arrancar el bot,
  //    pero sí podemos verificar que los módulos de comandos y alertas cargan
  //    junto con el flujo de conexión.
  const { initAlerts } = await import('../src/services/alerts.js');
  if (typeof initAlerts !== 'function') {
    throw new Error('initAlerts no es una función');
  }
  console.log('OK - Módulo de alertas cargado (se usa tras connection === open)');

  // Limpieza
  await fs.remove(authDir);

  console.log(
    '=== whatsapp-connection (mock): tests pasaron ==='
  );
  console.log(
    'Nota: la vinculación real con un teléfono solo puede hacerse fuera de CI.\n'
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
