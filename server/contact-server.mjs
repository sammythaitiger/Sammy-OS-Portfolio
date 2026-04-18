import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { Resend } from 'resend';

const loadEnvFile = (filename) => {
  const filePath = path.resolve(process.cwd(), filename);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, 'utf8');

  for (const line of contents.split('\n')) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split('=');
    if (!key) {
      continue;
    }

    const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
};

loadEnvFile('.env.local');
loadEnvFile('.env');

const PORT = Number(process.env.CONTACT_API_PORT ?? 8787);
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? 'samuelaroundtheworld@gmail.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Sammy OS <onboarding@resend.dev>';
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
};

const readBody = async (req) => {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('\n', '<br />');

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.url !== '/api/contact') {
    sendJson(res, 404, { ok: false, error: 'Not found' });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  const body = await readBody(req);

  if (!body || typeof body !== 'object') {
    sendJson(res, 400, { ok: false, error: 'Invalid JSON payload' });
    return;
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!message) {
    sendJson(res, 400, { ok: false, error: 'Message is required' });
    return;
  }

  if (message.length > 4000) {
    sendJson(res, 400, { ok: false, error: 'Message is too long' });
    return;
  }

  if (!resend) {
    sendJson(res, 500, {
      ok: false,
      error: 'Resend API key is missing',
      details: 'Set RESEND_API_KEY in .env.local.',
    });
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: 'Sammy OS transmission',
      text: `New message from Sammy OS portfolio:\n\n${message}\n`,
      html: `
        <div style="font-family: monospace; white-space: pre-wrap; color: #111;">
          <strong>New message from Sammy OS portfolio</strong>
          <br /><br />
          ${escapeHtml(message)}
        </div>
      `,
    });

    if (error) {
      throw error;
    }

    sendJson(res, 200, { ok: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown mail error';
    sendJson(res, 500, { ok: false, error: errorMessage });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Contact API listening on http://127.0.0.1:${PORT}`);
});
