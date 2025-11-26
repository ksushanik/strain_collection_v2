#!/usr/bin/env node
/**
 * Sync docs/wiki -> frontend/public/wiki
 * Cross-platform copy without extra deps. Intended to be run manually or from CI.
 */
import { cp, mkdir, rm } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, 'docs', 'wiki');
const target = path.join(__dirname, 'frontend', 'public', 'wiki');

async function main() {
  // Clear target to avoid stale files
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
  await cp(source, target, { recursive: true });
  console.log(`Synced wiki: ${source} -> ${target}`);
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
