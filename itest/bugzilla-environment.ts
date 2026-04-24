import { spawnSync } from 'child_process';
import type { Environment } from 'vitest/environments';

function containerEngine(): string {
  for (const cmd of ['docker', 'podman']) {
    if (spawnSync('command', ['-v', cmd], { shell: true }).status === 0) {
      return cmd;
    }
  }
  throw new Error('Neither docker nor podman found');
}

export default <Environment>{
  name: 'server',
  viteEnvironment: 'ssr',
  setup() {
    const engine = containerEngine();

    spawnSync(engine, ['exec', 'integration', '/usr/local/bin/backup-db'], {
      stdio: 'inherit',
    });

    return {
      teardown() {
        spawnSync(
          engine,
          ['exec', 'integration', '/usr/local/bin/restore-db'],
          {
            stdio: 'inherit',
          }
        );
      },
    };
  },
};
