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

function exec(engine: string, command: string) {
  const result = spawnSync(
    engine,
    ['exec', 'integration', `/usr/local/bin/${command}`],
    { stdio: 'inherit' }
  );
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${command} exited with status ${result.status}`);
}

export default <Environment>{
  name: 'server',
  viteEnvironment: 'ssr',
  setup() {
    const engine = containerEngine();

    exec(engine, 'backup-db');

    return {
      teardown() {
        exec(engine, 'restore-db');
      },
    };
  },
};
