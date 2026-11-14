# English content overlay contract

The Hungarian content files stay authoritative. Each `content/_en/NN-*.js` file adds English
translations to `MB.enContent`, keyed by `sectionId + '/' + chapterId`. The renderer merges an
overlay onto the Hungarian chapter by index.

## File shape

```js
(function () {
  const MB = window.MB;
  MB.enContent = MB.enContent || {};
  MB.enContent['alapok/algebra'] = {
    title: 'Powers, roots, logarithms',
    lead: '...',
    summary: '...',
    why: ['...', '...'],
    when: '...',
    theory: [
      { title: '...', body: '...' },            // MB.def / MB.thm / MB.note / MB.warn
      { title: '...', note: '...' },            // MB.formula: keep latex out
      { body: '...' },                          // MB.p
      { title: '...', items: ['...'] },         // MB.list
      null                                      // optional: no translation, falls back to Hungarian
    ],
    examples: [
      { title: '...', problem: '...', steps: ['...'], answer: '...' }
    ],
    mistakes: ['...'],
    exercises: [
      { q: '...', hint: '...', sol: '...', choices: ['...'], altEn: ['...'] }
    ],
    video: { title: '...', channel: '...', note: '...' }
  };
})();
```

- Include one key per chapter in the source file.
- Arrays must keep the source length and order. Use `null` for an item you cannot translate.
- Translate every human-readable Hungarian string, including titles, notes, prompts, hints,
  solutions, choices, mistake descriptions, video titles/channels/notes and chapter metadata.
- Do **not** translate or alter LaTeX/math. Copy every `$...$` and `$$...$$` segment unchanged,
  including variable names and numbers. The only exception is words inside `\text{...}`, which may
  be translated.
- Do not include fields named `t`, `latex`, `a`, `type`, `alt`, `level`, `num`, `minutes`, `id`,
  `search`, `kind`, `src`, or `ref`. Those come from the Hungarian source.
- For text answers that contain Hungarian prose (for example `x<2 vagy x>3`), keep `a` unchanged
  by omitting it, and add English accepted variants in `altEn` (for example
  `['x<2 or x>3']`). The merge concatenates `altEn` onto the existing `alt`.
- For choice exercises, translate `choices` but keep the same order, so the index in `a` stays valid.
- For numeric/symbolic exercises, `q`, `hint` and `sol` are prose plus math; translate the prose.
- Formula blocks: provide only `title` and `note`; the LaTeX stays in the source.
- Use natural mathematical English. Keep exam terms such as `ZH`, `vizsga`, `középszintű érettségi`
  in parentheses when they name an official Hungarian exam.
- Plain ASCII quotes/apostrophes inside single-quoted JS strings; prefer double quotes for English
  prose containing apostrophes, or escape them.
- End with `})();` and run `node --check content/_en/NN-*.js`.
- Do not edit the Hungarian source or any other file.
