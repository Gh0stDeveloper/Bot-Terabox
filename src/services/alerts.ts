import type { WASocket } from '@whiskeysockets/baileys';

let sockInstance: WASocket | null = null;
let ownerJid: string | null = null;

// Control simple de frecuencia para no spamear al propietario
const lastAlertAt: Record<string, number> = {};
const ALERT_COOLDOWN_MS = 60_000; // 1 minuto entre alertas del mismo tipo

export function initAlerts(sock: WASocket, ownerNumber: string) {
  sockInstance = sock;
  ownerJid = ownerNumber.includes('@') ? ownerNumber : `${ownerNumber}@s.whatsapp.net`;
}

export type AlertLevel = 'info' | 'warning' | 'error' | 'success';

const ICONS: Record<AlertLevel, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  success: '✅',
};

function canSend(key: string): boolean {
  const now = Date.now();
  const last = lastAlertAt[key] || 0;
  if (now - last < ALERT_COOLDOWN_MS) return false;
  lastAlertAt[key] = now;
  return true;
}

/**
 * Envía una alerta al propietario del bot por WhatsApp.
 * Incluye control de frecuencia para evitar spam.
 */
export async function sendAlert(
  title: string,
  message: string,
  level: AlertLevel = 'info',
  key?: string
) {
  const alertKey = key || `${level}:${title}`;

  if (!canSend(alertKey)) {
    console.log(`[ALERTA SUPRIMIDA - cooldown] ${title}`);
    return;
  }

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
    'warning',
    'session_expired'
  );
}

export async function alertAccountCreated(email: string) {
  await sendAlert(
    'Cuenta de TeraBox creada',
    `Se creó una nueva cuenta correctamente.\nEmail: ${email}\nLa sesión ha sido guardada.`,
    'success',
    'account_created'
  );
}

export async function alertDownloadFailed(url: string, reason: string) {
  await sendAlert(
    'Error en descarga de TeraBox',
    `No se pudo procesar el enlace:\n${url}\n\nMotivo: ${reason}`,
    'error',
    'download_failed'
  );
}

export async function alertRegistrationFailed(reason: string) {
  await sendAlert(
    'Error al crear cuenta de TeraBox',
    `El registro semi-automático falló.\n\nMotivo: ${reason}\n\nRevise los logs o intente de nuevo más tarde.`,
    'error',
    'registration_failed'
  );
}

export async function alertInfo(title: string, message: string) {
  await sendAlert(title, message, 'info');
}
