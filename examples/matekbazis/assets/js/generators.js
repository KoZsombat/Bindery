/* Deterministic, rerollable exercise banks.
   50 feladat kategóriánként: 10 könnyű / 10 közepes / 30 nehéz (1 : 1 : 3). */
(function () {
  const MB = window.MB;

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function ri(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function nz(r, a, b) { let v = ri(r, a, b); return v === 0 ? 1 : v; }
  function fmt(x, d) {
    if (!isFinite(x)) return '\\infty';
    const v = Math.round(x * Math.pow(10, d == null ? 4 : d)) / Math.pow(10, d == null ? 4 : d);
    return String(v).replace('.', ',');
  }
  function sgn(x) { return x < 0 ? '-' : '+'; }
  function poly(a, b, c, v) {
    let s = a + 'x^2';
    s += (b < 0 ? '-' : '+') + Math.abs(b) + 'x';
    s += (c < 0 ? '-' : '+') + Math.abs(c);
    return s;
  }
  function item(q, a, o) {
    o = o || {};
    const en = o.en || {};
    const out = Object.assign({ q: q, a: String(a), type: 'expr' }, o);
    delete out.en;
    out.qEn = en.q;
    out.hintEn = en.hint;
    out.solEn = en.sol;
    out.choicesEn = en.choices;
    return out;
  }

  const SPECIAL = [
    [0, '0', '1', '0'], [30, '1/2', 'sqrt(3)/2', '1/sqrt(3)'], [45, 'sqrt(2)/2', 'sqrt(2)/2', '1'],
    [60, 'sqrt(3)/2', '1/2', 'sqrt(3)'], [90, '1', '0', 'nem ért.'], [120, 'sqrt(3)/2', '-1/2', '-sqrt(3)'],
    [135, 'sqrt(2)/2', '-sqrt(2)/2', '-1'], [150, '1/2', '-sqrt(3)/2', '-1/sqrt(3)'],
    [180, '0', '-1', '0'], [210, '-1/2', '-sqrt(3)/2', '1/sqrt(3)'], [225, '-sqrt(2)/2', '-sqrt(2)/2', '1'],
    [240, '-sqrt(3)/2', '-1/2', 'sqrt(3)'], [270, '-1', '0', 'nem ért.'], [300, '-sqrt(3)/2', '1/2', '-sqrt(3)'],
    [315, '-sqrt(2)/2', 'sqrt(2)/2', '-1'], [330, '-1/2', 'sqrt(3)/2', '-1/sqrt(3)']
  ];

  const cats = [
    /* 1 — ALGEBRA */
    {
      id: 'algebra', title: 'Algebra, hatvány, logaritmus', icon: 'sigma',
      titleEn: 'Algebra, powers, logarithms',
      desc: 'Kitevők, gyökök, logaritmus-azonosságok, exponenciális egyenletek.',
      descEn: 'Exponents, roots, logarithm identities, exponential equations.',
      gen: function (level, r) {
        if (level === 1) {
          const t = ri(r, 0, 3);
          if (t === 0) { const a = ri(r, 2, 7), b = ri(r, 2, 7); return item('Írd fel egyetlen hatványként: $x^{' + a + '}\\cdot x^{' + b + '}$. Mennyi a kitevő?', a + b, { hint: 'Azonos alapú hatványok szorzásakor a kitevők összeadódnak.', en: { q: 'Write as a single power: $x^{' + a + '}\\cdot x^{' + b + '}$. What is the exponent?', hint: 'When multiplying powers with the same base, the exponents add.' } }); }
          if (t === 1) { const a = ri(r, 2, 5), b = ri(r, 1, 4); return item('Mennyi $\\log_{' + a + '}(' + Math.pow(a, b) + ')$?', b, { hint: '$\\log_a(a^b)=b$.', en: { q: 'What is $\\log_{' + a + '}(' + Math.pow(a, b) + ')$?', hint: '$\\log_a(a^b)=b$.' } }); }
          if (t === 2) { const a = ri(r, 2, 6), b = ri(r, 2, 5); return item('Mennyi $(' + a + '^2)^{' + b + '}$?', Math.pow(a, 2 * b), { hint: '$(x^a)^b=x^{ab}$.', en: { q: 'What is $(' + a + '^2)^{' + b + '}$?', hint: '$(x^a)^b=x^{ab}$.' } }); }
          const a = ri(r, 2, 5), b = ri(r, 2, 9);
          return item('Mennyi $\\ln(e^{' + b + '})$?', b, { hint: '$\\ln$ és $e$ egymás inverze.', en: { q: 'What is $\\ln(e^{' + b + '})$?', hint: '$\\ln$ and $e$ are inverses of each other.' } });
        }
        if (level === 2) {
          const t = ri(r, 0, 3);
          if (t === 0) { const a = ri(r, 2, 5), b = ri(r, 2, 4); return item('Oldd meg: $' + a + '^x=' + Math.pow(a, b) + '$.', b, { hint: 'Mindkét oldal ugyanannak a hatványa.', en: { q: 'Solve: $' + a + '^x=' + Math.pow(a, b) + '$.', hint: 'Both sides are powers of the same base.' } }); }
          if (t === 1) { const a = ri(r, 2, 4), b = ri(r, 2, 5), c = ri(r, 1, 3); return item('Írd fel egyetlen hatványként: $\\dfrac{x^{' + (b + c) + '}}{x^{' + b + '}}$. Mennyi a kitevő?', c, { hint: 'Osztáskor kivonunk.', en: { q: 'Write as a single power: $\\dfrac{x^{' + (b + c) + '}}{x^{' + b + '}}$. What is the exponent?', hint: 'When dividing, we subtract.' } }); }
          if (t === 2) { const a = ri(r, 2, 6); return item('Mennyi $' + a + '^{\\log_{' + a + '} ' + (a + 3) + '}$?', a + 3, { hint: '$a^{\\log_a b}=b$.', en: { q: 'What is $' + a + '^{\\log_{' + a + '} ' + (a + 3) + '}$?', hint: '$a^{\\log_a b}=b$.' } }); }
          const a = ri(r, 2, 5), b = ri(r, 2, 4);
          return item('Mennyi $\\log_{' + a + '}\\left(\\frac{' + Math.pow(a, b + 1) + '}{' + Math.pow(a, b - 1) + '}\\right)$?', 2, { hint: 'Osztásnál a kitevők kivonódnak.', en: { q: 'What is $\\log_{' + a + '}\\left(\\frac{' + Math.pow(a, b + 1) + '}{' + Math.pow(a, b - 1) + '}\\right)$?', hint: 'When dividing, the exponents are subtracted.' } });
        }
        const t = ri(r, 0, 4);
        if (t === 0) { const a = ri(r, 2, 3), k = ri(r, 1, 4); return item('Oldd meg: $' + a + '^{3x-1}=' + Math.pow(a, k) + '$.', '(1+' + k + ')/3', { alt: ['(' + k + '+1)/3'], hint: 'Vedd mindkét oldal logaritmusát.', en: { q: 'Solve: $' + a + '^{3x-1}=' + Math.pow(a, k) + '$.', hint: 'Take the logarithm of both sides.' } }); }
        if (t === 1) { const p = ri(r, 1, 4), q = p + ri(r, 1, 4); return item('Add meg az $f(x)=\\ln(x^2-' + (p + q) + 'x+' + p * q + ')$ értelmezési tartományát.', 'x<' + p + ' vagy x>' + q, { type: 'text', alt: ['x<=(' + p + '), vagy x>(' + q + ')', '(-∞,' + p + ')U(' + q + ',∞)'], hint: 'A logaritmus belseje pozitív; a másodfokú kifejezés gyökei ' + p + ' és ' + q + '.', en: { q: 'Find the domain of $f(x)=\\ln(x^2-' + (p + q) + 'x+' + p * q + ')$.', hint: 'The argument of the logarithm must be positive; the roots of the quadratic are ' + p + ' and ' + q + '.' } }); }
        if (t === 2) { const a = ri(r, 2, 3), p = ri(r, 1, 2), q = ri(r, 3, 4); return item('Oldd meg: $' + a + '^{2x}-' + (p + q) + '\\cdot ' + a + '^x+' + p * q + '=0$. Add meg a nagyobbik gyököt.', Math.log(q) / Math.log(a), { hint: '$t=' + a + '^x$ helyettesítés; a gyökök $t=' + p + '$ és $t=' + q + '$, a nagyobbikból $x=\\log_{' + a + '}' + q + '$.', sol: 'A nagyobbik gyök $x=\\log_{' + a + '}' + q + '\\approx ' + fmt(Math.log(q) / Math.log(a)) + '$.', alt: ['ln(' + q + ')/ln(' + a + ')', 'log(' + q + ')/log(' + a + ')'], en: { q: 'Solve: $' + a + '^{2x}-' + (p + q) + '\\cdot ' + a + '^x+' + p * q + '=0$. Give the larger root.', hint: 'Substitute $t=' + a + '^x$; the roots are $t=' + p + '$ and $t=' + q + '$, and from the larger one $x=\\log_{' + a + '}' + q + '$.', sol: 'The larger root is $x=\\log_{' + a + '}' + q + '\\approx ' + fmt(Math.log(q) / Math.log(a)) + '$.' } }); }
        if (t === 3) { const a = ri(r, 2, 4), c = ri(r, 1, 3), k = ri(r, 2, 6); return item('Oldd meg: $\\log_{' + a + '}x+\\log_{' + a + '}(x-' + c + ')=\\log_{' + a + '}' + k + '$.', '(c+sqrt(' + c * c + '+4*' + k + '))/2', { alt: [fmt((c + Math.sqrt(c * c + 4 * k)) / 2)], hint: 'Vond össze a bal oldalt, majd oldd meg a másodfokú egyenletet.', en: { q: 'Solve: $\\log_{' + a + '}x+\\log_{' + a + '}(x-' + c + ')=\\log_{' + a + '}' + k + '$.', hint: 'Combine the left-hand side, then solve the quadratic equation.' } }); }
        const a = ri(r, 2, 5), b = ri(r, 2, 6), c = ri(r, 1, 3);
        return item('Írd fel egyetlen hatványként: $\\dfrac{x^{' + a + '}\\cdot x^{' + b + '}}{x^{' + c + '}}$. Mennyi a kitevő?', a + b - c, { hint: 'Szorzásnál összeadunk, osztásnál kivonunk.', en: { q: 'Write as a single power: $\\dfrac{x^{' + a + '}\\cdot x^{' + b + '}}{x^{' + c + '}}$. What is the exponent?', hint: 'When multiplying we add, when dividing we subtract.' } });
      }
    },
    /* 2 — TRIGONOMETRIA */
    {
      id: 'trig', title: 'Trigonometria', icon: 'target',
      titleEn: 'Trigonometry',
      desc: 'Nevezetes szögek, síknegyedek, azonosságok, trigonometrikus egyenletek.',
      descEn: 'Standard angles, quadrants, identities, trigonometric equations.',
      gen: function (level, r) {
        if (level === 1) {
          const s = pick(r, SPECIAL.slice(0, 9));
          let which = ri(r, 0, 2);
          if (which === 2 && (s[0] === 90 || s[0] === 270)) which = 0;
          const val = which === 0 ? s[1] : which === 1 ? s[2] : s[3];
          const fn = ['sin', 'cos', 'tan'][which];
          return item('Mennyi $\\' + fn + '(' + s[0] + '^\\circ)$?', val, { hint: 'Használd az egységkört vagy a nevezetes szögek táblázatát.', en: { q: 'What is $\\' + fn + '(' + s[0] + '^\\circ)$?', hint: 'Use the unit circle or the table of standard angles.' } });
        }
        if (level === 2) {
          const s = pick(r, SPECIAL);
          const which = ri(r, 0, 1);
          const val = which === 0 ? s[1] : s[2];
          const fn = ['sin', 'cos'][which];
          return item('Mennyi $\\' + fn + '(' + s[0] + '^\\circ)$?', val, { hint: 'Először a síknegyed, aztán a referenciaszög.', en: { q: 'What is $\\' + fn + '(' + s[0] + '^\\circ)$?', hint: 'First the quadrant, then the reference angle.' } });
        }
        const t = ri(r, 0, 2);
        if (t === 0) { const k = pick(r, ['1/2', 'sqrt(2)/2', 'sqrt(3)/2']); return item('Hány megoldása van a $\\sin x=' + k + '$ egyenletnek a $[0,2\\pi)$ intervallumon?', 2, { type: 'number', hint: 'Az egységkörön két pont van ilyen magasságban.', en: { q: 'How many solutions does the equation $\\sin x=' + k + '$ have on the interval $[0,2\\pi)$?', hint: 'On the unit circle there are two points at this height.' } }); }
        if (t === 1) { const s = ri(r, 1, 4); return item('Mennyi $\\cos(2x)$, ha $\\sin x=\\frac{' + s + '}{5}$ és $x$ az első síknegyedben van?', (25 - 2 * s * s) + '/25', { hint: '$\\cos2x=1-2\\sin^2x=1-2\\cdot\\frac{' + s * s + '}{25}$.', en: { q: 'What is $\\cos(2x)$ if $\\sin x=\\frac{' + s + '}{5}$ and $x$ is in the first quadrant?', hint: '$\\cos2x=1-2\\sin^2x=1-2\\cdot\\frac{' + s * s + '}{25}$.' } }); }
        return item('Oldd meg: $\\tan x=1$ a $[0,2\\pi)$ intervallumon. Add meg a kisebbik megoldást radiánban.', 'pi/4', { alt: ['π/4'], hint: 'A tangens periódusa $\\pi$.', en: { q: 'Solve: $\\tan x=1$ on the interval $[0,2\\pi)$. Give the smaller solution in radians.', hint: 'The period of the tangent is $\\pi$.' } });
      }
    },
    /* 3 — FÜGGVÉNYEK */
    {
      id: 'functions', title: 'Függvények és inverz', icon: 'layers',
      titleEn: 'Functions and inverses',
      desc: 'Értelmezési tartomány, összetett függvény, inverz, bijektivitás.',
      descEn: 'Domain, composite functions, inverse, bijectivity.',
      gen: function (level, r) {
        if (level === 1) {
          const a = ri(r, 1, 4), b = ri(r, 1, 6), x0 = ri(r, 1, 3);
          return item('Legyen $f(x)=' + a + 'x+' + b + '$, $g(x)=x^2$. Mennyi $(g\\circ f)(' + x0 + ')$?', Math.pow(a * x0 + b, 2), { hint: 'Előbb $f(' + x0 + ')$, majd négyzetre emelés.', en: { q: 'Let $f(x)=' + a + 'x+' + b + '$, $g(x)=x^2$. What is $(g\\circ f)(' + x0 + ')$?', hint: 'First $f(' + x0 + ')$, then square it.' } });
        }
        if (level === 2) {
          const a = ri(r, 2, 4), b = ri(r, 1, 5), x0 = ri(r, 0, 4);
          return item('Mi az $f(x)=' + a + 'x+' + b + '$ inverzének értéke $x=' + (a * x0 + b) + '$ helyen?', x0, { hint: 'Az inverz visszaadja az eredeti bemenetet: $f(' + x0 + ')=' + (a * x0 + b) + '$.', en: { q: 'What is the value of the inverse of $f(x)=' + a + 'x+' + b + '$ at $x=' + (a * x0 + b) + '$?', hint: 'The inverse returns the original input: $f(' + x0 + ')=' + (a * x0 + b) + '$.' } });
        }
        const t = ri(r, 0, 2);
        if (t === 0) { const p = ri(r, 1, 4), q = p + ri(r, 1, 4); return item('Add meg az $f(x)=\\ln(x^2-' + (p + q) + 'x+' + p * q + ')$ értelmezési tartományát.', 'x<' + p + ' vagy x>' + q, { type: 'text', alt: ['(-∞,' + p + ')U(' + q + ',∞)'], hint: 'A logaritmus belseje pozitív.', en: { q: 'Find the domain of $f(x)=\\ln(x^2-' + (p + q) + 'x+' + p * q + ')$.', hint: 'The argument of the logarithm must be positive.' } }); }
        if (t === 1) { const a = ri(r, 2, 5), b = ri(r, 1, 6); return item('Mi az $f(x)=' + a + 'x+' + b + '$ inverze?', '(x-' + b + ')/' + a, { alt: ['x/' + a + '-' + b + '/' + a], hint: 'Oldd meg $y=' + a + 'x+' + b + '$-t $x$-re.', en: { q: 'What is the inverse of $f(x)=' + a + 'x+' + b + '$?', hint: 'Solve $y=' + a + 'x+' + b + '$ for $x$.' } }); }
        const a = ri(r, 1, 3);
        return item('Add meg az $f(x)=\\sqrt{' + a + '-x^2}$ értelmezési tartományát.', '-sqrt(' + a + ')≤x≤sqrt(' + a + ')', { type: 'text', alt: ['[-sqrt(' + a + '),sqrt(' + a + ')]', 'x∈[-sqrt(' + a + '),sqrt(' + a + ')]'], hint: 'A gyök alatt nemnegatív kifejezés kell.', en: { q: 'Find the domain of $f(x)=\\sqrt{' + a + '-x^2}$.', hint: 'The expression under the square root must be non-negative.' } });
      }
    },
    /* 4 — EGYENLETEK */
    {
      id: 'equations', title: 'Egyenletek, egyenlőtlenségek', icon: 'grid',
      titleEn: 'Equations, inequalities',
      desc: 'Másodfokú, törtes, abszolútértékes, gyökös és logaritmusos egyenletek.',
      descEn: 'Quadratic, rational, absolute value, radical and logarithmic equations.',
      gen: function (level, r) {
        if (level === 1) {
          const p = ri(r, 1, 5), q = ri(r, 1, 5);
          return item('Mennyi az $x^2-' + (p + q) + 'x+' + p * q + '=0$ egyenlet gyökeinek összege?', p + q, { type: 'number', hint: 'Viète: $x_1+x_2=-b/a$.', en: { q: 'What is the sum of the roots of the equation $x^2-' + (p + q) + 'x+' + p * q + '=0$?', hint: 'Viète: $x_1+x_2=-b/a$.' } });
        }
        if (level === 2) {
          const t = ri(r, 0, 2);
          if (t === 0) { const a = ri(r, 1, 3), b = ri(r, 2, 5); return item('Oldd meg: $|x-' + a + '|\\le ' + b + '$.', '-' + (b - a) + '≤x≤' + (a + b), { type: 'text', alt: ['[' + (a - b) + ',' + (a + b) + ']'], hint: '$|x-a|\\le b$ azt jelenti, hogy $a-b\\le x\\le a+b$.', en: { q: 'Solve: $|x-' + a + '|\\le ' + b + '$.', hint: '$|x-a|\\le b$ means that $a-b\\le x\\le a+b$.' } }); }
          if (t === 1) { const p = ri(r, 1, 4), q = p + ri(r, 1, 4); return item('Oldd meg: $x^2-' + (p + q) + 'x+' + p * q + '>0$.', 'x<' + p + ' vagy x>' + q, { type: 'text', alt: ['(-∞,' + p + ')U(' + q + ',∞)'], hint: 'Felfelé nyíló parabola; a gyökökön kívül pozitív.', en: { q: 'Solve: $x^2-' + (p + q) + 'x+' + p * q + '>0$.', hint: 'An upward-opening parabola; it is positive outside the roots.' } }); }
          const a = ri(r, 1, 3), b = ri(r, 2, 5);
          return item('Oldd meg: $\\dfrac{x-' + a + '}{x+' + b + '}<0$.', '-' + b + '<x<' + a, { type: 'text', alt: ['(-' + b + ',' + a + ')'], hint: 'A számláló és a nevező ellentétes előjelű kell legyen; a nevező nem lehet nulla.', en: { q: 'Solve: $\\dfrac{x-' + a + '}{x+' + b + '}<0$.', hint: 'The numerator and the denominator must have opposite signs; the denominator cannot be zero.' } });
        }
        const t = ri(r, 0, 2);
        if (t === 0) { const a = ri(r, 1, 6); return item('Oldd meg: $\\sqrt{x+' + a + '}=x$.', '(1+sqrt(1+4*' + a + '))/2', { alt: [String((1 + Math.sqrt(1 + 4 * a)) / 2)], hint: 'Feltétel: $x\\ge 0$. Emeld négyzetre, majd a negatív gyököt dobd el.', sol: '$x+' + a + '=x^2$, azaz $x^2-x-' + a + '=0$. A gyökök $\\frac{1\\pm\\sqrt{' + (1 + 4 * a) + '}}2$; csak a pozitív jó.', en: { q: 'Solve: $\\sqrt{x+' + a + '}=x$.', hint: 'Condition: $x\\ge 0$. Square both sides, then discard the negative root.', sol: '$x+' + a + '=x^2$, that is $x^2-x-' + a + '=0$. The roots are $\\frac{1\\pm\\sqrt{' + (1 + 4 * a) + '}}2$; only the positive one is valid.' } }); }
        if (t === 1) { const a = ri(r, 2, 4), b = ri(r, 2, 5); return item('Oldd meg: $\\ln(x)+\\ln(x+' + a + ')=\\ln(' + b + ')$.', '(-' + a + '+sqrt(' + a * a + '+4*' + b + '))/2', { alt: [fmt((-a + Math.sqrt(a * a + 4 * b)) / 2)], hint: 'Vond össze a bal oldalt, majd oldd meg a másodfokú egyenletet.', en: { q: 'Solve: $\\ln(x)+\\ln(x+' + a + ')=\\ln(' + b + ')$.', hint: 'Combine the left-hand side, then solve the quadratic equation.' } }); }
        return item('Oldd meg: $2x+3y=12$, $x-y=1$. Mennyi $x$?', 3, { hint: 'A második egyenletből $x=y+1$; helyettesítsd be.', en: { q: 'Solve: $2x+3y=12$, $x-y=1$. What is $x$?', hint: 'From the second equation $x=y+1$; substitute it.' } });
      }
    },
    /* 5 — LOGIKA */
    {
      id: 'logic', title: 'Logika és halmazok', icon: 'target',
      titleEn: 'Logic and sets',
      desc: 'Kvantorok, implikáció, tagadás, halmazműveletek, leszámlálás.',
      descEn: 'Quantifiers, implication, negation, set operations, counting.',
      gen: function (level, r) {
        if (level === 1) {
          const n = ri(r, 2, 6);
          if (r() < 0.5) return item('Hány részhalmaza van egy ' + n + ' elemű halmaznak?', Math.pow(2, n), { type: 'number', hint: 'Minden elem vagy benne van, vagy nincs.', en: { q: 'How many subsets does a set with ' + n + ' elements have?', hint: 'Each element is either in the subset or not.' } });
          return item('Az $A\\Rightarrow B$ implikáció mikor hamis?', 'A igaz és B hamis', { type: 'choice', choices: ['A igaz és B hamis', 'A hamis és B igaz', 'Mindkettő hamis', 'Mindkettő igaz'], a: '0', hint: 'A „ha…, akkor…” csak akkor szegődik meg, ha a feltétel teljesül, de a következmény nem.', en: { q: 'When is the implication $A\\Rightarrow B$ false?', choices: ['A is true and B is false', 'A is false and B is true', 'Both are false', 'Both are true'], hint: 'An “if …, then …” statement fails only when the condition holds but the consequence does not.' } });
        }
        if (level === 2) {
          const t = ri(r, 0, 1);
          if (t === 0) return item('Mi a tagadása: $\\forall x\\in\\mathbb R: x^2\\ge0$?', '∃x∈R: x²<0', { type: 'choice', choices: ['∃x∈R: x²<0', '∀x∈R: x²<0', '∃x∈R: x²≥0', '∀x∈R: x²≤0'], a: '0', hint: 'A ∀ átfordul ∃-be, a belső állítás tagadódik.', en: { q: 'What is the negation of $\\forall x\\in\\mathbb R: x^2\\ge0$?', choices: ['∃x∈R: x²<0', '∀x∈R: x²<0', '∃x∈R: x²≥0', '∀x∈R: x²≤0'], hint: '∀ turns into ∃, and the inner statement is negated.' } });
          return item('Mi a kontrapozíciója: $A\\Rightarrow B$?', '¬B⇒¬A', { type: 'choice', choices: ['¬B⇒¬A', 'B⇒A', '¬A⇒¬B', 'A∧¬B'], a: '0', hint: 'A kontrapozíció ekvivalens az eredetivel.', en: { q: 'What is the contrapositive of $A\\Rightarrow B$?', choices: ['¬B⇒¬A', 'B⇒A', '¬A⇒¬B', 'A∧¬B'], hint: 'The contrapositive is equivalent to the original statement.' } });
        }
        const t = ri(r, 0, 3);
        if (t === 0) return item('Igaz-e $\\mathbb R$-en: $\\forall x\\exists y: x+y=0$?', 'Igaz', { type: 'choice', choices: ['Igaz', 'Hamis'], a: '0', hint: 'Minden $x$-hez választható $y=-x$.', en: { q: 'Is it true over $\\mathbb R$: $\\forall x\\exists y: x+y=0$?', choices: ['True', 'False'], hint: 'For every $x$ one can choose $y=-x$.' } });
        if (t === 1) return item('Igaz-e $\\mathbb R$-en: $\\exists y\\forall x: x+y=0$?', 'Hamis', { type: 'choice', choices: ['Igaz', 'Hamis'], a: '1', hint: 'Nincs egyetlen $y$, amely minden $x$-re jó.', en: { q: 'Is it true over $\\mathbb R$: $\\exists y\\forall x: x+y=0$?', choices: ['True', 'False'], hint: 'There is no single $y$ that works for every $x$.' } });
        if (t === 2) { const n = ri(r, 3, 6); return item('Hány elemű egy ' + n + ' elemű halmaz hatványhalmaza?', Math.pow(2, n), { type: 'number', hint: 'A hatványhalmaz elemei a részhalmazok.', en: { q: 'How many elements does the power set of a set with ' + n + ' elements have?', hint: 'The elements of the power set are the subsets.' } }); }
        return item('Melyik ekvivalens a $\\neg(A\\land B)$ állítással?', '¬A∨¬B', { type: 'choice', choices: ['¬A∨¬B', '¬A∧¬B', 'A∨B', 'A∧B'], a: '0', hint: 'De Morgan.', en: { q: 'Which statement is equivalent to $\\neg(A\\land B)$?', choices: ['¬A∨¬B', '¬A∧¬B', 'A∨B', 'A∧B'], hint: 'De Morgan.' } });
      }
    },
    /* 6 — KOMPLEX */
    {
      id: 'complex', title: 'Komplex számok', icon: 'layers',
      titleEn: 'Complex numbers',
      desc: 'Algebrai alak, konjugált, modulus, trigonometrikus alak, Moivre, gyökök.',
      descEn: 'Algebraic form, conjugate, modulus, trigonometric form, de Moivre, roots.',
      gen: function (level, r) {
        if (level === 1) {
          const a = nz(r, -5, 5), b = nz(r, -5, 5);
          const t = ri(r, 0, 1);
          if (t === 0) return item('Mennyi $|' + a + (b < 0 ? '' : '+') + b + 'i|$?', Math.sqrt(a * a + b * b), { hint: 'A modulus $\\sqrt{a^2+b^2}$.', en: { q: 'What is $|' + a + (b < 0 ? '' : '+') + b + 'i|$?', hint: 'The modulus is $\\sqrt{a^2+b^2}$.' } });
          return item('Mennyi $(' + a + (b < 0 ? '' : '+') + b + 'i)+(' + (-a) + '+' + (-b) + 'i)$ valós része?', 0, { type: 'number', hint: 'Valós részt a valós résszel, képzetest a képzetessel.', en: { q: 'What is the real part of $(' + a + (b < 0 ? '' : '+') + b + 'i)+(' + (-a) + '+' + (-b) + 'i)$?', hint: 'Add real parts to real parts and imaginary parts to imaginary parts.' } });
        }
        if (level === 2) {
          const a = nz(r, -4, 4), b = nz(r, -4, 4), c = nz(r, 1, 3), d = nz(r, -3, 3);
          if (b === 0) b = 1;
          const den = c * c + d * d, re = (a * c + b * d) / den, im = (b * c - a * d) / den;
          return item('Mennyi a $\\dfrac{' + a + (b < 0 ? '' : '+') + b + 'i}{' + c + (d < 0 ? '' : '+') + d + 'i}$ valós része?', re, { hint: 'Bővítsd a nevező konjugáltjával.', en: { q: 'What is the real part of $\\dfrac{' + a + (b < 0 ? '' : '+') + b + 'i}{' + c + (d < 0 ? '' : '+') + d + 'i}$?', hint: 'Multiply by the conjugate of the denominator.' } });
        }
        const t = ri(r, 0, 2);
        if (t === 0) { const a = nz(r, -3, 3), b = nz(r, 1, 3); return item('Mennyi $(' + a + '+' + b + 'i)^2$ valós része?', a * a - b * b, { hint: '$(a+bi)^2=a^2-b^2+2abi$.', en: { q: 'What is the real part of $(' + a + '+' + b + 'i)^2$?', hint: '$(a+bi)^2=a^2-b^2+2abi$.' } }); }
        if (t === 1) { const a = nz(r, -3, 3), b = nz(r, 1, 3); return item('Mennyi $(' + a + '+' + b + 'i)^2$ képzetes része?', 2 * a * b, { hint: '$(a+bi)^2=a^2-b^2+2abi$.', en: { q: 'What is the imaginary part of $(' + a + '+' + b + 'i)^2$?', hint: '$(a+bi)^2=a^2-b^2+2abi$.' } }); }
        return item('Hány megoldása van a $z^3=8$ egyenletnek $\\mathbb C$-ben?', 3, { type: 'number', hint: 'Egy nem nulla komplex szám $n$-edik gyökeiből $n$ darab van.', en: { q: 'How many solutions does the equation $z^3=8$ have in $\\mathbb C$?', hint: 'A nonzero complex number has $n$ distinct $n$-th roots.' } });
      }
    },
    /* 7 — SOROZATOK */
    {
      id: 'sequences', title: 'Sorozatok határértéke', icon: 'arrowRight',
      titleEn: 'Limits of sequences',
      desc: 'Főtag kiemelése, gyökös különbség, rendőrelv, nevezetes határértékek.',
      descEn: 'Dominant terms, radical differences, squeeze theorem, standard limits.',
      gen: function (level, r) {
        if (level === 1) {
          const a = ri(r, 1, 5), b = ri(r, 1, 5), c = ri(r, 1, 5), d = ri(r, 1, 5);
          return item('Mennyi $\\lim\\limits_{n\\to\\infty}\\dfrac{' + a + 'n+' + b + '}{' + c + 'n+' + d + '}$?', a / c, { hint: 'Azonos fokszám: a főegyütthatók hányadosa.', en: { q: 'What is $\\lim\\limits_{n\\to\\infty}\\dfrac{' + a + 'n+' + b + '}{' + c + 'n+' + d + '}$?', hint: 'Same degree: the ratio of the leading coefficients.' } });
        }
        if (level === 2) {
          const t = ri(r, 0, 2);
          if (t === 0) { const a = ri(r, 1, 5); return item('Mennyi $\\lim\\limits_{n\\to\\infty}\\left(\\sqrt{n+' + a + '}-\\sqrt n\\right)$?', 0, { type: 'number', hint: 'Bővítsd a konjugálttal.', en: { q: 'What is $\\lim\\limits_{n\\to\\infty}\\left(\\sqrt{n+' + a + '}-\\sqrt n\\right)$?', hint: 'Multiply by the conjugate.' } }); }
          if (t === 1) { const a = ri(r, 1, 5), b = ri(r, 1, 5); return item('Mennyi $\\lim\\limits_{n\\to\\infty}\\dfrac{' + a + 'n^2+' + b + '}{n^3+1}$?', 0, { type: 'number', hint: 'A nevező fokszáma nagyobb.', en: { q: 'What is $\\lim\\limits_{n\\to\\infty}\\dfrac{' + a + 'n^2+' + b + '}{n^3+1}$?', hint: 'The degree of the denominator is larger.' } }); }
          const q = pick(r, [2, 3, 4]);
          return item('Mennyi $\\lim\\limits_{n\\to\\infty}\\left(\\frac{' + q + '}{' + (q + 2) + '}\\right)^n$?', 0, { type: 'number', hint: 'Ha $|q|<1$, akkor $q^n\\to0$.', en: { q: 'What is $\\lim\\limits_{n\\to\\infty}\\left(\\frac{' + q + '}{' + (q + 2) + '}\\right)^n$?', hint: 'If $|q|<1$, then $q^n\\to0$.' } });
        }
        const t = ri(r, 0, 2);
        if (t === 0) { const a = ri(r, 1, 4); return item('Mennyi $\\lim\\limits_{n\\to\\infty}\\left(1+\\frac{' + a + '}{n}\\right)^n$?', 'e^' + a, { alt: ['exp(' + a + ')'], hint: '$(1+x/n)^n\\to e^x$.', en: { q: 'What is $\\lim\\limits_{n\\to\\infty}\\left(1+\\frac{' + a + '}{n}\\right)^n$?', hint: '$(1+x/n)^n\\to e^x$.' } }); }
        if (t === 1) { const a = ri(r, 1, 4); return item('Mennyi $\\lim\\limits_{n\\to\\infty}\\left(1+\\frac{1}{n}\\right)^{' + a + 'n}$?', 'e^' + a, { hint: '$(1+1/n)^n\\to e$, a kitevőben szorzó.', en: { q: 'What is $\\lim\\limits_{n\\to\\infty}\\left(1+\\frac{1}{n}\\right)^{' + a + 'n}$?', hint: '$(1+1/n)^n\\to e$; the multiplier sits in the exponent.' } }); }
        const p2 = Math.pow(2, ri(r, 1, 3));
        return item('Mennyi $\\lim\\limits_{n\\to\\infty}\\sqrt[n]{' + p2 + '}$?', 1, { type: 'number', hint: '$\\sqrt[n]{c}\\to1$ minden rögzített $c>0$-ra.', en: { q: 'What is $\\lim\\limits_{n\\to\\infty}\\sqrt[n]{' + p2 + '}$?', hint: '$\\sqrt[n]{c}\\to1$ for every fixed $c>0$.' } });
      }
    },
    /* 8 — FÜGGVÉNYHATÁRÉRTÉK */
    {
      id: 'limits', title: 'Függvény határértéke', icon: 'target',
      titleEn: 'Limits of functions',
      desc: 'Helyettesítés, szorzattá alakítás, végtelen, nevezetes határértékek, L’Hospital.',
      descEn: 'Substitution, factoring, infinity, standard limits, L’Hospital.',
      gen: function (level, r) {
        if (level === 1) {
          const a = ri(r, 1, 3), b = ri(r, 1, 4), x0 = ri(r, 1, 3);
          return item('Mennyi $\\lim\\limits_{x\\to' + x0 + '}(' + a + 'x^2+' + b + 'x)$?', a * x0 * x0 + b * x0, { hint: 'Polinom esetén elég behelyettesíteni.', en: { q: 'What is $\\lim\\limits_{x\\to' + x0 + '}(' + a + 'x^2+' + b + 'x)$?', hint: 'For a polynomial, substitution is enough.' } });
        }
        if (level === 2) {
          const t = ri(r, 0, 2);
          if (t === 0) { const a = ri(r, 2, 5); return item('Mennyi $\\lim\\limits_{x\\to0}\\dfrac{\\sin(' + a + 'x)}{x}$?', a, { hint: '$\\frac{\\sin(ax)}{x}\\to a$.', en: { q: 'What is $\\lim\\limits_{x\\to0}\\dfrac{\\sin(' + a + 'x)}{x}$?', hint: '$\\frac{\\sin(ax)}{x}\\to a$.' } }); }
          if (t === 1) { const a = ri(r, 2, 5); return item('Mennyi $\\lim\\limits_{x\\to0}\\dfrac{e^{' + a + 'x}-1}{x}$?', a, { hint: '$\\frac{e^{ax}-1}{x}\\to a$.', en: { q: 'What is $\\lim\\limits_{x\\to0}\\dfrac{e^{' + a + 'x}-1}{x}$?', hint: '$\\frac{e^{ax}-1}{x}\\to a$.' } }); }
          const a = ri(r, 2, 4); return item('Mennyi $\\lim\\limits_{x\\to\\infty}\\dfrac{' + a + 'x^2+1}{x^2+3}$?', a, { hint: 'Azonos fokszám: főegyütthatók hányadosa.', en: { q: 'What is $\\lim\\limits_{x\\to\\infty}\\dfrac{' + a + 'x^2+1}{x^2+3}$?', hint: 'Same degree: the ratio of the leading coefficients.' } });
        }
        const t = ri(r, 0, 2);
        if (t === 0) { const a = ri(r, 2, 4); return item('Mennyi $\\lim\\limits_{x\\to0}\\dfrac{e^x-1-x}{x^2}$?', '1/2', { hint: 'L’Hospital kétszer, vagy Taylor: $e^x=1+x+x^2/2+\\dots$.', en: { q: 'What is $\\lim\\limits_{x\\to0}\\dfrac{e^x-1-x}{x^2}$?', hint: 'L’Hospital twice, or Taylor: $e^x=1+x+x^2/2+\\dots$.' } }); }
        if (t === 1) { const a = ri(r, 1, 4); return item('Mennyi $\\lim\\limits_{x\\to\\infty}\\left(1+\\frac{' + a + '}{x}\\right)^x$?', 'e^' + a, { hint: '$(1+a/x)^x\\to e^a$.', en: { q: 'What is $\\lim\\limits_{x\\to\\infty}\\left(1+\\frac{' + a + '}{x}\\right)^x$?', hint: '$(1+a/x)^x\\to e^a$.' } }); }
        return item('Mennyi $\\lim\\limits_{x\\to0}\\dfrac{\\ln(1+x)}{x}$?', 1, { type: 'number', hint: 'L’Hospital vagy a $\\ln(1+x)$ Taylor-sora.', en: { q: 'What is $\\lim\\limits_{x\\to0}\\dfrac{\\ln(1+x)}{x}$?', hint: 'L’Hospital or the Taylor series of $\\ln(1+x)$.' } });
      }
    },
    /* 9 — DERIVÁLÁS */
    {
      id: 'derivatives', title: 'Deriválás', icon: 'arrowRight',
      titleEn: 'Differentiation',
      desc: 'Hatvány-, szorzat-, hányados- és láncszabály; érintő, implicit deriválás.',
      descEn: 'Power, product, quotient and chain rules; tangent lines, implicit differentiation.',
      gen: function (level, r) {
        if (level === 1) {
          const a = ri(r, 1, 4), b = ri(r, 1, 5), c = ri(r, 1, 6), x0 = ri(r, 1, 3);
          return item('Mennyi $f\'(' + x0 + ')$, ha $f(x)=' + a + 'x^3+' + b + 'x^2+' + c + 'x$?', 3 * a * x0 * x0 + 2 * b * x0 + c, { hint: 'Tagonként deriválj, majd helyettesíts.', en: { q: 'What is $f\'(' + x0 + ')$ if $f(x)=' + a + 'x^3+' + b + 'x^2+' + c + 'x$?', hint: 'Differentiate term by term, then substitute.' } });
        }
        if (level === 2) {
          const t = ri(r, 0, 2);
          if (t === 0) { const a = ri(r, 1, 3), b = ri(r, 1, 4), x0 = ri(r, 0, 2); return item('Mennyi $f\'(' + x0 + ')$, ha $f(x)=x^2e^{' + a + 'x}$?', (2 * x0 + a * x0 * x0) * Math.exp(a * x0), { hint: 'Szorzatszabály: $(x^2)\'e^{ax}+x^2(e^{ax})\'$.', en: { q: 'What is $f\'(' + x0 + ')$ if $f(x)=x^2e^{' + a + 'x}$?', hint: 'Product rule: $(x^2)\'e^{ax}+x^2(e^{ax})\'$.' } }); }
          if (t === 1) { const a = ri(r, 1, 3), b = ri(r, 0, 3); return item('Mennyi $f\'(0)$, ha $f(x)=\\sin(' + a + 'x+' + b + ')$?', a * Math.cos(b), { hint: 'Láncszabály: $\\cos(ax+b)\\cdot a$.', en: { q: 'What is $f\'(0)$ if $f(x)=\\sin(' + a + 'x+' + b + ')$?', hint: 'Chain rule: $\\cos(ax+b)\\cdot a$.' } }); }
          const a = ri(r, 1, 3), b = ri(r, 1, 4), c = ri(r, 1, 3), d = ri(r, 1, 4), x0 = ri(r, 0, 2);
          const num = (a * (c * x0 + d) - (a * x0 + b) * c) / Math.pow(c * x0 + d, 2);
          return item('Mennyi $f\'(' + x0 + ')$, ha $f(x)=\\dfrac{' + a + 'x+' + b + '}{' + c + 'x+' + d + '}$?', num, { hint: 'Hányadosszabály: $\\frac{f\'g-fg\'}{g^2}$.', en: { q: 'What is $f\'(' + x0 + ')$ if $f(x)=\\dfrac{' + a + 'x+' + b + '}{' + c + 'x+' + d + '}$?', hint: 'Quotient rule: $\\frac{f\'g-fg\'}{g^2}$.' } });
        }
        const t = ri(r, 0, 2);
        if (t === 0) { const a = ri(r, 2, 4), b = ri(r, 1, 3); return item('Az $x^2+y^2=' + (a * a + b * b) + '$ görbe melyik pontjában lesz az érintő meredeksége $' + (-a / b) + '$? Add meg az $x$ koordinátát.', a, { hint: 'Implicit deriválás: $2x+2yy\'=0$, tehát $y\'=-x/y$.', en: { q: 'At which point of the curve $x^2+y^2=' + (a * a + b * b) + '$ is the slope of the tangent equal to $' + (-a / b) + '$? Give the $x$ coordinate.', hint: 'Implicit differentiation: $2x+2yy\'=0$, hence $y\'=-x/y$.' } }); }
        if (t === 1) { const a = ri(r, 1, 4), b = ri(r, 1, 3); return item('Mennyi az $f(x)=x^3+' + a + 'x$ függvény érintőjének meredeksége az $x=' + b + '$ pontban?', 3 * b * b + a, { hint: 'A meredekség $f\'(' + b + ')$.', en: { q: 'What is the slope of the tangent line to $f(x)=x^3+' + a + 'x$ at $x=' + b + '$?', hint: 'The slope is $f\'(' + b + ')$.' } }); }
        return item('Mennyi $f\'\'(1)$, ha $f(x)=x^4$?', 12, { type: 'number', hint: '$f\'(x)=4x^3$, $f\'\'(x)=12x^2$.', en: { q: 'What is $f\'\'(1)$ if $f(x)=x^4$?', hint: '$f\'(x)=4x^3$, $f\'\'(x)=12x^2$.' } });
      }
    },
    /* 10 — INTEGRÁLÁS */
    {
      id: 'integrals', title: 'Integrálás', icon: 'sigma',
      titleEn: 'Integration',
      desc: 'Alapintegrálok, helyettesítés, parciális integrálás, határozott integrál.',
      descEn: 'Basic integrals, substitution, integration by parts, definite integrals.',
      gen: function (level, r) {
        if (level === 1) {
          const a = ri(r, 1, 3), b = ri(r, 1, 3);
          return item('Mennyi $\\int_0^1 ' + a + 'x^2\\,dx$?', a / 3, { hint: '$\\int x^2\\,dx=x^3/3$.', en: { q: 'What is $\\int_0^1 ' + a + 'x^2\\,dx$?', hint: '$\\int x^2\\,dx=x^3/3$.' } });
        }
        if (level === 2) {
          const t = ri(r, 0, 2);
          if (t === 0) { const a = ri(r, 1, 3); return item('Mennyi $\\int_0^{' + a + '} x e^{x^2}\\,dx$?', (Math.exp(a * a) - 1) / 2, { hint: '$u=x^2$, $du=2x\\,dx$.', en: { q: 'What is $\\int_0^{' + a + '} x e^{x^2}\\,dx$?', hint: '$u=x^2$, $du=2x\\,dx$.' } }); }
          if (t === 1) { const a = ri(r, 1, 3); return item('Mennyi $\\int_0^{\\pi/' + a + '} \\sin(' + a + 'x)\\,dx$?', 2 / a, { hint: '$\\int\\sin(ax)\\,dx=-\\cos(ax)/a$.', en: { q: 'What is $\\int_0^{\\pi/' + a + '} \\sin(' + a + 'x)\\,dx$?', hint: '$\\int\\sin(ax)\\,dx=-\\cos(ax)/a$.' } }); }
          return item('Mennyi $\\int_1^e \\frac{1}{x}\\,dx$?', 1, { type: 'number', hint: '$\\ln e-\\ln1$.', en: { q: 'What is $\\int_1^e \\frac{1}{x}\\,dx$?', hint: '$\\ln e-\\ln1$.' } });
        }
        const t = ri(r, 0, 2);
        if (t === 0) { const a = ri(r, 1, 3); return item('Mennyi $\\int_0^1 x e^{' + a + 'x}\\,dx$?', (Math.exp(a) * (a - 1) + 1) / (a * a), { hint: 'Parciális integrálás: $u=x$, $dv=e^{ax}dx$.', en: { q: 'What is $\\int_0^1 x e^{' + a + 'x}\\,dx$?', hint: 'Integration by parts: $u=x$, $dv=e^{ax}dx$.' } }); }
        if (t === 1) { const p = ri(r, 2, 4); return item('Mennyi $\\int_1^{\\infty} x^{-' + p + '}\\,dx$?', 1 / (p - 1), { hint: '$\\int_1^\\infty x^{-p}dx=\\frac{1}{p-1}$, ha $p>1$.', en: { q: 'What is $\\int_1^{\\infty} x^{-' + p + '}\\,dx$?', hint: '$\\int_1^\\infty x^{-p}dx=\\frac{1}{p-1}$ if $p>1$.' } }); }
        return item('Mennyi $\\int_0^1 \\frac{1}{\\sqrt{x}}\\,dx$?', 2, { type: 'number', hint: 'Improprius integrál: $2\\sqrt{x}$ határértéke.', en: { q: 'What is $\\int_0^1 \\frac{1}{\\sqrt{x}}\\,dx$?', hint: 'Improper integral: the limit of $2\\sqrt{x}$.' } });
      }
    },
    /* 11 — SOROK */
    {
      id: 'series', title: 'Sorok', icon: 'layers',
      titleEn: 'Series',
      desc: 'Geometriai sor, konvergenciakritériumok, Leibniz-sor, hibabecslés.',
      descEn: 'Geometric series, convergence tests, Leibniz series, error estimates.',
      gen: function (level, r) {
        if (level === 1) {
          const q = pick(r, [2, 3, 4]);
          return item('Mennyi a $\\sum_{n=0}^{\\infty}\\left(\\frac{1}{' + q + '}\\right)^n$ sor összege?', q / (q - 1), { hint: 'Geometriai sor: $\\frac{1}{1-q}$, ahol $q=1/' + q + '$.', en: { q: 'What is the sum of the series $\\sum_{n=0}^{\\infty}\\left(\\frac{1}{' + q + '}\\right)^n$?', hint: 'Geometric series: $\\frac{1}{1-q}$, where $q=1/' + q + '$.' } });
        }
        if (level === 2) {
          const p = ri(r, 2, 5);
          if (r() < 0.5) return item('Konvergens-e a $\\sum_{n=1}^{\\infty}\\frac{1}{n^{' + p + '}}$ sor?', 'Konvergens', { type: 'choice', choices: ['Konvergens', 'Divergens'], a: '0', hint: '$p$-sor: $p>1$ esetén konvergens, $p\\le1$ esetén divergens.', en: { q: 'Is the series $\\sum_{n=1}^{\\infty}\\frac{1}{n^{' + p + '}}$ convergent?', choices: ['Convergent', 'Divergent'], hint: '$p$-series: convergent for $p>1$, divergent for $p\\le1$.' } });
          return item('Mennyi a $\\sum_{n=1}^{\\infty}\\frac{' + (p - 1) + '}{n(n+1)}$ sor összege?', p - 1, { type: 'number', hint: 'Teleszkópos sor: $\\frac{1}{n(n+1)}=\\frac1n-\\frac1{n+1}$.', en: { q: 'What is the sum of the series $\\sum_{n=1}^{\\infty}\\frac{' + (p - 1) + '}{n(n+1)}$?', hint: 'Telescoping series: $\\frac{1}{n(n+1)}=\\frac1n-\\frac1{n+1}$.' } });
        }
        const t = ri(r, 0, 2);
        if (t === 0) { const q = ri(r, 2, 4); return item('Mennyi a $\\sum_{n=0}^{\\infty}\\frac{n}{' + q + '^n}$ sor összege?', q / Math.pow(q - 1, 2), { hint: 'Deriváld a geometriai sort, vagy használd a $\\sum n q^n=\\frac{q}{(1-q)^2}$ képletet.', en: { q: 'What is the sum of the series $\\sum_{n=0}^{\\infty}\\frac{n}{' + q + '^n}$?', hint: 'Differentiate the geometric series, or use the formula $\\sum n q^n=\\frac{q}{(1-q)^2}$.' } }); }
        if (t === 1) { const p = ri(r, 1, 3); return item('A $\\sum_{n=1}^{\\infty}\\frac{(-1)^n}{n^{' + p + '}}$ sor abszolút vagy feltételesen konvergens?', p === 1 ? 'Feltételesen konvergens' : 'Abszolút konvergens', { type: 'choice', choices: ['Abszolút konvergens', 'Feltételesen konvergens', 'Divergens'], a: p === 1 ? '1' : '0', hint: 'Az abszolút értékek sora $\\sum1/n^p$; $p=1$ esetén harmonikus sor, ami divergens.', en: { q: 'Is the series $\\sum_{n=1}^{\\infty}\\frac{(-1)^n}{n^{' + p + '}}$ absolutely or conditionally convergent?', choices: ['Absolutely convergent', 'Conditionally convergent', 'Divergent'], hint: 'The series of absolute values is $\\sum1/n^p$; for $p=1$ it is the harmonic series, which diverges.' } }); }
        return item('Mennyi a $\\sum_{n=0}^{\\infty}\\frac{(x-2)^n}{3^n}$ hatványsor konvergenciasugara?', 3, { type: 'number', hint: 'A sugár $R=3$. A középpont $x=2$.', en: { q: 'What is the radius of convergence of the power series $\\sum_{n=0}^{\\infty}\\frac{(x-2)^n}{3^n}$?', hint: 'The radius is $R=3$. The centre is $x=2$.' } });
      }
    },
    /* 12 — TAYLOR */
    {
      id: 'taylor', title: 'Taylor- és hatványsorok', icon: 'sigma',
      titleEn: 'Taylor and power series',
      desc: 'Taylor-polinom, nevezetes sorok, maradéktag, közelítés.',
      descEn: 'Taylor polynomials, standard series, remainder term, approximation.',
      gen: function (level, r) {
        if (level === 1) {
          const n = ri(r, 2, 4);
          if (r() < 0.5) return item('Mennyi az $e^x$ Taylor-sorában az $x^{' + n + '}$ együtthatója?', '1/' + factorial(n), { hint: '$e^x=\\sum x^n/n!$.', en: { q: 'What is the coefficient of $x^{' + n + '}$ in the Taylor series of $e^x$?', hint: '$e^x=\\sum x^n/n!$.' } });
          return item('Mennyi a $\\sin x$ Taylor-sorában az $x^3$ együtthatója?', '-1/6', { hint: '$\\sin x=x-\\frac{x^3}{3!}+\\dots$.', en: { q: 'What is the coefficient of $x^3$ in the Taylor series of $\\sin x$?', hint: '$\\sin x=x-\\frac{x^3}{3!}+\\dots$.' } });
        }
        if (level === 2) {
          const t = ri(r, 0, 2);
          if (t === 0) { const n = ri(r, 2, 4); return item('Mennyi a $\\ln(1+x)$ Taylor-sorában az $x^{' + n + '}$ együtthatója?', (n % 2 === 0 ? '-' : '') + '1/' + n, { hint: '$\\ln(1+x)=\\sum_{n=1}^\\infty(-1)^{n+1}\\frac{x^n}{n}$.', en: { q: 'What is the coefficient of $x^{' + n + '}$ in the Taylor series of $\\ln(1+x)$?', hint: '$\\ln(1+x)=\\sum_{n=1}^\\infty(-1)^{n+1}\\frac{x^n}{n}$.' } }); }
          if (t === 1) { const a = ri(r, 2, 4); return item('Mennyi a $(1+x)^{' + a + '}$ binomiális sorában az $x^2$ együtthatója?', a * (a - 1) / 2, { hint: '$\\binom{\\alpha}{2}=\\frac{\\alpha(\\alpha-1)}2$.', en: { q: 'What is the coefficient of $x^2$ in the binomial series of $(1+x)^{' + a + '}$?', hint: '$\\binom{\\alpha}{2}=\\frac{\\alpha(\\alpha-1)}2$.' } }); }
          return item('Mennyi a $\\cos x$ Taylor-sorában az $x^4$ együtthatója?', '1/24', { hint: '$\\cos x=1-\\frac{x^2}{2!}+\\frac{x^4}{4!}-\\dots$.', en: { q: 'What is the coefficient of $x^4$ in the Taylor series of $\\cos x$?', hint: '$\\cos x=1-\\frac{x^2}{2!}+\\frac{x^4}{4!}-\\dots$.' } });
        }
        const t = ri(r, 0, 2);
        if (t === 0) return item('Mennyi $\\lim\\limits_{x\\to0}\\dfrac{e^x-1-x}{x^2}$?', '1/2', { hint: 'Taylor: $e^x=1+x+\\frac{x^2}{2}+o(x^2)$.', en: { q: 'What is $\\lim\\limits_{x\\to0}\\dfrac{e^x-1-x}{x^2}$?', hint: 'Taylor: $e^x=1+x+\\frac{x^2}{2}+o(x^2)$.' } });
        if (t === 1) return item('Mennyi $\\lim\\limits_{x\\to0}\\dfrac{\\sin x-x}{x^3}$?', '-1/6', { hint: '$\\sin x=x-\\frac{x^3}{6}+o(x^3)$.', en: { q: 'What is $\\lim\\limits_{x\\to0}\\dfrac{\\sin x-x}{x^3}$?', hint: '$\\sin x=x-\\frac{x^3}{6}+o(x^3)$.' } });
        return item('Mennyi $e^{0{,}1}$ közelítése a másodfokú Taylor-polinommal?', '1.105', { type: 'number', hint: '$1+0{,}1+\\frac{0{,}01}{2}=1{,}105$.', en: { q: 'What is the approximation of $e^{0{,}1}$ given by the second-degree Taylor polynomial?', hint: '$1+0{,}1+\\frac{0{,}01}{2}=1{,}105$.' } });
      }
    },
    /* 13 — TÖBBVÁLTOZÓS */
    {
      id: 'multivar', title: 'Többváltozós analízis', icon: 'layers',
      titleEn: 'Multivariable calculus',
      desc: 'Parciális derivált, gradiens, érintősík, szélsőérték, Lagrange.',
      descEn: 'Partial derivatives, gradient, tangent plane, extrema, Lagrange multipliers.',
      gen: function (level, r) {
        if (level === 1) {
          const a = ri(r, 1, 3), b = ri(r, 1, 3), x0 = ri(r, 1, 2), y0 = ri(r, 1, 2);
          return item('Mennyi $f_x(' + x0 + ',' + y0 + ')$, ha $f(x,y)=' + a + 'x^2y+' + b + 'y^3$?', 2 * a * x0 * y0, { hint: 'Rögzített $y$ mellett deriválj $x$ szerint.', en: { q: 'What is $f_x(' + x0 + ',' + y0 + ')$ if $f(x,y)=' + a + 'x^2y+' + b + 'y^3$?', hint: 'Differentiate with respect to $x$, holding $y$ fixed.' } });
        }
        if (level === 2) {
          const a = ri(r, 1, 3), b = ri(r, 1, 3), x0 = ri(r, 1, 2), y0 = ri(r, 1, 2);
          return item('Mennyi a $f(x,y)=' + a + 'x^2+' + b + 'y^2$ gradiensvektorának hossza a $(' + x0 + ',' + y0 + ')$ pontban?', Math.sqrt(Math.pow(2 * a * x0, 2) + Math.pow(2 * b * y0, 2)), { hint: '$\\nabla f=(f_x,f_y)$; a hossz $\\sqrt{f_x^2+f_y^2}$.', en: { q: 'What is the length of the gradient vector of $f(x,y)=' + a + 'x^2+' + b + 'y^2$ at the point $(' + x0 + ',' + y0 + ')$?', hint: '$\\nabla f=(f_x,f_y)$; the length is $\\sqrt{f_x^2+f_y^2}$.' } });
        }
        const t = ri(r, 0, 2);
        if (t === 0) { const a = ri(r, 1, 4), b = ri(r, 1, 4); return item('Hol van az $f(x,y)=x^2+y^2-' + 2 * a + 'x-' + 2 * b + 'y$ függvénynek lokális minimuma? Add meg $x+y$-t.', a + b, { hint: '$f_x=2x-' + 2 * a + '=0$, $f_y=2y-' + 2 * b + '=0$.', en: { q: 'Where does $f(x,y)=x^2+y^2-' + 2 * a + 'x-' + 2 * b + 'y$ have a local minimum? Give $x+y$.', hint: '$f_x=2x-' + 2 * a + '=0$, $f_y=2y-' + 2 * b + '=0$.' } }); }
        if (t === 1) { const s = ri(r, 4, 10); return item('Mennyi az $xy$ szorzat maximuma az $x+y=' + s + '$ feltétel mellett?', s * s / 4, { hint: 'Lagrange: $y=\\lambda$, $x=\\lambda$, tehát $x=y=s/2$.', en: { q: 'What is the maximum of the product $xy$ subject to the constraint $x+y=' + s + '$?', hint: 'Lagrange: $y=\\lambda$, $x=\\lambda$, hence $x=y=s/2$.' } }); }
        return item('Mennyi az $f(x,y)=x^2-y^2$ függvény Hesse-determinánsa a $(0,0)$ pontban?', -4, { type: 'number', hint: '$f_{xx}=2$, $f_{yy}=-2$, $f_{xy}=0$; $D=f_{xx}f_{yy}-f_{xy}^2$.', en: { q: 'What is the Hessian determinant of $f(x,y)=x^2-y^2$ at the point $(0,0)$?', hint: '$f_{xx}=2$, $f_{yy}=-2$, $f_{xy}=0$; $D=f_{xx}f_{yy}-f_{xy}^2$.' } });
      }
    },
    /* 14 — LINEÁRIS ALGEBRA */
    {
      id: 'linalg', title: 'Lineáris algebra', icon: 'grid',
      titleEn: 'Linear algebra',
      desc: 'Determináns, mátrixszorzás, inverz, Gauss, sajátérték.',
      descEn: 'Determinants, matrix multiplication, inverse, Gauss elimination, eigenvalues.',
      gen: function (level, r) {
        if (level === 1) {
          const a = ri(r, 1, 5), b = ri(r, 1, 5), c = ri(r, 1, 5), d = ri(r, 1, 5);
          if (r() < 0.5) return item('Mennyi a $\\begin{pmatrix}' + a + '&' + b + '\\\\' + c + '&' + d + '\\end{pmatrix}$ mátrix determinánsa?', a * d - b * c, { hint: '$ad-bc$.', en: { q: 'What is the determinant of the matrix $\\begin{pmatrix}' + a + '&' + b + '\\\\' + c + '&' + d + '\\end{pmatrix}$?', hint: '$ad-bc$.' } });
          return item('Mennyi a $(' + a + ',' + b + ')\\cdot(' + c + ',' + d + ')$ skaláris szorzat?', a * c + b * d, { hint: 'Komponensenként szorozz és adj össze.', en: { q: 'What is the scalar product $(' + a + ',' + b + ')\\cdot(' + c + ',' + d + ')$?', hint: 'Multiply componentwise and add.' } });
        }
        if (level === 2) {
          const t = ri(r, 0, 1);
          if (t === 0) { const a = ri(r, 1, 4), b = ri(r, 1, 4), c = ri(r, 1, 4), d = ri(r, 1, 4), e = ri(r, 1, 4), f = ri(r, 1, 4), g = ri(r, 1, 4), h = ri(r, 1, 4), i = ri(r, 1, 4); return item('Mennyi a $\\begin{pmatrix}' + a + '&' + b + '&' + c + '\\\\' + d + '&' + e + '&' + f + '\\\\' + g + '&' + h + '&' + i + '\\end{pmatrix}$ determinánsa?', a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g), { hint: 'Kifejtés az első sor szerint.', en: { q: 'What is the determinant of the matrix $\\begin{pmatrix}' + a + '&' + b + '&' + c + '\\\\' + d + '&' + e + '&' + f + '\\\\' + g + '&' + h + '&' + i + '\\end{pmatrix}$?', hint: 'Expand along the first row.' } }); }
          const a = ri(r, 1, 3), b = ri(r, 1, 3), c = ri(r, 1, 3), d = ri(r, 1, 3);
          return item('Mennyi a $\\begin{pmatrix}' + a + '&' + b + '\\\\' + c + '&' + d + '\\end{pmatrix}^{-1}$ mátrix bal felső eleme?', d / (a * d - b * c), { hint: '$\\frac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}$.', en: { q: 'What is the top-left entry of the matrix $\\begin{pmatrix}' + a + '&' + b + '\\\\' + c + '&' + d + '\\end{pmatrix}^{-1}$?', hint: '$\\frac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}$.' } });
        }
        const t = ri(r, 0, 2);
        if (t === 0) { const a = ri(r, 1, 3), b = ri(r, 1, 3); return item('Mennyi a $\\begin{pmatrix}' + a + '&' + b + '\\\\' + (2 * a) + '&' + (2 * b) + '\\end{pmatrix}$ mátrix rangja?', 1, { type: 'number', hint: 'A második sor az első kétszerese, ezért lineárisan összefüggő.', en: { q: 'What is the rank of the matrix $\\begin{pmatrix}' + a + '&' + b + '\\\\' + (2 * a) + '&' + (2 * b) + '\\end{pmatrix}$?', hint: 'The second row is twice the first, so they are linearly dependent.' } }); }
        if (t === 1) { const a = ri(r, 1, 3); return item('Mennyi a $\\begin{pmatrix}' + a + '&0\\\\0&' + (a + 2) + '\\end{pmatrix}$ mátrix nagyobbik sajátértéke?', a + 2, { type: 'number', hint: 'Diagonalis mátrix sajátértékei a főátló elemei.', en: { q: 'What is the larger eigenvalue of the matrix $\\begin{pmatrix}' + a + '&0\\\\0&' + (a + 2) + '\\end{pmatrix}$?', hint: 'The eigenvalues of a diagonal matrix are the entries of the main diagonal.' } }); }
        return item('Oldd meg: $x+y=4$, $x-y=2$. Mennyi $x$?', 3, { type: 'number', hint: 'Add össze a két egyenletet.', en: { q: 'Solve: $x+y=4$, $x-y=2$. What is $x$?', hint: 'Add the two equations.' } });
      }
    },
    /* 15 — DISZKRÉT */
    {
      id: 'discrete', title: 'Diszkrét matematika', icon: 'grid',
      titleEn: 'Discrete mathematics',
      desc: 'Oszthatóság, kongruenciák, kombinatorika, gráfok.',
      descEn: 'Divisibility, congruences, combinatorics, graphs.',
      gen: function (level, r) {
        if (level === 1) {
          const a = ri(r, 12, 90), b = ri(r, 12, 60);
          if (r() < 0.5) return item('Mennyi $\\gcd(' + a + ',' + b + ')$?', gcd(a, b), { type: 'number', hint: 'Euklideszi algoritmus.', en: { q: 'What is $\\gcd(' + a + ',' + b + ')$?', hint: 'Euclidean algorithm.' } });
          const n = ri(r, 5, 9), k = ri(r, 1, Math.min(3, n - 1));
          return item('Mennyi $\\binom{' + n + '}{' + k + '}$?', binom(n, k), { type: 'number', hint: '$\\binom nk=\\frac{n!}{k!(n-k)!}$.', en: { q: 'What is $\\binom{' + n + '}{' + k + '}$?', hint: '$\\binom nk=\\frac{n!}{k!(n-k)!}$.' } });
        }
        if (level === 2) {
          const t = ri(r, 0, 1);
          if (t === 0) { const a = ri(r, 2, 6), b = ri(r, 2, 5), m = ri(r, 5, 9); return item('Mennyi $' + a + '^{' + b + '}\\bmod ' + m + '$?', modpow(a, b, m), { type: 'number', hint: 'Csökkentsd a hatványalapot modulo $' + m + '$, majd hatványozz.', en: { q: 'What is $' + a + '^{' + b + '}\\bmod ' + m + '$?', hint: 'Reduce the base modulo $' + m + '$, then exponentiate.' } }); }
          const a = ri(r, 3, 7), m = pick(r, [7, 11, 13]);
          if (gcd(a, m) !== 1) return item('Mennyi $' + a + '^{' + (m - 1) + '}\\bmod ' + m + '$ (Kis Fermat)?', modpow(a, m - 1, m), { type: 'number', hint: 'Kis Fermat: $a^{p-1}\\equiv1\\pmod p$.', en: { q: 'What is $' + a + '^{' + (m - 1) + '}\\bmod ' + m + '$ (Little Fermat)?', hint: 'Little Fermat: $a^{p-1}\\equiv1\\pmod p$.' } });
          return item('Mennyi $' + a + '^{' + (m - 1) + '}\\bmod ' + m + '$?', 1, { type: 'number', hint: 'Kis Fermat-tétel.', en: { q: 'What is $' + a + '^{' + (m - 1) + '}\\bmod ' + m + '$?', hint: 'Fermat’s little theorem.' } });
        }
        const t = ri(r, 0, 2);
        if (t === 0) { const n = ri(r, 5, 9); return item('Egy egyszerű gráfban a fokszámok összege ' + (2 * n) + '. Hány éle van?', n, { type: 'number', hint: 'Kézfogás-tétel: $\\sum d(v)=2|E|$.', en: { q: 'In a simple graph the sum of the degrees is ' + (2 * n) + '. How many edges does it have?', hint: 'Handshake lemma: $\\sum d(v)=2|E|$.' } }); }
        if (t === 1) { const n = ri(r, 5, 12); return item('Hány éle van egy ' + n + ' csúcsú fának?', n - 1, { type: 'number', hint: 'Egy $n$ csúcsú fának $n-1$ éle van.', en: { q: 'How many edges does a tree with ' + n + ' vertices have?', hint: 'A tree with $n$ vertices has $n-1$ edges.' } }); }
        return item('Hány szám osztható $2$-vel vagy $3$-mal az $1,\\dots,100$ számok közül?', 67, { type: 'number', hint: 'Logikai szita: $50+33-16=67$.', en: { q: 'How many of the numbers $1,\\dots,100$ are divisible by $2$ or $3$?', hint: 'Inclusion–exclusion: $50+33-16=67$.' } });
      }
    }
  ];

  function factorial(n) { let v = 1; for (let i = 2; i <= n; i++) v *= i; return v; }
  function binom(n, k) { return factorial(n) / (factorial(k) * factorial(n - k)); }
  function gcd(a, b) { while (b) { const t = a % b; a = b; b = t; } return Math.abs(a); }
  function modpow(a, b, m) { let r = 1; a %= m; while (b > 0) { if (b & 1) r = r * a % m; a = a * a % m; b >>= 1; } return r; }

  MB.genCats = cats;
  MB.generateBank = function (catId, seed) {
    const cat = cats.find(function (c) { return c.id === catId; });
    if (!cat) return [];
    const r = mulberry32((seed | 0) + 1013904223);
    const out = [];
    for (let i = 0; i < 50; i++) {
      const level = i < 10 ? 1 : i < 20 ? 2 : 3;
      let it;
      try { it = cat.gen(level, r); } catch (e) { it = item('Hiba történt a feladat generálásakor.', '0', { type: 'number', en: { q: 'An error occurred while generating the exercise.' } }); }
      it.level = level;
      it.i = i;
      out.push(it);
    }
    return out;
  };
  MB.generateOne = function (catId, level, seed) {
    const cat = cats.find(function (c) { return c.id === catId; });
    const r = mulberry32((seed | 0) + 7919);
    let it;
    try { it = cat.gen(level, r); } catch (e) { it = item('Hiba.', '0', { type: 'number', en: { q: 'Error.' } }); }
    it.level = level;
    return it;
  };
})();
