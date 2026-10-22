import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { recordRegistry } from '../scripts/check-registry.mjs';

const capture = () => ({ log: vi.fn(), error: vi.fn() });

async function fixtureRoot() {
  const rootDirectory = await mkdtemp(join(tmpdir(), 'ca-registry-'));
  await mkdir(join(rootDirectory, 'registry'));
  await mkdir(join(rootDirectory, 'registry', 'reports'));
  await writeFile(join(rootDirectory, 'registry', 'index.json'), JSON.stringify({ entries: [{ slug: 'demo', manifest: 'manifests/demo.json', report: 'reports/demo.json' }] }));
  await writeFile(join(rootDirectory, 'registry', 'reports', 'demo.json'), 'old observation');
  return { rootDirectory, directory: join(rootDirectory, 'new-run'), rpc: 'https://rpc.example.com' };
}

describe('registry recording isolation', () => {
  it('invalid URLs are usage errors and never invoke the checker', async () => {
    const options = await fixtureRoot();
    const io = capture();
    const execute = vi.fn();
    expect(await recordRegistry({ ...options, rpc: 'invalid-url' }, io, execute)).toBe(2);
    expect(io.error).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
    expect(execute).not.toHaveBeenCalled();
  });

  it('refuses an existing directory and preserves its contents', async () => {
    const options = await fixtureRoot();
    await mkdir(options.directory);
    const sentinel = join(options.directory, 'demo.json');
    await writeFile(sentinel, 'previous observation');
    const io = capture();
    const execute = vi.fn();
    expect(await recordRegistry(options, io, execute)).toBe(2);
    expect(io.error).toHaveBeenCalledWith(expect.stringContaining('already exists'));
    expect(await readFile(sentinel, 'utf8')).toBe('previous observation');
    expect(execute).not.toHaveBeenCalled();
  });

  it('spawn failure fails explicitly and never copies historical reports', async () => {
    const options = await fixtureRoot();
    const io = capture();
    const execute = vi.fn(() => ({ error: new Error('spawn failed'), status: null, stdout: '', stderr: '' }));
    expect(await recordRegistry(options, io, execute)).toBe(3);
    expect(io.error).toHaveBeenCalledWith(expect.stringContaining('execution failed'));
    await expect(readFile(join(options.directory, 'demo.json'))).rejects.toThrow();
    expect(await readFile(join(options.rootDirectory, 'registry', 'reports', 'demo.json'), 'utf8')).toBe('old observation');
  });

  it('checker failure without a report cannot use a historical observation', async () => {
    const options = await fixtureRoot();
    const io = capture();
    expect(await recordRegistry(options, io, () => ({ status: 1, stdout: '', stderr: '' }))).toBe(3);
    expect(io.error).toHaveBeenCalledWith(expect.stringContaining('did not write both observation files'));
    await expect(readFile(join(options.directory, 'demo.json'))).rejects.toThrow();
  });
});
