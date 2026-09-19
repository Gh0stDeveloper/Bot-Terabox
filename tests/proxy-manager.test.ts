import fs from 'fs-extra';
import path from 'path';
import { getRandomProxy } from '../src/services/proxy-manager.js';

const TEST_DIR = path.join(process.cwd(), 'sessions');
const PROXY_FILE = path.join(TEST_DIR, 'proxies.txt');

async function run() {
  console.log('=== Test: proxy-manager ===');

  await fs.ensureDir(TEST_DIR);

  // Caso 1: archivo con proxies válidos
  await fs.writeFile(
    PROXY_FILE,
    [
      '# comentario',
      'http://user:pass@1.2.3.4:8080',
      'http://5.6.7.8:3128',
      '',
      'http://proxy.example.com:80',
    ].join('\n')
  );

  const proxy = await getRandomProxy();
  if (!proxy) {
    throw new Error('Se esperaba un proxy y se obtuvo null');
  }
  if (!proxy.startsWith('http')) {
    throw new Error('El proxy no tiene formato http: ' + proxy);
  }
  console.log('OK - Proxy aleatorio obtenido:', proxy.replace(/:[^:@]+@/, ':****@'));

  // Caso 2: archivo vacío / solo comentarios
  await fs.writeFile(PROXY_FILE, '# solo comentarios\n\n');
  const empty = await getRandomProxy();
  if (empty !== null) {
    throw new Error('Se esperaba null con archivo vacío');
  }
  console.log('OK - Archivo vacío devuelve null');

  // Restaurar archivo de ejemplo
  await fs.writeFile(
    PROXY_FILE,
    '# Coloque aquí sus proxies residenciales (uno por línea)\n# http://usuario:contraseña@ip:puerto\n'
  );

  console.log('=== proxy-manager: todos los tests pasaron ===\n');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
