import fs from 'fs-extra';
import path from 'path';
import {
  saveSession,
  loadSession,
  getCookieHeader,
  TeraboxSession,
} from '../src/services/terabox-session.js';

async function run() {
  console.log('=== Test: terabox-session ===');

  const sessionDir = path.join(process.cwd(), 'sessions');
  await fs.ensureDir(sessionDir);

  const fake: TeraboxSession = {
    ndus: 'TEST_NDUS_COOKIE_VALUE_12345',
    browserid: 'test-browser-id',
    email: 'test@example.com',
    password: 'secret',
    created: Date.now(),
    lastValidated: Date.now(),
  };

  await saveSession(fake);
  const loaded = await loadSession();

  if (!loaded) {
    throw new Error('loadSession devolvió null tras saveSession');
  }
  if (loaded.ndus !== fake.ndus) {
    throw new Error('NDUS no coincide');
  }
  if (loaded.email !== fake.email) {
    throw new Error('Email no coincide');
  }
  console.log('OK - saveSession / loadSession');

  const header = getCookieHeader(loaded);
  if (!header.includes('NDUS=TEST_NDUS') || !header.includes('browserid=')) {
    throw new Error('getCookieHeader inválido: ' + header);
  }
  console.log('OK - getCookieHeader');

  // Limpiar sesión de prueba para no interferir con uso real
  const sessionFile = path.join(sessionDir, 'terabox.json');
  if (await fs.pathExists(sessionFile)) {
    const content = await fs.readJson(sessionFile);
    if (content.ndus === fake.ndus) {
      await fs.remove(sessionFile);
      console.log('OK - Sesión de prueba eliminada');
    }
  }

  console.log('=== terabox-session: todos los tests pasaron ===\n');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
