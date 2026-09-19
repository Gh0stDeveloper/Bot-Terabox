import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs-extra';

import { teraboxDownloadCommand } from './commands/terabox.js';
import { teraboxSessionCommands } from './commands/terabox-session.js';
import { initAlerts } from './services/alerts.js';

const commands = [teraboxDownloadCommand, teraboxSessionCommands];

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('sessions/auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('Escanee el código QR con WhatsApp:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Conexión cerrada. Reconectando:', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('Bot conectado correctamente');

      // Inicializar sistema de alertas
      const ownerNumber = process.env.OWNER_NUMBER || '';
      if (ownerNumber) {
        initAlerts(sock, ownerNumber);
        console.log('Sistema de alertas inicializado para el propietario');
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      '';

    if (!text.startsWith('.')) return;

    const [cmd, ...args] = text.slice(1).trim().split(/\s+/);
    const command = cmd.toLowerCase();

    const ownerNumber = process.env.OWNER_NUMBER || '';
    const sender = m.key.remoteJid?.split('@')[0] || '';
    const isOwner = sender === ownerNumber;

    for (const cmdObj of commands) {
      if (cmdObj.command.includes(command)) {
        try {
          await cmdObj.handler(
            {
              reply: (text: string) =>
                sock.sendMessage(m.key.remoteJid!, { text }, { quoted: m }),
              chat: m.key.remoteJid,
            },
            {
              conn: sock,
              args,
              command,
              isOwner,
            }
          );
        } catch (err) {
          console.error('Error en comando:', err);
        }
        break;
      }
    }
  });
}

fs.ensureDirSync(path.join(process.cwd(), 'sessions'));

startBot().catch(console.error);
