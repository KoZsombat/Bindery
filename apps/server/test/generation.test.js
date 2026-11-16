import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'book-builder-gen-'));
process.env.BETTER_AUTH_SECRET = 'test-secret-0123456789';
process.env.LLM_MOCK = '0';
process.env.CHAPTER_BATCH_SIZE = '2';

const { buildBook } = await import('../src/services/generation.js');
const { updateSettings } = await import('../src/db/index.js');

const req = {
  title: 'BME first year programming', topic: 'C and C++', description: 'Full course.',
  audience: 'first-year BSc', language: 'both',
  long_text: 'PART I chapters 1-13. PART II chapters 14-22. Cover functions, pointers, files, OOP, STL.'
};

function chapter(id, num, title) {
  return {
    id, num,
    title: { hu: title, en: title },
    lead: { hu: 'Vezető szöveg.', en: 'A lead sentence.' },
    why: { hu: ['Mert számít.'], en: ['Because it matters.'] },
    when: { hu: 'Amikor kell.', en: 'When needed.' },
    minutes: 25,
    theory: [
      { type: 'def', title: { hu: 'Definíció', en: 'Definition' }, body: { hu: 'Magyarázat.', en: 'An explanation.' } },
      { type: 'code', title: { hu: 'Példa', en: 'Example' }, lang: 'c', code: 'int main(void) {\n  return 0;\n}' }
    ],
    examples: [{
      title: { hu: 'Példa', en: 'Example' },
      problem: { hu: 'Feladat.', en: 'A task.' },
      steps: { hu: ['Első lépés.'], en: ['First step.'] },
      answer: { hu: 'Megoldás.', en: 'The answer.' }
    }],
    mistakes: { hu: ['Hiba.'], en: ['A mistake.'] },
    exercises: [{
      q: { hu: 'Kérdés?', en: 'Question?' }, a: '1', type: 'number',
      hint: { hu: 'Tipp.', en: 'A hint.' }, sol: { hu: 'Megoldás.', en: 'Solution.' }
    }]
  };
}

const outline = {
  title: 'BME first year programming', subtitle: { hu: 'Alcím', en: 'Subtitle' },
  summary: { hu: 'Összefoglaló.', en: 'A summary.' },
  sections: [
    {
      id: 'c-basics', num: '01', title: { hu: 'C alapok', en: 'C basics' },
      subtitle: { hu: 'Első rész', en: 'First part' }, intro: { hu: 'Bevezetés.', en: 'Introduction.' },
      chapters: [
        { id: 'types', num: '1.1', title: { hu: 'Típusok', en: 'Types' }, focus: 'Types and input.' },
        { id: 'functions', num: '1.2', title: { hu: 'Függvények', en: 'Functions' }, focus: 'Functions and recursion.' },
        { id: 'pointers', num: '1.3', title: { hu: 'Mutatók', en: 'Pointers' }, focus: 'Pointers and memory.' }
      ]
    },
    {
      id: 'cpp', num: '02', title: { hu: 'C++', en: 'C++' },
      subtitle: { hu: 'Második rész', en: 'Second part' }, intro: { hu: 'Bevezetés.', en: 'Introduction.' },
      chapters: [
        { id: 'classes', num: '2.1', title: { hu: 'Osztályok', en: 'Classes' }, focus: 'Classes and RAII.' },
        { id: 'inheritance', num: '2.2', title: { hu: 'Öröklés', en: 'Inheritance' }, focus: 'Inheritance and polymorphism.' },
        { id: 'stl', num: '2.3', title: { hu: 'STL', en: 'STL' }, focus: 'Templates and the STL.' }
      ]
    }
  ]
};

function targetIds(messages) {
  const prompt = messages.at(-1).content;
  return [...prompt.matchAll(/id "([^"]+)"/g)].map(m => m[1]);
}

function stub({ failBatches = false } = {}) {
  const calls = [];
  const call = async (_cfg, messages) => {
    const prompt = messages.at(-1)?.content || '';
    calls.push(prompt);
    if (prompt.includes('Design the COMPLETE outline')) return JSON.stringify(outline);
    if (prompt.includes('WRITE EXACTLY THESE CHAPTERS')) {
      const ids = targetIds(messages);
      if (failBatches && ids.length > 1) return '{"chapters":[';
      return JSON.stringify({ chapters: ids.map(id => chapter(id, id === 'types' ? '1.1' : '9.' + id, 'Chapter ' + id)) });
    }
    throw new Error('Unexpected prompt: ' + prompt.slice(0, 80));
  };
  return { call, calls };
}

test('buildBook writes an outline, then chapters in batches', async () => {
  const { call, calls } = stub();
  const book = await buildBook({ cfg: {}, req, skill: 'skill', call, maxChapters: 30, batchSize: 2 });
  assert.equal(book.sections.length, 2);
  assert.equal(book.sections.flatMap(s => s.chapters).length, 6);
  assert.equal(calls.length, 1 + 4, 'one outline call plus two batches per section');
  assert.deepEqual(book.sections[0].chapters.map(c => c.id), ['types', 'functions', 'pointers']);
  assert.equal(book.sections[1].chapters.at(-1).id, 'stl');
  const code = book.sections[0].chapters[0].theory.find(t => t.type === 'code');
  assert.match(code.code, /int main/);
});

test('a truncated batch is retried one chapter at a time', async () => {
  const { call } = stub({ failBatches: true });
  const book = await buildBook({ cfg: {}, req, skill: 'skill', call, maxChapters: 30, batchSize: 2 });
  assert.equal(book.sections.flatMap(s => s.chapters).length, 6);
  assert.equal(book.sections[0].chapters.length, 3);
});

test('buildBook rejects an outline below the coverage floor', async () => {
  const tiny = { ...outline, sections: [{ ...outline.sections[0], chapters: outline.sections[0].chapters.slice(0, 2) }] };
  const call = async (_cfg, messages) => {
    if ((messages.at(-1)?.content || '').includes('Design the COMPLETE outline')) return JSON.stringify(tiny);
    throw new Error('Chapters must not be requested after a rejected outline');
  };
  await assert.rejects(
    buildBook({ cfg: {}, req, skill: 'skill', call, maxChapters: 30, batchSize: 2 }),
    /outline/i
  );
});

test('buildBook uses the caps and output budget saved by the admin', async () => {
  updateSettings({ maxBookChapters: 6, chapterBatchSize: 1, llmMaxTokens: 12000 });
  const seen = [];
  const call = async (_cfg, messages, maxTokens) => {
    seen.push(maxTokens);
    const prompt = messages.at(-1)?.content || '';
    if (prompt.includes('Design the COMPLETE outline')) return JSON.stringify(outline);
    return JSON.stringify({ chapters: targetIds(messages).map(id => chapter(id, '1.1', 'Chapter ' + id)) });
  };
  const book = await buildBook({ cfg: {}, req, skill: 'skill', call });
  assert.equal(book.sections.flatMap(s => s.chapters).length, 6);
  assert.deepEqual([...new Set(seen)], [12000]);
});
