const { spawnSync } = require('child_process');
const path = require('path');

module.exports = async () => {
  spawnSync(path.join(__dirname, 'stop_container.sh'), {
    stdio: 'inherit',
  });
};
