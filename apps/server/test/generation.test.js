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

const FILLER_HU = Array.from({ length: 40 }, (_, i) => `Ez a magyarázat ${i + 1}. mondata, amely lépésről lépésre mutatja meg, miért működik a fogalom, és hogyan kell használni egy feladatban.`);
const FILLER_EN = Array.from({ length: 40 }, (_, i) => `This is explanation sentence ${i + 1}, which shows step by step why the concept works and how to use it in a task.`);

function chapter(id, num, title) {
  const termId = 'term-' + id;
  return {
    id, num,
    title: { hu: title, en: title },
    lead: { hu: 'Vezető szöveg, amely elmagyarázza, mit fog tudni az olvasó a fejezet végén.', en: 'A lead paragraph explaining what the reader will be able to do by the end.' },
    why: { hu: ['Mert minden későbbi fejezet erre épül.', 'Mert a vizsgán önálló lépésként jelenik meg.'], en: ['Because every later chapter builds on it.', 'Because it appears as a standalone step in the exam.'] },
    when: { hu: 'Akkor használd, amikor ezt a mintát felismered.', en: 'Use it when you recognise this pattern.' },
    minutes: 35,
    terms: [{
      id: termId,
      term: { hu: title + ' fogalom', en: title + ' concept' },
      plain: { hu: 'Hétköznapi nyelven: egy egyszerű szabály arról, mit szabad és mit nem.', en: 'In plain words: a simple rule about what is allowed and what is not.' },
      precise: { hu: 'Pontosan akkor érvényes, ha minden feltétel teljesül.', en: 'It holds exactly when every condition holds.' }
    }],
    refresher: [{ label: { hu: 'Nincs előfeltétel.', en: 'No prerequisite.' } }],
    checks: [
      { q: { hu: 'Mi a fő állítás?', en: 'What is the main claim?' }, a: { hu: 'A definíció a feltételekkel.', en: 'The definition with its conditions.' }, hint: { hu: 'Első blokk.', en: 'First block.' } },
      { q: { hu: 'Melyik feltétel hagyható el?', en: 'Which condition can be skipped?' }, a: { hu: 'Egy sem.', en: 'None.' }, hint: { hu: 'Nézd meg a tételt.', en: 'Check the theorem.' } }
    ],
    recap: {
      points: {
        hu: ['A fogalom hétköznapi jelentése.', 'A pontos feltétel.', 'Egy tipikus hiba.'],
        en: ['The plain meaning.', 'The precise condition.', 'A typical mistake.']
      },
      next: { hu: 'Következő lépés: egy hasonló feladat.', en: 'Next step: a similar exercise.' }
    },
    theory: [
      {
        type: 'def', title: { hu: 'Definíció', en: 'Definition' }, body: { hu: 'Definíció szövege.', en: 'Definition text.' },
        plain: { hu: 'Hétköznapi magyarázat arról, miről is szól ez a fogalom, és miért hasznos.', en: 'A plain explanation of what this concept is about and why it is useful.' },
        why: { hu: 'Azért van rá szükség, mert a korábbi eszközök itt nem elegendők.', en: 'It exists because the earlier tools are not sufficient here.' },
        precise: { hu: 'Minden feltétellel: az értelmezési tartomány nem üres, és minden megengedett esetre igaz.', en: 'With every condition: the domain is non-empty and it holds for every allowed case.' },
        analogy: { hu: 'Olyan, mint egy térkép, amely megmutatja, melyik utcán indulj el.', en: 'It is like a map that shows you which street to start on.' },
        confusions: [{ a: { hu: 'Az erős állítás', en: 'The strong claim' }, b: { hu: 'A gyenge állítás', en: 'The weak claim' }, note: { hu: 'Feltétel nélkül az erős hamis.', en: 'Without the condition the strong one is false.' } }],
        checks: [{ q: { hu: 'Mi a feltétel?', en: 'What is the condition?' }, a: { hu: 'A definíció első mondata.', en: 'The first sentence of the definition.' }, hint: { hu: 'Keresd a „ha” szót.', en: 'Look for "if".' } }],
        terms: [termId]
      },
      { type: 'p', title: { hu: 'Részletes magyarázat', en: 'Detailed explanation' }, body: { hu: FILLER_HU.join(' '), en: FILLER_EN.join(' ') } },
      { type: 'code', title: { hu: 'Példa', en: 'Example' }, lang: 'c', code: 'int main(void) {\n  return 0;\n}' }
    ],
    examples: [{
      title: { hu: 'Példa', en: 'Example' },
      problem: { hu: 'Feladat szövege.', en: 'The task statement.' },
      steps: { hu: ['Első lépés.', 'Második lépés.'], en: ['First step.', 'Second step.'] },
      reasons: { hu: ['Mert ezt ismerjük.', 'Mert a feltétel így teljesül.'], en: ['Because this is given.', 'Because the condition then holds.'] },
      answer: { hu: 'Az eredmény.', en: 'The answer.' }
    }],
    mistakes: { hu: ['Feltétel nélkül használjuk.', 'Felcseréljük a lépéseket.'], en: ['Using it without the condition.', 'Swapping the steps.'] },
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
      conceptMap: { hu: ['Típusok', 'Függvények', 'Mutatók'], en: ['Types', 'Functions', 'Pointers'] },
      summary: { hu: 'A rész összefoglalója.', en: 'The part summary.' },
      chapters: [
        { id: 'types', num: '1.1', title: { hu: 'Típusok', en: 'Types' }, focus: 'Types and input.', newTerms: [{ id: 'term-types', term: { hu: 'Típus', en: 'Type' } }] },
        { id: 'functions', num: '1.2', title: { hu: 'Függvények', en: 'Functions' }, focus: 'Functions and recursion.', newTerms: [{ id: 'term-functions', term: { hu: 'Függvény', en: 'Function' } }] },
        { id: 'pointers', num: '1.3', title: { hu: 'Mutatók', en: 'Pointers' }, focus: 'Pointers and memory.', newTerms: [{ id: 'term-pointers', term: { hu: 'Mutató', en: 'Pointer' } }] }
      ]
    },
    {
      id: 'cpp', num: '02', title: { hu: 'C++', en: 'C++' },
      subtitle: { hu: 'Második rész', en: 'Second part' }, intro: { hu: 'Bevezetés.', en: 'Introduction.' },
      conceptMap: { hu: ['Osztályok', 'Öröklés', 'STL'], en: ['Classes', 'Inheritance', 'STL'] },
      summary: { hu: 'A rész összefoglalója.', en: 'The part summary.' },
      chapters: [
        { id: 'classes', num: '2.1', title: { hu: 'Osztályok', en: 'Classes' }, focus: 'Classes and RAII.', newTerms: [{ id: 'term-classes', term: { hu: 'Osztály', en: 'Class' } }] },
        { id: 'inheritance', num: '2.2', title: { hu: 'Öröklés', en: 'Inheritance' }, focus: 'Inheritance and polymorphism.', newTerms: [{ id: 'term-inheritance', term: { hu: 'Öröklés', en: 'Inheritance' } }] },
        { id: 'stl', num: '2.3', title: { hu: 'STL', en: 'STL' }, focus: 'Templates and the STL.', newTerms: [{ id: 'term-stl', term: { hu: 'Sablon', en: 'Template' } }] }
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
