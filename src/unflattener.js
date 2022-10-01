const fs = require('fs');

const unflattener = {
  /**
   * Unflattens a solidity file.
   * @param {string} fileName The filename to be unflattened.
   * @param {string} [output] The output directory to receive the unflattened files.
   * @param {boolean} [withDependencies] If true, also unflatten external dependencies.
   */
  execute: (fileName, output = 'output', withDependencies = false) => {
    console.log('\nUnflattening file:', fileName, '\n');

    try {
      fs.statSync(fileName);
    } catch {
      console.error(`Error: file "${fileName}" was not found`);
      process.exit(1);
    }

    const source = fs.readFileSync(fileName, 'utf8');

    const license = /SPDX-License-Identifier: (.*)\n/.exec(source);

    const filePattern =
      /\/\/ Dependency file: |\/\/ Root file: |\/\/ File: |\/\/ File\s/g;

    const files = source.split(filePattern);

    let written = 0;

    for (const file of files) {
      const [head] = file.split('\n');

      const dir = head.split('/').slice(0, -1).join('/');

      const contents = file
        .split('\n')
        .slice(1)
        .join('\n')
        .replace(/\/\/ import (.*)\n/g, 'import $1\n')
        .replace(/\/\/ pragma (.*)\n/g, 'pragma $1\n');

      if (
        (head.startsWith('@') && !withDependencies) ||
        head.trim() === '' ||
        !contents.includes('pragma solidity')
      ) {
        continue;
      }

      console.log(head);

      const result = (
        contents.includes('// SPDX-License-Identifier')
          ? `${contents.trim()}\n`
          : `// SPDX-License-Identifier: ${license[1]}\n\n${contents.trim()}\n`
      ).replace(/(\n\n\n)+/g, '\n');

      const fileName = head.replace(/\.sol@.*/, '.sol').trim();

      fs.mkdirSync(`${output}/${dir}`, { recursive: true });
      fs.writeFileSync(`${output}/${fileName}`, result, {
        flag: 'w',
      });

      written++;
    }

    console.log(
      `\nSuccessfully unflattened ${written} files to folder "${output}". Happy coding! ✨`
    );
  },
};

module.exports = unflattener;
