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

export function extractSurl(url: string): string | null {
  try {
    const match = url.match(/\/s\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function extractDlinkFromHtml(html: string): string | null {
  // Buscar "dlink":"https://..." o "dlink":"https:\/\/..."
  const marker = '"dlink"';
  let idx = html.indexOf(marker);
  while (idx !== -1) {
    const slice = html.slice(idx, idx + 500);
    const m = slice.match(/"dlink"\s*:\s*"([^"]+)"/);
    if (m && m[1]) {
      const raw = m[1].replace(/\\\//g, '/');
      if (raw.startsWith('http')) return raw;
    }
    idx = html.indexOf(marker, idx + 1);
  }
  return null;
}

function extractFilenameFromHtml(html: string): string {
  const m = html.match(/"server_filename"\s*:\s*"([^"]+)"/);
  return m ? m[1] : 'archivo_terabox';
}

function extractSizeFromHtml(html: string): number {
  const m = html.match(/"size"\s*:\s*"?(\d+)"?/);
  return m ? Number(m[1]) : 0;
}

export async function getFileInfo(
  surl: string,
  session: TeraboxSession
): Promise<TeraboxFileInfo | null> {
  const headers = buildHeaders(session);

  await humanDelay(300, 900);

  try {
    const res = await axios.get('https://www.terabox.com/api/shorturlinfo', {
      params: { app_id: '250528', shorturl: surl, root: 1 },
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

  try {
    const res = await axios.get('https://www.terabox.com/share/list', {
      params: { app_id: '250528', shorturl: surl, root: 1, page: 1, num: 50 },
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

  try {
    const pageRes = await axios.get('https://www.terabox.com/s/' + surl, {
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
    const dlink = extractDlinkFromHtml(html);
    if (dlink) {
      return {
        filename: extractFilenameFromHtml(html),
        size: extractSizeFromHtml(html),
        dlink,
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
