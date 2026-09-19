import type { WASocket } from '@whiskeysockets/baileys';

let sockInstance: WASocket | null = null;
let ownerJid: string | null = null;

export function initAlerts(sock: WASocket, ownerNumber: string) {
  sockInstance = sock;
  // Formato JID de WhatsApp
  ownerJid = ownerNumber.includes('@') ? ownerNumber : `${ownerNumber}@s.whatsapp.net`;
}

export type AlertLevel = 'info' | 'warning' | 'error' | 'success';

const ICONS: Record<AlertLevel, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  success: '✅',
};

/**
 * Envía una alerta al propietario del bot por WhatsApp.
 */
export async function sendAlert(
  title: string,
  message: string,
  level: AlertLevel = 'info'
) {
  if (!sockInstance || !ownerJid) {
    console.log(`[ALERTA ${level.toUpperCase()}] ${title}: ${message}`);
    return;
  }

  const text =
    `${ICONS[level]} *${title}*\n\n` +
    `${message}\n\n` +
    `_Bot-Terabox • ${new Date().toLocaleString()}_`;

  try {
    await sockInstance.sendMessage(ownerJid, { text });
  } catch (err) {
    console.error('No se pudo enviar la alerta al propietario:', err);
  }
}

export async function alertSessionExpired() {
  await sendAlert(
    'Sesión de TeraBox expirada',
    'La cookie NDUS ya no es válida.\nUse *.teraboxcreate* para generar una nueva cuenta.',
    'warning'
  );
}

export async function alertAccountCreated(email: string) {
  await sendAlert(
    'Cuenta de TeraBox creada',
    `Se creó una nueva cuenta correctamente.\nEmail: ${email}\nLa sesión ha sido guardada.`,
    'success'
  );
}

export async function alertDownloadFailed(url: string, reason: string) {
  await sendAlert(
    'Error en descarga de TeraBox',
    `No se pudo procesar el enlace:\n${url}\n\nMotivo: ${reason}`,
    'error'
  );
}

export async function alertRegistrationFailed(reason: string) {
  await sendAlert(
    'Error al crear cuenta de TeraBox',
    `El registro semi-automático falló.\n\nMotivo: ${reason}\n\nRevise los logs o intente de nuevo más tarde.`,
    'error'
  );
}
