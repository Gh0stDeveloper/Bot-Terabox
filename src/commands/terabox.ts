import axios from 'axios';
import { loadSession, isSessionValid, getCookieHeader } from '../services/terabox-session.js';

export const teraboxDownloadCommand = {
  command: ['terabox', 'tb'],
  handler: async (m: any, { conn, args }: any) => {
    if (!args[0]) {
      return m.reply(
        'Envíe el enlace de TeraBox.\nEjemplo:\n.terabox https://www.terabox.com/s/1AbC...'
      );
    }

    try {
      const session = await loadSession();
      if (!session) {
        return m.reply('No hay sesión de TeraBox. Use *.teraboxcreate* primero.');
      }

      const valid = await isSessionValid(session);
      if (!valid) {
        return m.reply(
          'La sesión de TeraBox ha expirado.\nUse *.teraboxcreate* para generar una nueva cuenta.'
        );
      }

      const url = args[0];
      const surl = url.split('/s/')[1]?.split(/[/?]/)[0];
      if (!surl) {
        return m.reply('Enlace de TeraBox no válido.');
      }

      await m.reply('⏳ Obteniendo información del archivo...');

      const cookie = getCookieHeader(session);

      const infoRes = await axios.get('https://www.terabox.com/api/shorturlinfo', {
        params: {
          app_id: '250528',
          shorturl: surl,
          root: 1,
        },
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Cookie: cookie,
        },
        timeout: 20000,
      });

      const file = infoRes.data?.list?.[0];
      if (!file) {
        return m.reply(
          'No se pudo leer el archivo. Puede ser privado, requerir contraseña o la sesión no tiene permisos.'
        );
      }

      let downloadUrl = file.dlink || file.thumbs?.url3 || null;

      if (!downloadUrl) {
        const listRes = await axios.get('https://www.terabox.com/share/list', {
          params: {
            app_id: '250528',
            shorturl: surl,
            dir: file.path || '/',
            page: 1,
            num: 20,
          },
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Cookie: cookie,
          },
        });

        downloadUrl = listRes.data?.list?.[0]?.dlink || null;
      }

      if (!downloadUrl) {
        return m.reply(
          'No se pudo obtener el enlace directo de descarga. El archivo puede requerir permisos adicionales.'
        );
      }

      const fileName = file.server_filename || file.filename || 'archivo_terabox';
      const size = file.size ? `(${(file.size / 1024 / 1024).toFixed(2)} MB)` : '';

      await m.reply(`📥 Descargando: *${fileName}* ${size}`);

      await conn.sendMessage(
        m.chat,
        {
          document: { url: downloadUrl },
          mimetype: 'application/octet-stream',
          fileName: fileName,
        },
        { quoted: m }
      );
    } catch (error: any) {
      console.error('Error en .terabox:', error);
      m.reply(
        `❌ Error al procesar el enlace de TeraBox.\n${error.message || 'Intente de nuevo más tarde.'}`
      );
    }
  },
};
