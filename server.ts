import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { BookingRecord } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'wanderly-store.json');

interface WanderlyStore {
  bookings: BookingRecord[];
  subscribers: string[];
  users: Array<{ name: string; email: string }>;
}

function readStore(): WanderlyStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    const initial: WanderlyStore = {
      bookings: [],
      subscribers: [],
      users: [],
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8')) as WanderlyStore;
  } catch {
    return { bookings: [], subscribers: [], users: [] };
  }
}

function writeStore(store: WanderlyStore): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/bookings', (req, res) => {
    const {
      destinationName,
      packageTitle,
      checkIn,
      checkOut,
      travelers,
      totalPriceInr,
      guestName,
      guestEmail,
    } = req.body as Omit<BookingRecord, 'id' | 'createdAt'>;

    if (!guestName?.trim() || !guestEmail?.trim() || !destinationName) {
      res.status(400).json({ error: 'Please complete your name, email, and destination.' });
      return;
    }

    const store = readStore();
    const record: BookingRecord = {
      id: `MSF-${Math.floor(100000 + Math.random() * 900000)}`,
      destinationName,
      packageTitle: packageTitle || `${destinationName} Curated Escape`,
      checkIn,
      checkOut,
      travelers: Number(travelers) || 2,
      totalPriceInr: Number(totalPriceInr) || 6999,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      createdAt: new Date().toISOString(),
    };

    store.bookings.unshift(record);
    writeStore(store);
    res.status(201).json({ booking: record });
  });

  app.post('/api/newsletter', (req, res) => {
    const { email } = req.body as { email?: string };
    const cleanEmail = email?.trim().toLowerCase() ?? '';
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    const store = readStore();
    if (!store.subscribers.includes(cleanEmail)) {
      store.subscribers.push(cleanEmail);
      writeStore(store);
    }
    res.status(201).json({ subscribed: true, email: cleanEmail });
  });

  app.post('/api/auth', (req, res) => {
    const { name, email, mode } = req.body as {
      name?: string;
      email?: string;
      mode?: 'login' | 'signup';
    };
    const cleanEmail = email?.trim().toLowerCase() ?? '';
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    const store = readStore();
    const existing = store.users.find((u) => u.email === cleanEmail);
    const resolvedName =
      name?.trim() || existing?.name || cleanEmail.split('@')[0] || 'Traveler';

    if (mode === 'signup' || !existing) {
      if (!existing) {
        store.users.push({ name: resolvedName, email: cleanEmail });
        writeStore(store);
      }
    }

    res.json({
      user: {
        name: resolvedName,
        email: cleanEmail,
      },
    });
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Wanderly server running on http://localhost:${port}`);
  });
}

startServer();
