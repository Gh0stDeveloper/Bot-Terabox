import fs from 'fs-extra';
import path from 'path';

const PROXY_FILE = path.join(process.cwd(), 'sessions/proxies.txt');

export async function getRandomProxy(): Promise<string | null> {
  if (!(await fs.pathExists(PROXY_FILE))) return null;

  const content = await fs.readFile(PROXY_FILE, 'utf-8');
  const proxies = content
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));

  if (proxies.length === 0) return null;

  const random = proxies[Math.floor(Math.random() * proxies.length)];
  console.log('Proxy seleccionado:', random.replace(/:[^:@]+@/, ':****@'));
  return random;
}
