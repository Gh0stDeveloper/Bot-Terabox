import axios from 'axios';
import { getCookieHeader, TeraboxSession } from './terabox-session.js';

export interface TeraboxFileInfo {
  filename: string;
  size: number;
  dlink: string | null;
  path?: string;
  isdir?: number;
}

/**
 * Extrae el surl de un enlace de TeraBox.
 */
export function extractSurl(url: string): string | null {
  try {
    // Formatos comunes:
    // https://www.terabox.com/s/1AbC...
    // https://1024terabox.com/s/1AbC...
    // https://teraboxapp.com/s/1AbC...
    const match = url.match(/\/s\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Obtiene información del archivo usando la API oficial + fallback de scraping.
 */
export async function getFileInfo(
  surl: string,
  session: TeraboxSession
): Promise<TeraboxFileInfo | null> {
  const cookie = getCookieHeader(session);
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    Cookie: cookie,
    Referer: 'https://www.terabox.com/',
    Accept: 'application/json, text/plain, */*',
  };

  // --- Método 1: API shorturlinfo ---
  try {
    const res = await axios.get('https://www.terabox.com/api/shorturlinfo', {
      params: {
        app_id: '250528',
        shorturl: surl,
        root: 1,
      },
      headers,
      timeout: 15000,
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
  } catch (err) {
    console.log('Método shorturlinfo falló, intentando fallback...');
  }

  // --- Método 2: share/list ---
  try {
    const res = await axios.get('https://www.terabox.com/share/list', {
      params: {
        app_id: '250528',
        shorturl: surl,
        root: 1,
        page: 1,
        num: 50,
      },
      headers,
      timeout: 15000,
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
  } catch (err) {
    console.log('Método share/list falló');
  }

  // --- Método 3: Scraping de la página de share (último recurso) ---
  try {
    const pageRes = await axios.get(`https://www.terabox.com/s/${surl}`, {
      headers: {
        ...headers,
        Accept: 'text/html,application/xhtml+xml',
      },
      timeout: 20000,
    });

    const html = pageRes.data as string;

    // Buscar dlink o datos embebidos en scripts
    const dlinkMatch = html.match(/"dlink"\s*:\s*"(https?:\\/\\/[^"\\]+)/);
    if (dlinkMatch) {
      const dlink = dlinkMatch[1].replace(/\\\//g, '/');
      const nameMatch = html.match(/"server_filename"\s*:\s*"([^"]+)"/);
      const sizeMatch = html.match(/"size"\s*:\s*(\d+)/);

      return {
        filename: nameMatch ? nameMatch[1] : 'archivo_terabox',
        size: sizeMatch ? Number(sizeMatch[1]) : 0,
        dlink,
      };
    }
  } catch (err) {
    console.log('Scraping de página falló');
  }

  return null;
}

/**
 * Intenta obtener un enlace de descarga más limpio (a veces el dlink requiere headers extra).
 */
export async function resolveDirectLink(
  dlink: string,
  session: TeraboxSession
): Promise<string> {
  // En muchos casos el dlink ya es usable.
  // Si en el futuro TeraBox exige más pasos, aquí se puede ampliar.
  return dlink;
}
