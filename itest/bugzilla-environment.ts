import { spawnSync } from 'child_process';
import path from 'path';
import type { Environment } from 'vitest/environments';

export default <Environment>{
  name: 'server',
  transformMode: 'ssr',
  setup() {
    spawnSync(path.join(__dirname, 'start_container.sh'), {
      stdio: 'inherit',
    });

    spawnSync('docker', ['exec', 'integration', '/usr/local/bin/backup-db'], {
      stdio: 'inherit',
    });

    return {
      teardown() {
        spawnSync(
          'docker',
          ['exec', 'integration', '/usr/local/bin/restore-db'],
          {
            stdio: 'inherit',
          },
        );
        spawnSync(path.join(__dirname, 'stop_container.sh'), {
          stdio: 'inherit',
        });
      },
    };
  },
};
