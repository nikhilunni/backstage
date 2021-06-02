/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import program from 'commander';
import chalk from 'chalk';
import { codemods } from './codemods';
import { exitWithError } from './errors';
import { createCodemodAction } from './action';
import { version } from '../package.json';

async function main(argv: string[]) {
  program.name('backstage-codemods').version(version);

  for (const codemod of codemods) {
    program
      .command(`${codemod.name} <target-dir>`)
      .description(codemod.description)
      .option('-d, --dry', 'Dry run, no changes written to files')
      .action(createCodemodAction(codemod.name));
  }

  program.on('command:*', () => {
    console.log();
    console.log(chalk.red(`Invalid command: ${program.args.join(' ')}`));
    console.log();
    program.outputHelp();
    process.exit(1);
  });

  program.parse(argv);
}

process.on('unhandledRejection', (rejection: unknown) => {
  if (rejection instanceof Error) {
    exitWithError(rejection);
  } else {
    exitWithError(new Error(`Unknown rejection: '${rejection}'`));
  }
});

main(process.argv).catch(exitWithError);