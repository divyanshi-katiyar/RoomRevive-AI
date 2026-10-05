import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawn } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

// Ensure both CLERK_PUBLISHABLE_KEY and VITE_CLERK_PUBLISHABLE_KEY are in process.env
const pubKey = (process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY)?.trim();
if (pubKey) {
  process.env.CLERK_PUBLISHABLE_KEY = pubKey;
  process.env.VITE_CLERK_PUBLISHABLE_KEY = pubKey;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
const bundlePath = path.join(__dirname, 'dist', 'server.js');

async function bootstrap() {
  // 1. In production mode with compiled bundle, run the bundled production server directly
  if (isProd && fs.existsSync(bundlePath)) {
    const bundleImport = './dist/server.js';
    const { runServer } = await import(/* @vite-ignore */ bundleImport);
    if (typeof runServer === 'function') {
      await runServer();
    }
    return;
  }

  // 2. Check if running with tsx active
  const isTsx =
    process.execArgv.some((arg) => arg.includes('tsx')) ||
    Boolean(process.env.__TSX_ACTIVE__);

  if (!isTsx) {
    // When invoked via plain `node server.ts`, respawn with `--import tsx`
    const child = spawn(
      process.execPath,
      ['--import', 'tsx', __filename, ...process.argv.slice(2)],
      {
        stdio: 'inherit',
        env: { ...process.env, __TSX_ACTIVE__: '1' },
      }
    );

    child.on('exit', (code, signal) => {
      if (signal) process.kill(process.pid, signal);
      process.exit(code ?? 0);
    });

    process.on('SIGTERM', () => child.kill('SIGTERM'));
    process.on('SIGINT', () => child.kill('SIGINT'));
    return;
  }

  // 3. Running under tsx (development mode): load live server with Vite middleware
  const { runServer } = await import('./server/main.js');
  await runServer();
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap RoomRevive server:', err);
  process.exit(1);
});
