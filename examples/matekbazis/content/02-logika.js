var R = String.raw;
MB.section({
  id: 'logika', num: '02', title: 'Logika és bizonyítás', subtitle: 'A matematika nyelve — és a ZH-k elméleti része',
  examTag: 'elmélet',
  intro: 'Az egyetemi matematika nem attól nehéz, hogy több képlet van benne, hanem hogy állításokat kell pontosan megfogalmazni, tagadni és bizonyítani. Ez a rész a minimális formális nyelvet adja hozzá: halmazok, kvantorok, implikáció, indukció.',
  chapters: [
    {
      id: 'halmazok-logika', num: '2.1', title: 'Halmazok, logika, kvantorok', minutes: 30,
      lead: 'A definíciók kvantorokkal vannak megírva, a tételek implikációk. Ha tudod, mit jelent a „minden” és a „létezik”, és hogyan kell tagadni őket, a határérték-definíciók fele már megvan.',
      why: [
        'A matematikai állítások formális nyelvet használnak, mert a köznyelv pontatlan. A „minden folytonos függvény deriválható” állítás hamis, és ezt egyetlen ellenpéldával meg lehet cáfolni: $|x|$ folytonos, de a nullában nem deriválható. A kvantorok pontosan megmondják, milyen típusú ellenpéldát kell keresni.',
        R`A tagadás nem szavak cseréje, hanem mechanikus művelet: a $\forall$ átfordul $\exists$-be, a $\exists$ átfordul $\forall$-be, a belső állítás tagadódik, az és/vagy pedig felcserélődik. Ez az a rutin, amit a vizsgán definíciókból kérdeznek.`
      ],
      when: 'Minden definíció és tétel kimondásánál; a határérték, folytonosság, deriválhatóság és konvergencia tagadásánál; annak eldöntésénél, hogy egy állítás bizonyítása direkt, kontrapozíciós vagy indirekt legyen.',
      theory: [
        MB.def('Halmazjelölések', R`$x\in H$: eleme; $A\subseteq B$: részhalmaz; $A\cup B$: unió; $A\cap B$: metszet; $A\setminus B$: különbség; $\emptyset$: üres halmaz. Számhalmazok: $\mathbb N$ (természetes), $\mathbb Z$ (egész), $\mathbb Q$ (racionális), $\mathbb R$ (valós), $\mathbb C$ (komplex).`),
        MB.warn('Az $\mathbb N$ jelentése nem egységes', R`Egyes tárgyakban $0\in\mathbb N$, másokban nem. A vizsgán mindig az adott tárgy megállapodása számít; ha bizonytalan vagy, írd ki külön, hogy $n\ge1$ vagy $n\ge0$.`),
        MB.formula('De Morgan-azonosságok', R`\overline{A\cap B}=\overline A\cup\overline B,\qquad \overline{A\cup B}=\overline A\cap\overline B.`, 'Ugyanez logikában: $\neg(A\land B)\iff\neg A\lor\neg B$, és $\neg(A\lor B)\iff\neg A\land\neg B$.'),
        MB.def('Implikáció', R`Az $A\Rightarrow B$ („ha $A$, akkor $B$”) akkor és csak akkor hamis, ha $A$ igaz és $B$ hamis. Ha $A$ hamis, az implikáció igaz — ezt nevezik üres igazságnak. Ezért $A\Rightarrow B$ ekvivalens a $\neg A\lor B$ állítással.`),
        MB.list('Rokon állítások', [
          R`Megfordítás: $B\Rightarrow A$ — nem ekvivalens az eredetivel.`,
          R`Kontrapozíció: $\neg B\Rightarrow\neg A$ — ekvivalens az eredetivel.`,
          R`Tagadás: $\neg(A\Rightarrow B)\iff A\land\neg B$.`
        ]),
        MB.def('Kvantorok', R`$\forall x\in H:P(x)$: minden $H$-beli $x$-re igaz $P(x)$. $\exists x\in H:P(x)$: létezik olyan $H$-beli $x$, amelyre $P(x)$ igaz. A tagadásnál a kvantor megfordul: $\neg(\forall x:P(x))\iff\exists x:\neg P(x)$, és $\neg(\exists x:P(x))\iff\forall x:\neg P(x)$.`),
        MB.warn('A kvantorok sorrendje számít', R`$\forall x\exists y:y>x$ igaz $\mathbb R$-en (minden számnál van nagyobb). De $\exists y\forall x:y>x$ hamis (nincs mindennél nagyobb valós szám). Ugyanez a különbség lesz a pontbeli és az egyenletes folytonosság között.`),
        MB.note('A konvergencia tagadása', R`A konvergencia: $\forall\varepsilon>0\ \exists N\ \forall n>N:|a_n-A|<\varepsilon$. Tagadása lépésenként: $\exists\varepsilon>0\ \forall N\ \exists n>N:|a_n-A|\ge\varepsilon$. Szavakkal: van egy hibahatár, amelyhez bármekkora küszöböt választunk, mindig akad azon túl egy tag, amely legalább ennyire eltér $A$-tól.`),
        MB.formula('Halmazok elemszáma', R`|A\cup B|=|A|+|B|-|A\cap B|.`, 'Három halmazra a logikai szita: $|A\cup B\cup C|=|A|+|B|+|C|-|A\cap B|-|A\cap C|-|B\cap C|+|A\cap B\cap C|$.')
      ],
      examples: [
        MB.example({
          title: 'Kvantoros tagadás',
          problem: R`Tagadjuk: „minden folytonos függvény deriválható”.`,
          steps: [
            R`Formálisan: $\forall f\ (f\ \text{folytonos}\Rightarrow f\ \text{deriválható})$.`,
            R`A tagadás: $\exists f\ (f\ \text{folytonos}\land f\ \text{nem deriválható})$.`,
            R`Példa: $f(x)=|x|$ folytonos, de a $0$-ban nem deriválható.`
          ],
          answer: R`Egyetlen ellenpélda elég: $f(x)=|x|$.`
        }),
        MB.example({
          title: 'Indukció',
          problem: R`Bizonyítsuk be: $1+2+\dots+n=\dfrac{n(n+1)}2$ minden $n\ge1$-re.`,
          steps: [
            R`Bázis ($n=1$): bal oldal $1$, jobb oldal $1\cdot2/2=1$.`,
            R`Indukciós feltevés: tegyük fel, hogy $1+\dots+k=\frac{k(k+1)}2$.`,
            R`Indukciós lépés: $1+\dots+k+(k+1)=\frac{k(k+1)}2+(k+1)$.`,
            R`Közös nevező: $\frac{k(k+1)+2(k+1)}2=\frac{(k+1)(k+2)}2$, ami a képlet $n=k+1$-re.`
          ],
          answer: R`Az állítás minden $n\ge1$-re igaz.`
        }),
        MB.example({
          title: 'Kontrapozíció',
          problem: R`Bizonyítsuk be: ha $n^2$ páros, akkor $n$ páros.`,
          steps: [
            R`A kontrapozíció: ha $n$ páratlan, akkor $n^2$ páratlan.`,
            R`Írjuk fel $n=2k+1$ alakban.`,
            R`$n^2=4k^2+4k+1=2(2k^2+2k)+1$, ami páratlan.`,
            R`Ezzel az eredeti implikáció is bizonyítva van.`
          ],
          answer: R`Az állítás igaz.`
        })
      ],
      mistakes: [
        R`A tagadásnál a $\forall$-ot nem fordítjuk át $\exists$-be.`,
        R`Az implikációt megfordítjuk: $A\Rightarrow B$-ből $B\Rightarrow A$-ra következtetünk.`,
        R`Az indukciónál az indukciós feltevést nem használjuk fel.`,
        R`A „minden” és „létezik” sorrendjét felcseréljük.`
      ],
      exercises: [
        MB.q({ level: 2, q: R`Tagadd meg: $\forall x\in\mathbb R\ \exists y\in\mathbb R:y>x$.`, a: '∃x∈R ∀y∈R: y≤x', alt: ['∃x ∀y: y≤x', 'van olyan x, hogy minden y-ra y≤x'], type: 'text', hint: R`A kvantorok megfordulnak, a belső állítás tagadódik.`, sol: R`$\exists x\in\mathbb R\ \forall y\in\mathbb R:y\le x$. Szavakkal: van olyan szám, amelynél nincs nagyobb.` }),
        MB.q({ level: 2, q: R`Tagadd meg: $\forall\varepsilon>0\ \exists N\ \forall n>N:|a_n-A|<\varepsilon$.`, a: '∃ε>0 ∀N ∃n>N: |aₙ-A|≥ε', alt: ['∃ε>0 ∀N ∃n>N:|an-A|≥ε'], type: 'text', hint: R`Négy kvantor, kintről befelé.`, sol: R`$\exists\varepsilon>0\ \forall N\ \exists n>N:|a_n-A|\ge\varepsilon$.` }),
        MB.q({ level: 1, q: R`Bizonyítsd be direkt módon: két páratlan szám összege páros.`, type: 'proof', sol: R`Legyen a két szám $2k+1$ és $2m+1$. Összegük $2k+2m+2=2(k+m+1)$, ami osztható $2$-vel.` }),
        MB.q({ level: 2, q: R`Bizonyítsd indukcióval: $1+3+\dots+(2n-1)=n^2$.`, type: 'proof', sol: R`Bázis $n=1$: $1=1$. Ha $1+\dots+(2k-1)=k^2$, akkor hozzáadva $2k+1$-et: $k^2+2k+1=(k+1)^2$.` }),
        MB.q({ level: 1, q: R`Hány részhalmaza van egy $5$ elemű halmaznak?`, a: '32', type: 'number', hint: R`Minden elem vagy benne van, vagy nincs.`, sol: R`$2^5=32$.` }),
        MB.q({ level: 2, q: R`Igaz-e: $\exists y\in\mathbb R\ \forall x\in\mathbb R:x+y=0$?`, type: 'choice', choices: ['Igaz', 'Hamis'], a: '1', sol: R`Hamis. Minden $x$-hez más $y=-x$ kellene; nincs egyetlen $y$, amely minden $x$-re jó.` })
      ],
      video: { title: 'Logika, kvantorok, bizonyítási módszerek', channel: 'Magyar matematika csatornák', kind: 'KERESÉS', search: 'matematikai logika kvantorok tagadás bizonyítási módszerek magyar' }
    }
  ]
});
