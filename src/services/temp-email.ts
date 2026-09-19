import axios from 'axios';

const API = 'https://api.mail.tm';

export async function createTempEmail(): Promise<{ address: string; password: string; token: string }> {
  const domainsRes = await axios.get(`${API}/domains`);
  const domain = domainsRes.data['hydra:member'][0].domain;

  const username = Math.random().toString(36).substring(2, 12);
  const address = `${username}@${domain}`;
  const password = Math.random().toString(36).substring(2, 14) + 'A1!';

  await axios.post(`${API}/accounts`, {
    address,
    password,
  });

  const tokenRes = await axios.post(`${API}/token`, {
    address,
    password,
  });

  return {
    address,
    password,
    token: tokenRes.data.token,
  };
}

export async function waitForCode(token: string, maxAttempts = 30): Promise<string | null> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await axios.get(`${API}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const messages = res.data['hydra:member'] || [];
      if (messages.length > 0) {
        const msgId = messages[0].id;
        const detail = await axios.get(`${API}/messages/${msgId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const text = detail.data.text || detail.data.html || '';
        const match = text.match(/\b(\d{4,8})\b/);
        if (match) return match[1];
      }
    } catch (err) {
      console.log('Error consultando Mail.tm:', (err as any).message);
    }

    await new Promise(r => setTimeout(r, 3000));
  }
  return null;
}
