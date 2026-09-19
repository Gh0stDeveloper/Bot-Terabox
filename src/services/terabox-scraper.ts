import axios from 'axios';
import { getCookieHeader, TeraboxSession } from './terabox-session.js';
import { getRandomUserAgent } from './user-agents.js';

export interface TeraboxFileInfo {
  filename: string;
  size: number;
  dlink: string | null;
  path?: string;
  isdir?: number;
}

function humanDelay(min = 400, max = 1200) {
  return new Promise((r) => setTimeout(r, Math.floor(Math.random() * (max - min + 1)) + min));
}

function buildHeaders(session: TeraboxSession, extra: Record<string, string> = {}) {
  const ua = getRandomUserAgent();
  return {
    'User-Agent': ua,
    Cookie: getCookieHeader(session),
    Referer: 'https://www.terabox.com/',
    Origin: 'https://www.terabox.com',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    ...extra,
  };
}

/**
 * Extrae el surl de un enlace de TeraBox.
 */
export function extractSurl(url: string): string | null {
  try {
    const match = url.match(/\/s\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Obtiene información del archivo con técnicas anti-bot.
 */
export async function getFileInfo(
  surl: string,
  session: TeraboxSession
): Promise<TeraboxFileInfo | null> {
  const headers = buildHeaders(session);

  await humanDelay(300, 900);

  // Método 1: API shorturlinfo
  try {
    const res = await axios.get('https://www.terabox.com/api/shorturlinfo', {
      params: {
        app_id: '250528',
        shorturl: surl,
        root: 1,
      },
      headers,
      timeout: 15000,
      validateStatus: (s) => s < 500,
    });

    const file = res.data?.list?.[0];
    if (file) {
      return {
        filename: file.server_filename || file.filename || 'archivo_terabox',
        size: Number(file.size) || 0,
        dlink: file.dlink || null,
        path: file.path,
        isdir: file.isdir,
      };
    }
  } catch {
    console.log('Método shorturlinfo falló, intentando fallback...');
  }

  await humanDelay(500, 1400);

  // Método 2: share/list
  try {
    const res = await axios.get('https://www.terabox.com/share/list', {
      params: {
        app_id: '250528',
        shorturl: surl,
        root: 1,
        page: 1,
        num: 50,
      },
      headers: buildHeaders(session),
      timeout: 15000,
      validateStatus: (s) => s < 500,
    });

    const file = res.data?.list?.[0];
    if (file) {
      return {
        filename: file.server_filename || file.filename || 'archivo_terabox',
        size: Number(file.size) || 0,
        dlink: file.dlink || null,
        path: file.path,
        isdir: file.isdir,
      };
    }
  } catch {
    console.log('Método share/list falló');
  }

  await humanDelay(600, 1500);

  // Método 3: Scraping HTML
  try {
    const pageRes = await axios.get(`https://www.terabox.com/s/${surl}`, {
      headers: {
        ...buildHeaders(session, {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'none',
          'Upgrade-Insecure-Requests': '1',
        }),
      },
      timeout: 20000,
      validateStatus: (s) => s < 500,
    });

    const html = String(pageRes.data);

    // dlink en JSON escapado (\/)
    let dlinkMatch = html.match(/"dlink"\s*:\s*"(https?:\\/\\/[^"\\]+)"/);
    if (!dlinkMatch) {
      // dlink con barras normales
      dlinkMatch = html.match(/"dlink"\s*:\s*"(https?:\/\/[^"\\]+)"/);
    }

    if (dlinkMatch) {
      const dlink = dlinkMatch[1].replace(/\\\//g, '/');
      const nameMatch = html.match(/"server_filename"\s*:\s*"([^"]+)"/);
      const sizeMatch = html.match(/"size"\s*:\s*"?(\d+)"?/);

      return {
        filename: nameMatch ? nameMatch[1] : 'archivo_terabox',
        size: sizeMatch ? Number(sizeMatch[1]) : 0,
        dlink,
      };
    }

    // Búsqueda alternativa de URL de descarga
    const urlMatch = html.match(
      /(https?:\/\/[^\s"']+(?:terabox|dubox|freeterabox)[^\s"']*download[^\s"']*)/i
    );
    if (urlMatch) {
      return {
        filename: 'archivo_terabox',
        size: 0,
        dlink: urlMatch[1],
      };
    }
  } catch {
    console.log('Scraping de página falló');
  }

  return null;
}

export async function resolveDirectLink(
  dlink: string,
  _session: TeraboxSession
): Promise<string> {
  return dlink;
}
