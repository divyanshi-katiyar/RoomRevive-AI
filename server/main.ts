import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import app from './app.js';
import { connectDB } from './db/connection.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runServer() {
  const distExists = fs.existsSync(path.resolve(__dirname, '..', 'dist', 'index.html')) || fs.existsSync(path.resolve(__dirname, 'dist', 'index.html')) || fs.existsSync(path.resolve(__dirname, 'index.html'));
  const isProd = process.env.NODE_ENV === 'production' || (distExists && process.env.NODE_ENV !== 'development');

  // In AI Studio / Cloud Run, Nginx reverse proxy listens on 8080 and proxies to 3000.
  // The Node application must listen on port 3000 per the runtime constraints.
  const PORT = process.env.PORT && process.env.PORT !== '8080' ? Number(process.env.PORT) : 3000;

  // Resolve dist directory containing the compiled client assets
  let distDir = path.resolve(__dirname, '..', 'dist');
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    if (fs.existsSync(path.join(__dirname, 'dist', 'index.html'))) {
      distDir = path.join(__dirname, 'dist');
    } else if (fs.existsSync(path.join(__dirname, 'index.html'))) {
      distDir = __dirname;
    } else {
      distDir = path.resolve(process.cwd(), 'dist');
    }
  }

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Mount Vite development middlewares
    app.use(vite.middlewares);
  } else {
    // In production, serve static assets built by Vite
    console.log(`[Production] Serving static files from: ${distDir}`);
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(500).send('Production client build (index.html) not found.');
      }
    });
  }

  // Establish MongoDB Atlas connection before serving requests
  await connectDB();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ RoomRevive AI server active on port ${PORT} [${isProd ? 'production' : 'development'}]`);
  });

  return server;
}

// Automatically invoke only if running directly as the process entrypoint (e.g. node dist/server.js)
const isDirectEntry = process.argv[1] && (process.argv[1].endsWith('server/main.ts') || process.argv[1].endsWith('dist/server.js'));
if (isDirectEntry) {
  runServer().catch((err) => {
    console.error('Failed to start RoomRevive production server:', err);
    process.exit(1);
  });
}
