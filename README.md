# Bot-Terabox

### WhatsApp bot for authorized TeraBox file retrieval

This repository contains a self-hosted WhatsApp bot designed to process supported TeraBox links using a single configured account per instance.

## Main features

- WhatsApp command integration.
- Download handling for supported public or authorized links.
- Session validation and controlled retry behavior.
- Operator notifications.
- Optional proxy configuration.
- Automated tests for commands and session-handling logic.

## Technical requirements

- Node.js 20 or later.
- A WhatsApp account for bot pairing.
- An authorized TeraBox account or access to publicly shared files.
- Browser dependencies where required by the installed components.

## Local setup

```bash
npm install
npx playwright install chromium
```

Read and configure the repository's environment settings before launching an instance. Store any session credentials outside source control.

## Operating principles

The bot is designed around **one TeraBox account per instance**. It does not advertise bulk account creation, pooled sessions or access to files without permission. Third-party service limitations and terms remain applicable.

---

**Bot-Terabox — a self-hosted file-link workflow.**
