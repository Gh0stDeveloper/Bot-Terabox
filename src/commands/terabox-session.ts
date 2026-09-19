import { loadSession, isSessionValid, saveSession } from '../services/terabox-session.js';
import { createOneTeraboxAccount } from '../services/terabox-register.js';

export const teraboxSessionCommands = {
  command: ['teraboxsession', 'tbsession', 'teraboxcreate'],
  handler: async (m: any, { command, isOwner }: any) => {
    if (!isOwner) {
      return m.reply('Este comando solo está disponible para el propietario del bot.');
    }

    try {
      if (command === 'teraboxcreate') {
        await m.reply('⏳ Iniciando creación de una cuenta de TeraBox...\nEsto puede tardar 1-2 minutos.');
        const session = await createOneTeraboxAccount();
        return m.reply(
          `✅ Cuenta creada correctamente.\n\n` +
            `• Email: ${session.email}\n` +
            `• NDUS: ${session.ndus.slice(0, 22)}...\n` +
            `• Guardada en sessions/terabox.json`
        );
      }

      const session = await loadSession();

      if (!session) {
        return m.reply('No existe ninguna sesión de TeraBox guardada.\nUse *.teraboxcreate* para crear una.');
      }

      const valid = await isSessionValid(session);

      if (valid) {
        session.lastValidated = Date.now();
        await saveSession(session);
      }

      const createdDate = new Date(session.created).toLocaleString();
      const lastCheck = session.lastValidated
        ? new Date(session.lastValidated).toLocaleString()
        : 'Nunca';

      return m.reply(
        `*Estado de la sesión TeraBox*\n\n` +
          `• Estado: ${valid ? '✅ Válida' : '❌ Expirada o inválida'}\n` +
          `• Email: ${session.email || 'No disponible'}\n` +
          `• Creada: ${createdDate}\n` +
          `• Última validación: ${lastCheck}\n` +
          `• NDUS: ${session.ndus.slice(0, 20)}...`
      );
    } catch (err: any) {
      console.error(err);
      m.reply(`❌ Error: ${err.message}`);
    }
  },
};
