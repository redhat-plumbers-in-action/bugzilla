import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function setup() {
  spawnSync(path.join(__dirname, 'start_container.sh'), {
    stdio: 'inherit',
  });
}

export function teardown() {
  spawnSync(path.join(__dirname, 'stop_container.sh'), {
    stdio: 'inherit',
  });
}
