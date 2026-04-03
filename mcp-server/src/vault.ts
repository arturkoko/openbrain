import { readdir, readFile, stat, writeFile, mkdir } from 'fs/promises';
import { join, relative, extname } from 'path';

const VAULT_PATH = process.env.VAULT_PATH || '/opt/openbrain/vault';

export interface VaultFile {
  name: string;
  path: string;
  isDir: boolean;
  modified?: string;
  size?: number;
}

export async function listFolder(subpath: string = ''): Promise<VaultFile[]> {
  const fullPath = join(VAULT_PATH, subpath);
  const entries = await readdir(fullPath, { withFileTypes: true });
  const files: VaultFile[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const filePath = join(fullPath, entry.name);
    const relPath = relative(VAULT_PATH, filePath);
    const s = await stat(filePath);
    files.push({
      name: entry.name,
      path: relPath,
      isDir: entry.isDirectory(),
      modified: s.mtime.toISOString(),
      size: s.size,
    });
  }
  return files.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function readNote(subpath: string): Promise<string> {
  return readFile(join(VAULT_PATH, subpath), 'utf-8');
}

export async function writeNote(subpath: string, content: string): Promise<void> {
  const fullPath = join(VAULT_PATH, subpath);
  const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
  await mkdir(dir, { recursive: true });
  await writeFile(fullPath, content, 'utf-8');
}

export async function searchVault(queryStr: string): Promise<VaultFile[]> {
  const results: VaultFile[] = [];
  const q = queryStr.toLowerCase();
  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (extname(entry.name) === '.md') {
        const content = await readFile(fullPath, 'utf-8');
        if (entry.name.toLowerCase().includes(q) || content.toLowerCase().includes(q)) {
          const s = await stat(fullPath);
          results.push({
            name: entry.name,
            path: relative(VAULT_PATH, fullPath),
            isDir: false,
            modified: s.mtime.toISOString(),
            size: s.size,
          });
        }
      }
    }
  }
  await walk(VAULT_PATH);
  return results.sort((a, b) => (b.modified || '').localeCompare(a.modified || ''));
}

export async function listRecent(limit: number = 20): Promise<VaultFile[]> {
  const all: VaultFile[] = [];
  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (extname(entry.name) === '.md') {
        const s = await stat(fullPath);
        all.push({
          name: entry.name,
          path: relative(VAULT_PATH, fullPath),
          isDir: false,
          modified: s.mtime.toISOString(),
          size: s.size,
        });
      }
    }
  }
  await walk(VAULT_PATH);
  return all.sort((a, b) => (b.modified || '').localeCompare(a.modified || '')).slice(0, limit);
}
