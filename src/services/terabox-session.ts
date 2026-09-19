import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';

const SESSION_FILE = path.join(process.cwd(), 'sessions/terabox.json');

export interface TeraboxSession {
  ndus: string;
  browserid: string;
  email?: string;
  password?: string;
  created: number;
  lastValidated?: number;
}

export async function loadSession(): Promise<TeraboxSession | null> {
  if (!(await fs.pathExists(SESSION_FILE))) return null;
  return fs.readJson(SESSION_FILE);
}

export async function saveSession(session: TeraboxSession) {
  await fs.ensureDir(path.dirname(SESSION_FILE));
  await fs.writeJson(SESSION_FILE, session, { spaces: 2 });
}

export async function isSessionValid(session: TeraboxSession): Promise<boolean> {
  try {
    const res = await axios.get('https://www.terabox.com/api/user/getinfo', {
      headers: {
        Cookie: `NDUS=${session.ndus}; browserid=${session.browserid || ''}; lang=en`,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      timeout: 12000,
    });

    return res.data?.errno === 0 || res.status === 200;
  } catch {
    return false;
  }
}

export function getCookieHeader(session: TeraboxSession): string {
  return `NDUS=${session.ndus}; browserid=${session.browserid || ''}; lang=en`;
}
