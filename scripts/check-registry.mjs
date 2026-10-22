import { realpathSync } from 'node:fs';
import { readFile, mkdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Always record into a fresh directory; historical reports are never fallback data. */
export async function recordRegistry({ rpc, directory = resolve('registry-observation'), rootDirectory = root }, io = console, execute = spawnSync) {
  let validUrl = false;
  try {
    validUrl = Boolean(rpc) && new URL(rpc).protocol === 'https:';
  } catch {
    // Do not echo potentially credential-bearing input.
  }
  if (!validUrl) {
    io.error('Usage: node scripts/check-registry.mjs https://YOUR_MAINNET_RPC [NEW_OUTPUT_DIRECTORY]');
    return 2;
  }
  try {
    // No recursive mkdir: an existing directory must never masquerade as this run.
    await mkdir(directory);
  } catch (error) {
    io.error(error?.code === 'EEXIST'
      ? 'Output directory already exists; choose a new directory. No observations were changed.'
      : 'Cannot create the output directory. Its parent must exist and be writable.');
    return 2;
  }
  try {
    const index = JSON.parse(await readFile(resolve(rootDirectory, 'registry/index.json'), 'utf8'));
    let exit = 0;
    for (const entry of index.entries) {
      if (!/^[a-z0-9-]+$/.test(entry.slug)) throw new Error('Invalid registry slug');
      const report = resolve(directory, `${entry.slug}.json`);
      const badge = resolve(directory, `${entry.slug}.svg`);
      const result = execute(process.execPath, [resolve(rootDirectory, 'dist/cli.js'), 'check', resolve(rootDirectory, 'registry', entry.manifest), '--rpc', rpc, '--strict', '--timeout', '10000', '--out', report, '--badge-out', badge], { encoding: 'utf8' });
      if (result.stdout) io.log(result.stdout);
      if (result.stderr) io.error(result.stderr);
      if (result.error || result.signal || result.status === null || result.status > 1) {
        io.error(`${entry.slug}: checker execution failed; no valid observation was recorded for this entry.`);
        exit = 3;
        continue;
      }
      try {
        if (!(await stat(report)).isFile() || !(await stat(badge)).isFile()) throw new Error('missing files');
      } catch {
        io.error(`${entry.slug}: checker did not write both observation files; this is an execution failure.`);
        exit = 3;
        continue;
      }
      io.log(`${entry.slug}: checker exit ${result.status}`);
      if (result.status !== 0 && exit === 0) exit = 1;
    }
    return exit;
  } catch {
    io.error('Cannot read or process the registry. No previous recorded observations were used.');
    return 3;
  }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  if (process.argv.length > 4) {
    console.error('Usage: node scripts/check-registry.mjs https://YOUR_MAINNET_RPC [NEW_OUTPUT_DIRECTORY]');
    process.exitCode = 2;
  } else {
    process.exitCode = await recordRegistry({ rpc: process.argv[2], directory: resolve(process.argv[3] ?? 'registry-observation') });
  }
}
