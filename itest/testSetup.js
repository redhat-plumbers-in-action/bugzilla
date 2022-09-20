const { spawnSync } = require('child_process');

beforeAll(() => {
  spawnSync('docker', ['exec', 'integration', '/usr/local/bin/backup-db'], {
    stdio: 'inherit',
  });
});

afterAll(() => {
  spawnSync('docker', ['exec', 'integration', '/usr/local/bin/restore-db'], {
    stdio: 'inherit',
  });
});
