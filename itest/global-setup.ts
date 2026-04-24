import { type SpawnSyncReturns, spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function run(command: string, args: string[] = []): SpawnSyncReturns<Buffer> {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${command} exited with status ${result.status}`);
  return result;
}

export function setup() {
  run(path.join(__dirname, 'start_container.sh'));
}

export function teardown() {
  run(path.join(__dirname, 'stop_container.sh'));
}
