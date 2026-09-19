import { loadSession, isSessionValid } from '../services/terabox-session.js';
import { extractSurl, getFileInfo, resolveDirectLink } from '../services/terabox-scraper.js';
import { alertSessionExpired, alertDownloadFailed } from '../services/alerts.js';

export const teraboxDownloadCommand = {
  command: ['terabox', 'tb'],
  handler: async (m: any, { conn, args }: any) => {
    if (!args[0]) {
      return m.reply(
        'Envíe el enlace de TeraBox.\nEjemplo:\n.terabox https://www.terabox.com/s/1AbC...'
      );
    }

    const url = args[0];

    try {
      const session = await loadSession();
      if (!session) {
        return m.reply(
          'No hay sesión de TeraBox.\nUse *.teraboxcreate* para crear una cuenta (solo el propietario).'
        );
      }

      const valid = await isSessionValid(session);
      if (!valid) {
        await alertSessionExpired();
        return m.reply(
          '⚠️ La sesión de TeraBox ha expirado.\n\n' +
            'El propietario debe usar *.teraboxcreate* para generar una nueva cuenta.'
        );
      }

      const surl = extractSurl(url);
      if (!surl) {
        return m.reply('Enlace de TeraBox no válido.');
      }

      await m.reply('⏳ Obteniendo información del archivo...');

      const file = await getFileInfo(surl, session);

      if (!file) {
        await alertDownloadFailed(url, 'No se pudo obtener información del archivo');
        return m.reply(
          'No se pudo leer el archivo. Puede ser privado, requerir contraseña o la sesión no tiene permisos.'
        );
      }

      if (!file.dlink) {
        await alertDownloadFailed(url, 'No se encontró enlace directo (dlink)');
        return m.reply(
          'No se pudo obtener el enlace directo de descarga. El archivo puede requerir permisos adicionales.'
        );
      }

      const downloadUrl = await resolveDirectLink(file.dlink, session);
      const fileName = file.filename;
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
      await alertDownloadFailed(url, error.message || 'Error desconocido');
      m.reply(
        `❌ Error al procesar el enlace de TeraBox.\n${error.message || 'Intente de nuevo más tarde.'}`
      );
    }
  },
};
