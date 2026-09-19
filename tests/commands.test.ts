import { teraboxDownloadCommand } from '../src/commands/terabox.js';
import { teraboxSessionCommands } from '../src/commands/terabox-session.js';
import { extractSurl } from '../src/services/terabox-scraper.js';
import { getRandomUserAgent } from '../src/services/user-agents.js';

async function run() {
  console.log('=== Test: comandos y utilidades ===');

  // Verificar que los comandos exportan la estructura esperada
  if (!teraboxDownloadCommand.command.includes('terabox')) {
    throw new Error('teraboxDownloadCommand no registra el comando "terabox"');
  }
  if (typeof teraboxDownloadCommand.handler !== 'function') {
    throw new Error('teraboxDownloadCommand.handler no es una función');
  }
  console.log('OK - Comando .terabox registrado');

  if (!teraboxSessionCommands.command.includes('teraboxsession')) {
    throw new Error('teraboxSessionCommands no registra teraboxsession');
  }
  if (!teraboxSessionCommands.command.includes('teraboxcreate')) {
    throw new Error('teraboxSessionCommands no registra teraboxcreate');
  }
  if (typeof teraboxSessionCommands.handler !== 'function') {
    throw new Error('teraboxSessionCommands.handler no es una función');
  }
  console.log('OK - Comandos de sesión registrados');

  // extractSurl
  const cases = [
    ['https://www.terabox.com/s/1AbC123xyz', '1AbC123xyz'],
    ['https://1024terabox.com/s/abc_def-99', 'abc_def-99'],
    ['https://teraboxapp.com/s/XYZ789', 'XYZ789'],
    ['https://google.com', null],
    ['no-es-un-enlace', null],
  ] as const;

  for (const [url, expected] of cases) {
    const result = extractSurl(url);
    if (result !== expected) {
      throw new Error(`extractSurl("${url}") = ${result}, se esperaba ${expected}`);
    }
  }
  console.log('OK - extractSurl');

  // User-Agent
  const ua = getRandomUserAgent();
  if (!ua.includes('Mozilla')) {
    throw new Error('User-Agent inválido: ' + ua);
  }
  console.log('OK - getRandomUserAgent');

  // Simular handler de .terabox sin args (no debe lanzar)
  let replied = '';
  const mockM = {
    reply: async (text: string) => {
      replied = text;
    },
  };
  await teraboxDownloadCommand.handler(mockM, { conn: null, args: [] });
  if (!replied.toLowerCase().includes('enlace') && !replied.toLowerCase().includes('ejemplo')) {
    throw new Error('Handler .terabox sin args no respondió el mensaje de uso esperado');
  }
  console.log('OK - Handler .terabox sin argumentos');

  console.log('=== comandos: todos los tests pasaron ===\n');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
