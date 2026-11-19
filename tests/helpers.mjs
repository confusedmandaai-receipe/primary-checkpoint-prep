import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildContent } from '../js/core/content.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

export function loadContentSync() {
  return buildContent({
    curriculum: read('data/curriculum.json'),
    qMaths: read('data/questions/maths.json'),
    qScience: read('data/questions/science.json'),
    qEnglish: read('data/questions/english.json'),
    lMaths: read('data/lessons/maths.json'),
    lScience: read('data/lessons/science.json'),
    lEnglish: read('data/lessons/english.json'),
    passages: read('data/passages.json'),
    writing: read('data/writing.json'),
    commandWords: read('data/command-words.json'),
  });
}
