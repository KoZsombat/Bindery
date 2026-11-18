/* Glosszárium — fogalomtár a könyvhöz.
   Minden fogalom egyszer van definiálva; a fejezetek innen hivatkoznak rá.
   Ez a fájl a szerzői réteg része: a generált könyvekben ugyanezt a
   site.json glossary mező adja. */
(function () {
  const MB = (window.MB = window.MB || {});
  MB.glossary = [
    {
      id: 'hatvany',
      term: { hu: 'Hatvány', en: 'Power' },
      plain: { hu: 'Azt mondja meg, hányszor szorozzuk önmagával ugyanazt a számot.', en: 'It says how many times a number is multiplied by itself.' },
      precise: { hu: '$a^n$ jelentése $n$ darab $a$ szorzata ($n$ pozitív egész); $a^0=1$, $a^{-n}=1/a^n$, és tört kitevőnél $a^{p/q}=\\sqrt[q]{a^p}$, ha a gyök értelmezve van.', en: '$a^n$ means the product of $n$ copies of $a$ ($n$ a positive integer); $a^0=1$, $a^{-n}=1/a^n$, and for a fractional exponent $a^{p/q}=\\sqrt[q]{a^p}$ where the root is defined.' },
      chapter: { section: 'alapok', chapter: 'algebra' }
    },
    {
      id: 'logaritmus',
      term: { hu: 'Logaritmus', en: 'Logarithm' },
      plain: { hu: 'Azt kérdezi: hányadik hatványra kell emelni az alapot, hogy az adott számot kapjuk.', en: 'It asks: to what power must the base be raised to get this number?' },
      precise: { hu: '$\\log_a b=c$ pontosan akkor, ha $a^c=b$, ahol $a>0$, $a\\ne 1$ és $b>0$.', en: '$\\log_a b=c$ exactly when $a^c=b$, with $a>0$, $a\\ne 1$ and $b>0$.' },
      chapter: { section: 'alapok', chapter: 'algebra' }
    },
    {
      id: 'radián',
      term: { hu: 'Radián', en: 'Radian' },
      plain: { hu: 'Szögmérték, amely a körív hosszát hasonlítja a sugárhoz.', en: 'An angle measure that compares arc length to the radius.' },
      precise: { hu: 'Egy radián az a szög, amelyhez tartozó körív hossza megegyezik a sugárral; $180^\\circ=\\pi$ radián.', en: 'One radian is the angle whose arc length equals the radius; $180^\\circ=\\pi$ radians.' },
      chapter: { section: 'alapok', chapter: 'trigonometria' }
    },
    {
      id: 'inverz-fuggveny',
      term: { hu: 'Inverz függvény', en: 'Inverse function' },
      plain: { hu: 'Visszafelé ható függvény: megmondja, melyik bemenetből lett az adott kimenet.', en: 'A function that runs backwards: it tells you which input produced a given output.' },
      precise: { hu: '$f^{-1}$ akkor létezik, ha $f$ injektív; ekkor $f^{-1}(f(x))=x$ minden értelmezett $x$-re, és $f(f^{-1}(y))=y$ minden $y$-ra az értékkészletből.', en: '$f^{-1}$ exists when $f$ is injective; then $f^{-1}(f(x))=x$ for every $x$ in the domain, and $f(f^{-1}(y))=y$ for every $y$ in the range.' },
      chapter: { section: 'alapok', chapter: 'fuggvenyek' }
    },
    {
      id: 'komplex-szam',
      term: { hu: 'Komplex szám', en: 'Complex number' },
      plain: { hu: 'Olyan szám, amelynek van egy valós és egy „képzetes” összetevője; síkon ábrázolható.', en: 'A number with a real and an "imaginary" component; it can be drawn in a plane.' },
      precise: { hu: '$z=a+bi$, ahol $a,b\\in\\mathbb{R}$ és $i^2=-1$; az összeadás komponensenként, a szorzás a disztributivitás és $i^2=-1$ szerint történik.', en: '$z=a+bi$ with $a,b\\in\\mathbb{R}$ and $i^2=-1$; addition is componentwise, multiplication follows distributivity and $i^2=-1$.' },
      chapter: { section: 'komplex', chapter: 'komplex-algebra' }
    },
    {
      id: 'konjugalt',
      term: { hu: 'Konjugált', en: 'Conjugate' },
      plain: { hu: 'A komplex szám tükrözése a valós tengelyre: a képzetes rész előjele megfordul.', en: 'The complex number mirrored across the real axis: the imaginary part changes sign.' },
      precise: { hu: '$\\overline{a+bi}=a-bi$; ekkor $z\\overline{z}=a^2+b^2=|z|^2$, és $\\overline{z+w}=\\overline z+\\overline w$.', en: '$\\overline{a+bi}=a-bi$; then $z\\overline{z}=a^2+b^2=|z|^2$ and $\\overline{z+w}=\\overline z+\\overline w$.' },
      chapter: { section: 'komplex', chapter: 'komplex-algebra' }
    },
    {
      id: 'sorozat',
      term: { hu: 'Sorozat', en: 'Sequence' },
      plain: { hu: 'Számok végtelen, sorrendbe rakott listája; a kérdés az, hova tart.', en: 'An infinite ordered list of numbers; the question is where it is heading.' },
      precise: { hu: 'A sorozat egy $a:\\mathbb{N}\\to\\mathbb{R}$ függvény; $a_n$ jelöli az $n$-edik tagot. A sorozat konvergens, ha létezik $L$, hogy minden $\\varepsilon>0$-hoz van $N$: $n>N$ esetén $|a_n-L|<\\varepsilon$.', en: 'A sequence is a function $a:\\mathbb{N}\\to\\mathbb{R}$; $a_n$ is the $n$th term. It converges if there is $L$ such that for every $\\varepsilon>0$ there is $N$ with $|a_n-L|<\\varepsilon$ for $n>N$.' },
      chapter: { section: 'sorozatok', chapter: 'sorozat-konvergencia' }
    },
    {
      id: 'korlatos',
      term: { hu: 'Korlátos sorozat', en: 'Bounded sequence' },
      plain: { hu: 'A tagok nem szaladnak el a végtelenbe: minden tag belefér két korlát közé.', en: 'The terms do not run off to infinity: every term fits between two bounds.' },
      precise: { hu: 'Léteznek $K,L\\in\\mathbb{R}$, hogy minden $n$-re $K\\le a_n\\le L$. Konvergens sorozat mindig korlátos, de korlátos sorozat nem feltétlenül konvergens.', en: 'There exist $K,L\\in\\mathbb{R}$ with $K\\le a_n\\le L$ for every $n$. Every convergent sequence is bounded, but a bounded sequence need not converge.' },
      chapter: { section: 'sorozatok', chapter: 'sorozat-konvergencia' }
    },
    {
      id: 'hatarertek',
      term: { hu: 'Határérték', en: 'Limit' },
      plain: { hu: 'Az az érték, amelyhez a sorozat vagy függvény egyre közelebb kerül, ha a bemenet viselkedése „elég messzire” megy.', en: 'The value a sequence or function approaches as the input goes far enough.' },
      precise: { hu: '$f$-nek $x_0$-ban $L$ a határértéke, ha minden $\\varepsilon>0$-hoz van $\\delta>0$: $0<|x-x_0|<\\delta$ esetén $|f(x)-L|<\\varepsilon$.', en: '$f$ has limit $L$ at $x_0$ if for every $\\varepsilon>0$ there is $\\delta>0$ such that $0<|x-x_0|<\\delta$ implies $|f(x)-L|<\\varepsilon$.' },
      chapter: { section: 'hatarertek', chapter: 'fuggveny-hatarertek' }
    },
    {
      id: 'folytonossag',
      term: { hu: 'Folytonosság', en: 'Continuity' },
      plain: { hu: 'A függvény grafikonja egy vonalban rajzolható, szakadás nélkül.', en: 'The graph can be drawn in one stroke, without a break.' },
      precise: { hu: '$f$ folytonos $x_0$-ban, ha $\\lim_{x\\to x_0} f(x)=f(x_0)$; ehhez a helyettesítési értéknek és a határértéknek is léteznie kell, és meg kell egyeznie.', en: '$f$ is continuous at $x_0$ if $\\lim_{x\\to x_0} f(x)=f(x_0)$; both the value and the limit must exist and agree.' },
      chapter: { section: 'hatarertek', chapter: 'fuggveny-hatarertek' }
    },
    {
      id: 'derivalt',
      term: { hu: 'Derivált', en: 'Derivative' },
      plain: { hu: 'A változás pillanatnyi sebessége: mennyit változik a kimenet, ha a bemenetet kicsit mozdítjuk.', en: 'The instantaneous rate of change: how much the output moves when the input moves a little.' },
      precise: { hu: '$f\'(x_0)=\\lim_{h\\to 0}\\frac{f(x_0+h)-f(x_0)}{h}$, ha ez a határérték létezik; ekkor $f$ differenciálható $x_0$-ban, és ott folytonos is.', en: '$f\'(x_0)=\\lim_{h\\to 0}\\frac{f(x_0+h)-f(x_0)}{h}$ if this limit exists; then $f$ is differentiable at $x_0$ and also continuous there.' },
      chapter: { section: 'derivalas', chapter: 'derivalt-definicio' }
    },
    {
      id: 'hatarozott-integral',
      term: { hu: 'Határozott integrál', en: 'Definite integral' },
      plain: { hu: 'A görbe alatti előjeles terület egy intervallumon.', en: 'The signed area under a curve over an interval.' },
      precise: { hu: '$\\int_a^b f(x)\\,dx$ a Riemann-féle közelítő összegek határértéke, ha $f$ korlátos és az intervallum felosztása finomodik; előjeles területet ad.', en: '$\\int_a^b f(x)\\,dx$ is the limit of Riemann sums as the partition is refined, when $f$ is bounded; it gives signed area.' },
      chapter: { section: 'integralas', chapter: 'integral-hatarozott' }
    }
  ];
})();
