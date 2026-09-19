import { chromium } from 'playwright';
import { createTempEmail, waitForCode } from './temp-email.js';
import { saveSession, TeraboxSession } from './terabox-session.js';
import { getRandomProxy } from './proxy-manager.js';
import { getRandomUserAgent } from './user-agents.js';

function humanDelay(min = 800, max = 2200) {
  return new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min + 1)) + min));
}

function generatePassword(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createOneTeraboxAccount() {
  const { address: email, token } = await createTempEmail();
  const password = generatePassword();
  const proxy = await getRandomProxy();
  const userAgent = getRandomUserAgent();

  console.log('Correo temporal:', email);
  console.log('Contraseña generada:', password);

  const launchOptions: any = {
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=1366,768',
    ],
  };

  if (proxy) {
    launchOptions.proxy = { server: proxy };
  }

  const browser = await chromium.launch(launchOptions);

  const context = await browser.newContext({
    userAgent,
    viewport: { width: 1366, height: 768 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    permissions: [],
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    },
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    // @ts-ignore
    window.chrome = { runtime: {} };
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
  });

  const page = await context.newPage();

  try {
    await page.goto('https://www.terabox.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await humanDelay(1500, 3000);

    await page.click('text=Login');
    await humanDelay(1200, 2500);

    const emailSelectors = [
      'div:has(svg) >> nth=1',
      '[class*="email"]',
      'img[src*="email"]',
      'div[class*="icon"]:nth-child(2)',
    ];

    let clicked = false;
    for (const sel of emailSelectors) {
      try {
        await page.click(sel, { timeout: 2500 });
        clicked = true;
        break;
      } catch {}
    }

    if (!clicked) {
      console.log('No se detectó el icono de email. Haga clic manualmente en el icono de sobre.');
      await page.waitForTimeout(10000);
    }

    await humanDelay(1000, 2000);

    const emailInput = await page.waitForSelector('input[placeholder*="email" i], input[type="email"]', {
      timeout: 10000,
    });
    await emailInput.click();
    await humanDelay(400, 900);
    await emailInput.type(email, { delay: 80 + Math.random() * 60 });

    await humanDelay(600, 1400);

    const passInput = await page.waitForSelector('input[placeholder*="password" i], input[type="password"]');
    await passInput.click();
    await humanDelay(300, 700);
    await passInput.type(password, { delay: 70 + Math.random() * 50 });

    await humanDelay(900, 1800);

    await page.click('button:has-text("Login"), button:has-text("Sign up"), button:has-text("Register")');

    console.log('Esperando código de verificación...');
    const code = await waitForCode(token);

    if (!code) {
      throw new Error('No se recibió el código de verificación a tiempo');
    }

    console.log('Código recibido:', code);
    await humanDelay(1000, 2000);

    const codeInput = await page.waitForSelector(
      'input[placeholder*="code" i], input[name*="code"], input[placeholder*="verif" i]',
      { timeout: 15000 }
    );
    await codeInput.click();
    await humanDelay(400, 800);
    await codeInput.type(code, { delay: 90 + Math.random() * 40 });

    await humanDelay(800, 1500);
    await page.click(
      'button:has-text("Verify"), button:has-text("Confirm"), button:has-text("Submit"), button:has-text("Login")'
    );

    await humanDelay(4000, 7000);

    const cookies = await context.cookies();
    const ndus = cookies.find(c => c.name === 'NDUS')?.value;
    const browserid = cookies.find(c => c.name === 'browserid')?.value || '';

    if (!ndus) {
      throw new Error('No se pudo obtener la cookie NDUS');
    }

    const session: TeraboxSession = {
      ndus,
      browserid,
      email,
      password,
      created: Date.now(),
      lastValidated: Date.now(),
    };

    await saveSession(session);
    console.log('Cuenta creada y sesión guardada correctamente');

    return session;
  } finally {
    await browser.close();
  }
}
