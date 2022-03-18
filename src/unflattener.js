const fs = require('fs');

const unflattener = {
  /**
   * Unflattens a solidity file.
   * @param {string} fileName The filename to be unflattened.
   * @param {string} [output] The output directory to receive the unflattened files.
   * @param {boolean} [withDependencies] If true, also unflatten external dependencies.
   */
  execute: (fileName, output = 'output', withDependencies = false) => {
    try {
      fs.statSync(fileName);
    } catch {
      console.error(`Error: file "${fileName}" was not found`);
      process.exit(1);
    }

    const source = fs.readFileSync(fileName, 'utf8');

    const files = source.split(/\/\/ Dependency file: |\/\/ Root file: /g);

    const license = /SPDX-License-Identifier: (.*)\n/.exec(source);

    let written = 0;

    for (const file of files) {
      const [head] = file.split('\n');
      const dir = head.split('/').slice(0, -1).join('/');
      if ((head.startsWith('@') && !withDependencies) || head.trim() === '') {
        continue;
      }
      const contents = file
        .split('\n')
        .slice(1)
        .join('\n')
        .replace(/\/\/ import (.*)\n/g, 'import $1\n')
        .replace(/\/\/ pragma (.*)\n/g, 'pragma $1\n');

      const result = contents.includes('// SPDX-License-Identifier')
        ? `${contents.trim()}\n`
        : `// SPDX-License-Identifier: ${license[1]}\n\n${contents.trim()}\n`;

      fs.mkdirSync(`${output}/${dir}`, { recursive: true });
      fs.writeFileSync(`${output}/${head.trim()}`, result, {
        flag: 'w',
      });

      written++;
    }

    console.log(
      `Successfully unflattened ${written} files to folder "${output}". Happy coding! ✨`
    );
  },
};

module.exports = unflattener;
