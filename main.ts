import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setFlagsFromString } from 'node:v8';
import { run } from './solve.js';

setFlagsFromString('--no-incremental-marking');

const input = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const cases = JSON.parse(readFileSync(join(input, 'cases.json'), 'utf8'));
// Release each case's parsed rows as soon as its answer has been encoded.
const answers = cases.map(({ input }) => JSON.stringify(run(input)));
writeFileSync(join(output, 'answers.json'), '[' + answers.join(',') + ']');
