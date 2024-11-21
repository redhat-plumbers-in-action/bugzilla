/* eslint-disable no-console */
const { promises: fs } = require('fs');
const path = require('path');

const NEXT_HEADER =
  /# \[[\d.]+\]\(https:\/\/github.com\/(.+)\/compare\/v[\d.]+\.\.\.v[\d.]+\)/;

async function main() {
  let root = path.dirname(path.resolve(__dirname));
  let package = path.join(root, 'package.json');
  let manifest = JSON.parse(await fs.readFile(package, { encoding: 'utf-8' }));

  let changelog = path.join(root, 'CHANGELOG.md');

  let content = await fs.readFile(changelog, { encoding: 'utf-8' });
  let lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    let matches = NEXT_HEADER.exec(lines[i]);
    if (matches) {
      lines.splice(
        i,
        0,
        `# [Next](https://github.com/${matches[1]}/compare/v${manifest.version}...main)`,
        ''
      );
      break;
    }
  }

  await fs.writeFile(changelog, lines.join('\n'));
}

main().catch(console.error);
