var R = String.raw;
MB.section({
  id: 'alapok', num: '01', title: 'Alapok', subtitle: 'Amit az egyetem feltételez — és számon kér',
  examTag: 'alapozás',
  intro: 'Az első hetek nem azért nehezek, mert új a matematika, hanem mert a régi rutinokra építenek. Ez a rész azokat az átalakításokat szedi rendbe, amelyek nélkül a határérték, a derivált és az integrál minden lépése bizonytalan lesz.',
  chapters: [
    {
      id: 'algebra', num: '1.1', title: 'Hatványok, gyökök, logaritmus', minutes: 25,
      lead: 'A hatványozás ismételt szorzás. Minden más szabály — a negatív kitevő, a törtkitevő, a logaritmus — ebből az egyetlen ötletből vezethető le, nem bemagolandó.',
      why: [
        'A hatványozás eredetileg ismételt szorzás: $x^3 = x \\cdot x \\cdot x$. Ha ugyanazt az alapot szorozzuk, a tényezők száma összeadódik, ezért $x^a x^b = x^{a+b}$. Osztásnál a tényezők „kiesnek”, ezért $x^a/x^b = x^{a-b}$. A többi szabály nem új megállapodás, hanem ennek a két összefüggésnek a következménye.',
        'A logaritmus ugyanezt a kérdést teszi fel visszafelé: „hanyadik hatványra kell emelni az alapot, hogy ezt kapjam?”. Ezért a logaritmus-azonosságok pontosan a hatványszabályok tükörképei. Ha ezt érzed, nem kell külön memorizálni őket.'
      ],
      when: 'Minden határérték-, deriválás- és integrálfeladat előtt. A leggyakoribb hiba nem az új anyagban van, hanem egy rossz kitevős átalakításban vagy egy elfelejtett értelmezési tartományban. Ha egy kifejezést egyszerűbb alakra tudsz hozni, a határérték és a derivált is egyszerűbb lesz.',
      theory: [
        MB.def('Hatvány és gyök', R`Az $x^n$ hatvány jelentése $n$ darab $x$ szorzata (ha $n$ pozitív egész). A gyökvonás ennek inverze: $\sqrt[n]{x}$ az a nemnegatív szám, amelynek $n$-edik hatványa $x$. Páratlan gyök negatív számból is vehető; páros gyök csak nemnegatívból.`),
        MB.formula('Hatványszabályok', R`\begin{aligned}
x^a x^b &= x^{a+b}, & \frac{x^a}{x^b} &= x^{a-b},\\
(x^a)^b &= x^{ab}, & (xy)^a &= x^a y^a,\\
x^0 &= 1\ (x\neq 0), & x^{-a} &= \frac{1}{x^a},\\
\sqrt[n]{x^m} &= x^{m/n}\ (x>0).
\end{aligned}`, 'A törtkitevős átalakítás csak pozitív alap mellett „biztonságos”; negatív alapnál a valós kitevő értelmezése megváltozik.'),
        MB.def('Logaritmus', R`$\log_a b = c$ pontosan azt jelenti, hogy $a^c=b$, ahol $a>0$, $a\neq 1$ és $b>0$. A természetes logaritmus alapja $e\approx 2{,}71828$, jele $\ln x$. A tízes alapú logaritmus jele $\lg x$ vagy $\log_{10}x$.`),
        MB.formula('Logaritmus-azonosságok', R`\begin{aligned}
\ln(AB) &= \ln A + \ln B,\\
\ln\frac{A}{B} &= \ln A - \ln B,\\
\ln(A^k) &= k\ln A,\\
\log_a b &= \frac{\ln b}{\ln a}.
\end{aligned}`, 'Feltétel: $A>0$, $B>0$. Ha $A$ vagy $B$ negatív is lehet, akkor $\ln(x^2)=2\ln|x|$, nem $2\ln x$.'),
        MB.note('Miért $e$?', R`Az $e$ nem önkényes szám: az $(1+1/n)^n$ sorozat határértéke. Ezért az $e^x$ az egyetlen olyan exponenciális függvény (a konstans szorzótól eltekintve), amelynek a deriváltja önmaga. Ez teszi a számítástechnikában és a fizikában is természetes alapúvá.`),
        MB.warn('A leggyakoribb csapda', R`$\sqrt{x^2}=|x|$, nem $x$. Például $x=-3$ esetén $\sqrt{9}=3$, nem $-3$. Ugyanígy $(a+b)^2\neq a^2+b^2$, és $\sqrt{a+b}\neq\sqrt a+\sqrt b$. Törtet csak szorzattá alakított tényezővel lehet egyszerűsíteni, tagot nem.`),
        MB.formula('Nevezetes szorzatok', R`\begin{aligned}
a^2-b^2 &= (a-b)(a+b),\\
a^3-b^3 &= (a-b)(a^2+ab+b^2),\\
a^3+b^3 &= (a+b)(a^2-ab+b^2),\\
(a+b)^2 &= a^2+2ab+b^2.
\end{aligned}`)
      ],
      examples: [
        MB.example({
          title: 'Törtkitevők összevonása',
          problem: R`Írjuk fel egyetlen hatványként ($x>0$): $\dfrac{x^2\cdot\sqrt[3]{x}}{x^{-1}\cdot\sqrt{x}}$.`,
          steps: [
            R`A számláló: $x^2\cdot x^{1/3}=x^{2+1/3}=x^{7/3}$.`,
            R`A nevező: $x^{-1}\cdot x^{1/2}=x^{-1+1/2}=x^{-1/2}$.`,
            R`Osztásnál kivonunk: $x^{7/3-(-1/2)}=x^{7/3+1/2}$.`,
            R`Közös nevező: $7/3+1/2=14/6+3/6=17/6$.`
          ],
          answer: R`$x^{17/6}$`
        }),
        MB.example({
          title: 'Exponenciális egyenlet',
          problem: R`Oldjuk meg: $2^{3x-1}=5$.`,
          steps: [
            R`Mindkét oldal 2-es alapú logaritmusát vesszük: $3x-1=\log_2 5$.`,
            R`Áttérünk természetes alapra: $\log_2 5=\dfrac{\ln 5}{\ln 2}$.`,
            R`Rendezve: $x=\dfrac{1+\log_2 5}{3}=\dfrac{1+\ln 5/\ln 2}{3}\approx 1{,}107$.`
          ],
          answer: R`$x=\dfrac{1+\log_2 5}{3}\approx 1{,}107$`
        }),
        MB.example({
          title: 'Helyettesítéses exponenciális egyenlet',
          problem: R`Oldjuk meg: $9^x-4\cdot 3^x+3=0$.`,
          steps: [
            R`Vezessük be a $t=3^x>0$ helyettesítést. Ekkor $9^x=(3^x)^2=t^2$.`,
            R`Az egyenlet: $t^2-4t+3=0$, azaz $(t-1)(t-3)=0$.`,
            R`$t=1$ esetén $3^x=1$, tehát $x=0$. $t=3$ esetén $3^x=3$, tehát $x=1$.`,
            R`Mindkét gyök megfelel, mert $t>0$ teljesül.`
          ],
          answer: R`$x=0$ vagy $x=1$`
        }),
        MB.example({
          title: 'Logaritmusos egyenlet értelmezési tartománnyal',
          problem: R`Oldjuk meg: $\ln(x+2)+\ln(x-1)=\ln 4$.`,
          steps: [
            R`Először az értelmezési tartomány: $x+2>0$ és $x-1>0$, tehát $x>1$.`,
            R`A logaritmus-azonossággal: $\ln((x+2)(x-1))=\ln 4$.`,
            R`A logaritmus szigorúan monoton, ezért $(x+2)(x-1)=4$.`,
            R`$x^2+x-2=4$, azaz $x^2+x-6=0$, gyökei $x=2$ és $x=-3$.`,
            R`A $-3$ nem teljesíti az $x>1$ feltételt, ezért csak $x=2$ megoldás.`
          ],
          answer: R`$x=2$`
        })
      ],
      mistakes: [
        R`$\sqrt{x^2}=x$ helyett $\sqrt{x^2}=|x|$.`,
        R`$(a+b)^2=a^2+b^2$ — helyesen $a^2+2ab+b^2$.`,
        R`Logaritmusos egyenletnél az értelmezési tartomány ellenőrzésének elhagyása.`,
        R`Tört egyszerűsítése taggal: $\frac{x^2-9}{x-3}=x+3$ csak $x\neq 3$ esetén, és csak mert a számláló szorzattá alakítható.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Írd fel egyetlen hatványként ($x>0$), és add meg a kitevőt: $\dfrac{x^2\cdot\sqrt[3]{x}}{x^{-1}\cdot\sqrt{x}}$.`, a: '17/6', type: 'expr', hint: R`Minden tényezőt $x$ hatványaként írj: $\sqrt[3]{x}=x^{1/3}$, $\sqrt{x}=x^{1/2}$.`, sol: R`Számláló: $x^{7/3}$; nevező: $x^{-1/2}$; hányados: $x^{7/3+1/2}=x^{17/6}$.` }),
        MB.q({ level: 2, q: R`Oldd meg: $\ln(x+2)+\ln(x-1)=\ln 4$.`, a: '2', type: 'number', hint: R`Előbb értelmezési tartomány: $x>1$. Aztán $\ln((x+2)(x-1))=\ln 4$.`, sol: R`$(x+2)(x-1)=4\Rightarrow x^2+x-6=0\Rightarrow x=2$ vagy $x=-3$. Csak $x=2$ van az értelmezési tartományban.` }),
        MB.q({ level: 1, q: R`Mennyi $\cos(2\pi/3)$?`, a: '-1/2', type: 'expr', hint: R`$2\pi/3=\pi-\pi/3$, a második síknegyedben a koszinusz negatív.`, sol: R`$\cos(2\pi/3)=-\cos(\pi/3)=-1/2$.` }),
        MB.q({ level: 2, q: R`Oldd meg: $2^{3x-1}=5$. Add meg $x$ pontos értékét.`, a: '(1+ln(5)/ln(2))/3', alt: ['(1+log(5)/log(2))/3', '(1+ln5/ln2)/3'], type: 'expr', hint: R`Vedd mindkét oldal 2-es alapú logaritmusát.`, sol: R`$3x-1=\log_2 5\Rightarrow x=(1+\log_2 5)/3$.` }),
        MB.q({ level: 2, q: R`Oldd meg: $9^x-4\cdot 3^x+3=0$. Add meg a nagyobbik gyököt.`, a: '1', type: 'number', hint: R`$t=3^x>0$ helyettesítés; $9^x=t^2$.`, sol: R`$t^2-4t+3=0\Rightarrow t=1$ vagy $t=3$. Innen $x=0$ vagy $x=1$; a nagyobbik $1$.` }),
        MB.q({ level: 3, q: R`Add meg az $f(x)=\dfrac{\ln(x^2-5x+6)}{\sqrt{4-x}}$ függvény értelmezési tartományát.`, a: '(-∞,2)U(3,4)', alt: ['x<2 vagy 3<x<4', '(-inf,2)U(3,4)', ']-∞,2[∪]3,4['], type: 'text', hint: R`Két feltétel: $x^2-5x+6>0$ és $4-x>0$.`, sol: R`$(x-2)(x-3)>0\Rightarrow x<2$ vagy $x>3$; valamint $x<4$. Metszet: $(-\infty,2)\cup(3,4)$.` }),
        MB.q({ level: 1, q: R`Oldd meg: $|2x+1|\ge 5$.`, a: 'x≤-3 vagy x≥2', alt: ['(-∞,-3]U[2,∞)', 'x<=-3 vagy x>=2', '(-inf,-3]U[2,inf)'], type: 'text', hint: R`Két eset: $2x+1\ge 5$ vagy $2x+1\le -5$.`, sol: R`$2x+1\ge5\Rightarrow x\ge2$; $2x+1\le-5\Rightarrow x\le-3$.` }),
        MB.q({ level: 2, q: R`Igaz-e minden valós $x$-re, hogy $\sqrt{x^2}=x$?`, type: 'choice', choices: ['Igaz', 'Hamis'], a: '1', sol: R`Hamis. $\sqrt{x^2}=|x|$; például $x=-3$ esetén $\sqrt{9}=3\neq-3$.` })
      ],
      video: { title: 'Hatványok, gyökök és logaritmus alapok', channel: 'Magyar matematika csatornák', kind: 'KERESÉS', search: 'hatványozás gyökvonás logaritmus magyarázat középiskola' }
    },
    {
      id: 'trigonometria', num: '1.2', title: 'Trigonometria és az egységkör', minutes: 28,
      lead: 'Az egyetemen minden szög radiánban van, és a szögfüggvényeket nem háromszögekkel, hanem az egységkör koordinátáiként érdemes látni. Ez teszi érthetővé az előjeleket, a periódust és az azonosságokat.',
      why: [
        'Egy origó középpontú, egységsugarú körön az $x$-tengely pozitív felétől $\alpha$ szöggel elfordulva a pont koordinátái $(\cos\alpha,\sin\alpha)$. Mivel a pont a körön van, $x^2+y^2=1$, ezért $\cos^2\alpha+\sin^2\alpha=1$. Ez nem külön tétel, hanem a Pitagorasz-tétel a körön.',
        R`A radián nem új mértékegység, hanem a szöghez tartozó körív hossza az egységsugarú körön. A teljes kör kerülete $2\pi$, ezért $360^\circ=2\pi$ és $180^\circ=\pi$. Ezért lesz a deriválásnál $(\sin x)'=\cos x$, és nem valami $180/\pi$-s szorzó.`
      ],
      when: R`Határértékeknél ($\frac{\sin x}{x}$), deriválásnál, integrálásnál, komplex számok trigonometrikus alakjánál és Fourier-soroknál. A nevezetes szögek és a síknegyedek szerinti előjel ismerete nélkül ezek a feladatok lassúak és hibásak lesznek.`,
      theory: [
        MB.formula('Alapdefiníciók', R`\cos^2\alpha+\sin^2\alpha=1,\qquad \tan\alpha=\frac{\sin\alpha}{\cos\alpha},\qquad \cot\alpha=\frac{\cos\alpha}{\sin\alpha}.`),
        MB.formula('Nevezetes szögek', R`\begin{array}{c|ccccc}
\alpha & 0 & \frac{\pi}{6} & \frac{\pi}{4} & \frac{\pi}{3} & \frac{\pi}{2}\\[2pt]\hline
\sin\alpha & 0 & \frac12 & \frac{\sqrt2}{2} & \frac{\sqrt3}{2} & 1\\
\cos\alpha & 1 & \frac{\sqrt3}{2} & \frac{\sqrt2}{2} & \frac12 & 0\\
\tan\alpha & 0 & \frac{1}{\sqrt3} & 1 & \sqrt3 & \text{nem ért.}
\end{array}`),
        MB.note('Síknegyedek és előjelek', R`Az egységkörön haladva: I. síknegyedben mindkettő pozitív; II.-ban $\sin>0$, $\cos<0$; III.-ban mindkettő negatív; IV.-ben $\sin<0$, $\cos>0$. A $\tan$ előjele a $\sin$ és $\cos$ hányadosából jön.`),
        MB.formula('Addíciós és kétszeres szög', R`\begin{aligned}
\sin(\alpha\pm\beta) &= \sin\alpha\cos\beta\pm\cos\alpha\sin\beta,\\
\cos(\alpha\pm\beta) &= \cos\alpha\cos\beta\mp\sin\alpha\sin\beta,\\
\sin 2\alpha &= 2\sin\alpha\cos\alpha,\\
\cos 2\alpha &= \cos^2\alpha-\sin^2\alpha.
\end{aligned}`),
        MB.warn('Fok és radián keverése', R`A deriválás és a határérték csak radiánban működik. Ha egy feladatban fok szerepel, előbb váltsd át: $\alpha_{\text{rad}}=\alpha^\circ\cdot\frac{\pi}{180}$.`),
        MB.note('Trigonometrikus egyenletek', R`A $\sin x=\frac12$ egyenlet megoldásai $x=\frac{\pi}{6}+2k\pi$ vagy $x=\frac{5\pi}{6}+2k\pi$ ($k\in\mathbb Z$). Az egységkörön két pont van ilyen magasságban, és a periódus miatt mindkettő végtelen sokszor ismétlődik.`),
        MB.list('Amit fejből érdemes tudni', [
          R`$\sin(-x)=-\sin x$, $\cos(-x)=\cos x$ (páratlan, illetve páros).`,
          R`Mindkettő $2\pi$ szerint periodikus; a $\tan$ periódusa $\pi$.`,
          R`$\sin x$ maximuma $1$, minimuma $-1$; a $\cos$ ugyanígy.`,
          R`$\cos x=0$ ott, ahol $x=\frac{\pi}{2}+k\pi$; itt a $\tan$ nem értelmezett.`
        ])
      ],
      demo: 'unitcircle',
      examples: [
        MB.example({
          title: 'Táblázaton kívüli szög',
          problem: R`Mennyi $\cos(2\pi/3)$ és $\sin(5\pi/6)$?`,
          steps: [
            R`$2\pi/3=\pi-\pi/3$: a második síknegyedben a koszinusz negatív, a referenciaszög $\pi/3$.`,
            R`$\cos(2\pi/3)=-\cos(\pi/3)=-1/2$.`,
            R`$5\pi/6=\pi-\pi/6$: szintén második síknegyed, a szinusz pozitív.`,
            R`$\sin(5\pi/6)=\sin(\pi/6)=1/2$.`
          ],
          answer: R`$\cos(2\pi/3)=-1/2$, $\sin(5\pi/6)=1/2$`
        }),
        MB.example({
          title: 'Trigonometrikus egyenlet',
          problem: R`Oldjuk meg a $[0,2\pi)$ intervallumon: $2\sin^2x-\sin x-1=0$.`,
          steps: [
            R`Vezessük be a $t=\sin x$ helyettesítést, ahol $|t|\le1$.`,
            R`$2t^2-t-1=0$, azaz $(2t+1)(t-1)=0$.`,
            R`$t=1$: $\sin x=1$, tehát $x=\pi/2$.`,
            R`$t=-1/2$: $\sin x=-1/2$, tehát $x=7\pi/6$ vagy $x=11\pi/6$.`,
            R`Mindhárom megoldás a $[0,2\pi)$ intervallumban van.`
          ],
          answer: R`$x=\frac{\pi}{2},\frac{7\pi}{6},\frac{11\pi}{6}$`
        })
      ],
      mistakes: [
        R`A $\sin x=\frac12$ egyenletnél csak a $\pi/6$-ot írjuk fel, a $5\pi/6$-ot elfelejtjük.`,
        R`$\cos(2\pi/3)$-nál az előjelet nem a síknegyedből, hanem a számológépből vesszük.`,
        R`Fokban deriválunk: $(\sin x)'=\cos x$ csak radiánban igaz.`,
        R`$\sin^2 x$-et $\sin(x^2)$-ként értelmezzük. $\sin^2 x=(\sin x)^2$.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Mennyi $\sin(5\pi/6)$?`, a: '1/2', type: 'expr', hint: R`$5\pi/6=\pi-\pi/6$, második síknegyed.`, sol: R`$\sin(5\pi/6)=\sin(\pi/6)=1/2$.` }),
        MB.q({ level: 1, q: R`Mennyi $\tan(3\pi/4)$?`, a: '-1', type: 'expr', hint: R`$3\pi/4=\pi-\pi/4$; a tangens a második síknegyedben negatív.`, sol: R`$\tan(3\pi/4)=-\tan(\pi/4)=-1$.` }),
        MB.q({ level: 2, q: R`Oldd meg a $[0,2\pi)$ intervallumon: $\sin x=\frac12$. Add meg a kisebbik megoldást.`, a: 'pi/6', alt: ['π/6'], type: 'expr', hint: R`Két pont van az egységkörön ilyen magasságban.`, sol: R`$x=\pi/6$ vagy $x=5\pi/6$; a kisebbik $\pi/6$.` }),
        MB.q({ level: 2, q: R`Oldd meg: $2\sin^2x-\sin x-1=0$ a $[0,2\pi)$ intervallumon. Hány megoldás van?`, a: '3', type: 'number', hint: R`$t=\sin x$ helyettesítés, majd $|t|\le1$.`, sol: R`$t=1$ vagy $t=-1/2$. Megoldások: $\pi/2,7\pi/6,11\pi/6$ — három darab.` }),
        MB.q({ level: 2, q: R`Egyszerűsítsd: $\sin^2x+\cos^2x$.`, a: '1', type: 'number', hint: R`Az egységkör egyenlete.`, sol: R`A pont rajta van az $x^2+y^2=1$ körön, ezért az összeg $1$.` }),
        MB.q({ level: 3, q: R`Mennyi $\cos(2x)$, ha $\sin x=\frac35$ és $x$ az első síknegyedben van?`, a: '7/25', type: 'expr', hint: R`$\cos^2x=1-\sin^2x$, majd $\cos2x=\cos^2x-\sin^2x$.`, sol: R`$\cos x=4/5$, ezért $\cos2x=16/25-9/25=7/25$.` }),
        MB.q({ level: 1, q: R`Hány radián $180^\circ$?`, a: 'pi', alt: ['π'], type: 'expr', hint: R`A félkör ívhossza az egységkörön.`, sol: R`$180^\circ=\pi$ radián.` })
      ],
      video: { title: 'Trigonometria az egységkörön', channel: 'Magyar matematika csatornák', kind: 'KERESÉS', search: 'trigonometria egységkör radián magyarázat' }
    },
    {
      id: 'fuggvenyek', num: '1.3', title: 'Függvények, értelmezési tartomány, inverz', minutes: 24,
      lead: 'A függvény nem képlet, hanem hozzárendelés: minden bemenethez pontosan egy kimenet. Az egyetemi feladatok nagy része azon múlik, hogy ezt a hozzárendelést milyen halmazon értelmezzük, és hogy invertálható-e.',
      why: [
        'Az értelmezési tartomány nem formai kellék. Ha egy logaritmus belseje negatív, a kifejezés nem értelmezett; ha egy nevező nulla, a függvény ott nem létezik. A határérték és a folytonosság vizsgálatánál pontosan ezek a pontok lesznek érdekesek.',
        'Az inverz függvény az a gondolat, hogy a hozzárendelést visszafelé is el tudjuk végezni. Ez csak akkor működik, ha különböző bemenetekhez különböző kimenetek tartoznak (injektivitás), és minden kimenet elő is fordul (szürjektivitás). A deriválásnál az inverz deriváltja ebből a visszafelé gondolkodásból jön.'
      ],
      when: 'Minden függvényvizsgálat első lépése: mi az értelmezési tartomány? Inverz függvény kell az exponenciális/logaritmus, a trigonometrikus/arc függvények és a deriválási szabályok megértéséhez. A ZH-kon külön feladat szokott lenni az értelmezési tartomány és az inverz.',
      theory: [
        MB.def('Függvény, értelmezési tartomány, értékkészlet', R`Az $f:A\to B$ függvény minden $a\in A$-hoz pontosan egy $f(a)\in B$ elemet rendel. $A$ az értelmezési tartomány, a tényleges kimenetek halmaza az értékkészlet. Az értelmezési tartományt a kifejezésből kell meghatározni: logaritmus belseje $>0$, páros gyök alatt $\ge0$, nevező $\neq0$.`),
        MB.def('Injektív, szürjektív, bijektív', R`Injektív: $f(x)=f(y)\Rightarrow x=y$ (különböző bemenethez különböző kimenet). Szürjektív: minden $b\in B$-hez van $a$, amelyre $f(a)=b$. Bijektív: mindkettő. Pontosan a bijektív függvénynek van inverze.`),
        MB.note('Inverz függvény', R`Ha $f$ bijektív, akkor $f^{-1}$ az a függvény, amelyre $f^{-1}(f(x))=x$ és $f(f^{-1}(y))=y$. A grafikonja az $y=x$ egyenesre való tükrözés. Például $f(x)=2x+3$ inverze $f^{-1}(x)=\frac{x-3}{2}$; az $e^x$ inverze $\ln x$.`),
        MB.formula('Összetett függvény', R`(g\circ f)(x)=g(f(x)).`, 'A belső függvény az $f$, a külső a $g$. A sorrend nem cserélhető fel: $g\circ f\neq f\circ g$ általában.'),
        MB.warn('Nem minden függvény invertálható', R`$f(x)=x^2$ az $\mathbb R\to\mathbb R$ leképezésként nem injektív, mert $f(2)=f(-2)$. Ha a halmazt $[0,\infty)$-re szűkítjük, bijektív lesz, és az inverze $\sqrt x$. Ezért kell mindig megadni az értelmezési tartományt és az értékkészletet is.`),
        MB.list('Transzformációk', [
          R`$f(x)+c$: függőleges eltolás felfelé.`,
          R`$f(x-c)$: vízszintes eltolás jobbra.`,
          R`$c f(x)$: függőleges nyújtás/zsugorítás.`,
          R`$-f(x)$: tükrözés az $x$-tengelyre; $f(-x)$: tükrözés az $y$-tengelyre.`
        ])
      ],
      examples: [
        MB.example({
          title: 'Értelmezési tartomány',
          problem: R`Határozzuk meg a $g(x)=\dfrac{\sqrt{x^2-x-6}}{x-4}$ függvény értelmezési tartományát.`,
          steps: [
            R`A gyök alatt: $x^2-x-6\ge0$, azaz $(x-3)(x+2)\ge0$. Felfelé nyíló parabola, ezért $x\le-2$ vagy $x\ge3$.`,
            R`A nevező: $x-4\neq0$, tehát $x\neq4$.`,
            R`A két feltétel metszete: $(-\infty,-2]\cup[3,4)\cup(4,\infty)$.`
          ],
          answer: R`$D_g=(-\infty,-2]\cup[3,4)\cup(4,\infty)$`
        }),
        MB.example({
          title: 'Inverz függvény',
          problem: R`Határozzuk meg az $f(x)=2x+3$ függvény inverzét.`,
          steps: [
            R`Írjuk fel $y=2x+3$ alakban.`,
            R`Fejezzük ki $x$-et: $x=\frac{y-3}{2}$.`,
            R`Cseréljük fel a betűket: $f^{-1}(x)=\frac{x-3}{2}$.`,
            R`Ellenőrzés: $f(f^{-1}(x))=2\cdot\frac{x-3}{2}+3=x$.`
          ],
          answer: R`$f^{-1}(x)=\dfrac{x-3}{2}$`
        }),
        MB.example({
          title: 'Összetett függvény',
          problem: R`Legyen $f(x)=x^2$ és $g(x)=\ln x$. Határozzuk meg $(g\circ f)(x)$-et és az értelmezési tartományát.`,
          steps: [
            R`$(g\circ f)(x)=g(f(x))=\ln(x^2)$.`,
            R`A logaritmus belseje pozitív: $x^2>0$, azaz $x\neq0$.`,
            R`Tehát $(g\circ f)(x)=\ln(x^2)=2\ln|x|$, értelmezve $x\neq0$-ra.`
          ],
          answer: R`$\ln(x^2)=2\ln|x|$, $x\neq0$`
        })
      ],
      mistakes: [
        R`Az értelmezési tartománynál csak a gyököt vizsgáljuk, a nevezőt nem.`,
        R`Az inverznél nem cseréljük fel $x$-et és $y$-t, ezért a függvény marad.`,
        R`$f^{-1}(x)$-et $\frac{1}{f(x)}$-szel tévesztjük össze. Az inverz nem reciprok!`,
        R`A $\ln(x^2)$-et $\ln x$-szel azonosítjuk; valójában $2\ln|x|$.`
      ],
      exercises: [
        MB.q({ level: 2, q: R`Add meg a $g(x)=\dfrac{\sqrt{x^2-x-6}}{x-4}$ értelmezési tartományát.`, a: '(-∞,-2]U[3,4)U(4,∞)', alt: ['x≤-2 vagy 3≤x<4 vagy x>4', '(-inf,-2]U[3,4)U(4,inf)'], type: 'text', hint: R`Gyök alatt $\ge0$, nevezőben $\neq0$.`, sol: R`$(x-3)(x+2)\ge0\Rightarrow x\le-2$ vagy $x\ge3$; valamint $x\neq4$.` }),
        MB.q({ level: 1, q: R`Mi az $f(x)=2x+3$ inverze?`, a: '(x-3)/2', alt: ['x/2-3/2', '0.5x-1.5'], type: 'expr', hint: R`Oldd meg $y=2x+3$-at $x$-re.`, sol: R`$x=(y-3)/2$, tehát $f^{-1}(x)=(x-3)/2$.` }),
        MB.q({ level: 2, q: R`Mi az $f(x)=e^x$ inverze?`, a: 'ln(x)', alt: ['ln x', 'log(x)'], type: 'expr', hint: R`Melyik függvény adja vissza a kitevőt?`, sol: R`$f^{-1}(x)=\ln x$, értelmezve $x>0$-ra.` }),
        MB.q({ level: 2, q: R`Legyen $f(x)=x^2$, $g(x)=\ln x$. Mi a $(g\circ f)(e)$ értéke?`, a: '2', type: 'number', hint: R`Előbb $f(e)=e^2$, majd $g(e^2)$.`, sol: R`$\ln(e^2)=2$.` }),
        MB.q({ level: 1, q: R`Injektív-e az $f(x)=x^2$ függvény $\mathbb R\to\mathbb R$ értelemben?`, type: 'choice', choices: ['Igen', 'Nem'], a: '1', sol: R`Nem: $f(2)=f(-2)=4$, tehát különböző bemenethez azonos kimenet tartozik.` }),
        MB.q({ level: 3, q: R`Add meg az $f(x)=\ln(4-x^2)$ értelmezési tartományát.`, a: '(-2,2)', alt: ['-2<x<2', ']-2,2['], type: 'text', hint: R`$4-x^2>0$.`, sol: R`$4-x^2>0\Rightarrow x^2<4\Rightarrow -2<x<2$.` })
      ],
      video: { id: 'bqrOMT8YdSg', title: 'Összetett függvény képzése', channel: 'FZsMatek · Felsőfok', kind: 'VIDEÓ' }
    },
    {
      id: 'egyenletek', num: '1.4', title: 'Egyenletek, egyenlőtlenségek, abszolútérték', minutes: 26,
      lead: R`Az egyenlőtlenségeknél nem „átrendezünk”, hanem előjelet vizsgálunk. Ez az a rutin, amelyből a határérték-definíciók $\varepsilon$-os egyenlőtlenségei és a folytonosság bizonyításai épülnek.`,
      why: [
        'Egy egyenlőtlenséget negatív számmal szorozva az irány megfordul. Ezért ismeretlen előjelű kifejezéssel nem szabad beszorozni: a törtes egyenlőtlenséget mindig úgy oldjuk meg, hogy mindent az egyik oldalra viszünk, közös nevezőre hozunk, és előjeltáblázatot készítünk.',
        R`Az $|x-a|<\varepsilon$ kifejezés nem „abszolútértékes egyenlet”, hanem távolság: az $x$ az $a$-tól kisebb, mint $\varepsilon$ távolságra van. Ezért $a-\varepsilon<x<a+\varepsilon$. Az Analízis 1 összes határérték-definíciója ezt a átfogalmazást használja.`
      ],
      when: R`Határérték-bizonyításoknál ($|a_n-A|<\varepsilon$), folytonosságnál ($|x-a|<\delta$), deriválásnál az előjeltáblázatnál, integrálásnál a terület intervallumainál. Az egyenlőtlenségek rutinja nélkül a definíciók érthetetlennek tűnnek.`,
      theory: [
        MB.formula('Másodfokú egyenlet', R`ax^2+bx+c=0\ \Longrightarrow\ x_{1,2}=\frac{-b\pm\sqrt{b^2-4ac}}{2a}.`, 'A diszkrimináns $D=b^2-4ac$. Ha $D<0$, nincs valós gyök; ha $D=0$, egy kettős gyök van.'),
        MB.note('Viète-formulák', R`$x_1+x_2=-\frac{b}{a}$ és $x_1x_2=\frac{c}{a}$. Ezekkel gyorsan ellenőrizhető a gyökök összege és szorzata.`),
        MB.note('Másodfokú egyenlőtlenség', R`Az $ax^2+bx+c$ előjelét a parabola alakja adja. Ha $a>0$ (felfelé nyíló), a kifejezés a gyökökön kívül pozitív, a gyökök között negatív. Ha $a<0$, fordítva. A gyökökön a kifejezés nulla; szigorú egyenlőtlenségnél ezek nem tartoznak bele.`),
        MB.warn('Törtes egyenlőtlenség', R`Az $\frac{x+1}{x-2}\ge0$ megoldásához nem szabad „keresztbe szorozni” $x-2$-vel, mert annak előjele ismeretlen. Előjeltáblázat kell: a számláló $x=-1$-nél, a nevező $x=2$-nél vált előjelet. Megoldás: $(-\infty,-1]\cup(2,\infty)$. Az $x=2$ nem megoldás, mert a nevező nulla.`),
        MB.formula('Abszolútérték', R`|x-a|<\varepsilon \iff a-\varepsilon<x<a+\varepsilon,`),
        MB.formula('Abszolútértékes egyenlőtlenségek', R`|x|\ge c\ (c>0)\iff x\ge c\ \text{vagy}\ x\le-c.`),
        MB.note('Háromszög-egyenlőtlenség', R`$|a+b|\le|a|+|b|$. Ez a becslések alapja: ha egy kifejezést felülről akarunk becsülni, gyakran ezzel választjuk szét a tagokat.`)
      ],
      examples: [
        MB.example({
          title: 'Törtes egyenlőtlenség',
          problem: R`Oldjuk meg: $\dfrac{x-1}{x+3}<2$.`,
          steps: [
            R`Vigyünk mindent egy oldalra: $\dfrac{x-1}{x+3}-2<0$.`,
            R`Közös nevező: $\dfrac{x-1-2(x+3)}{x+3}=\dfrac{-x-7}{x+3}<0$.`,
            R`Szorozzunk $-1$-gyel (fordul az irány): $\dfrac{x+7}{x+3}>0$.`,
            R`Előjeltáblázat: a számláló $x=-7$-nél, a nevező $x=-3$-nál vált. A tört pozitív, ha mindkettő azonos előjelű: $x<-7$ vagy $x>-3$.`
          ],
          answer: R`$x\in(-\infty,-7)\cup(-3,\infty)$`
        }),
        MB.example({
          title: 'Abszolútértékes egyenlőtlenség',
          problem: R`Oldjuk meg: $|2x+1|\ge5$.`,
          steps: [
            R`Két eset: $2x+1\ge5$ vagy $2x+1\le-5$.`,
            R`Az elsőből $x\ge2$.`,
            R`A másodikból $x\le-3$.`,
            R`A megoldás a két félegyenes uniója.`
          ],
          answer: R`$x\in(-\infty,-3]\cup[2,\infty)$`
        }),
        MB.example({
          title: 'Gyökös egyenlet',
          problem: R`Oldjuk meg: $\sqrt{x+3}=x-3$.`,
          steps: [
            R`Feltétel: $x+3\ge0$ és a jobb oldal is nemnegatív, mert gyök értéke $\ge0$: $x-3\ge0$, azaz $x\ge3$.`,
            R`Négyzetre emelve: $x+3=(x-3)^2=x^2-6x+9$.`,
            R`$x^2-7x+6=0$, gyökei $x=1$ és $x=6$.`,
            R`Az $x=1$ nem teljesíti az $x\ge3$ feltételt; csak $x=6$ megoldás. Ellenőrzés: $\sqrt9=3$, $6-3=3$.`
          ],
          answer: R`$x=6$`
        })
      ],
      mistakes: [
        R`Törtes egyenlőtlenségnél a nevezővel való beszorzás (előjel ismeretlen).`,
        R`A gyökös egyenletnél a négyzetre emelés után nem ellenőrizzük a feltételeket (hamis gyök).`,
        R`$|x|\ge c$ megoldását $x\ge c$-ként adjuk meg, elfelejtve az $x\le-c$ ágat.`,
        R`A logaritmusos egyenletnél a kapott gyököt nem ellenőrizzük az értelmezési tartományon.`
      ],
      exercises: [
        MB.q({ level: 2, q: R`Oldd meg: $\dfrac{x-1}{x+3}<2$. Add meg az intervallumot.`, a: '(-∞,-7)U(-3,∞)', alt: ['x<-7 vagy x>-3', '(-inf,-7)U(-3,inf)'], type: 'text', hint: R`Hozz közös nevezőre, ne szorozz $x+3$-mal.`, sol: R`$\frac{x-1-2x-6}{x+3}<0\Rightarrow\frac{-x-7}{x+3}<0\Rightarrow x<-7$ vagy $x>-3$.` }),
        MB.q({ level: 1, q: R`Oldd meg: $|2x+1|\ge5$.`, a: 'x≤-3 vagy x≥2', alt: ['(-∞,-3]U[2,∞)', 'x<=-3 vagy x>=2'], type: 'text', hint: R`Két eset.`, sol: R`$x\ge2$ vagy $x\le-3$.` }),
        MB.q({ level: 2, q: R`Oldd meg: $\sqrt{x+3}=x-3$.`, a: '6', type: 'number', hint: R`Feltétel: $x\ge3$, majd négyzetre emelés.`, sol: R`$x+3=x^2-6x+9\Rightarrow x^2-7x+6=0\Rightarrow x=1$ vagy $6$; csak $6$ jó.` }),
        MB.q({ level: 2, q: R`Oldd meg: $x^2-5x+6=0$. Add meg a gyökök összegét.`, a: '5', type: 'number', hint: R`Viète: $x_1+x_2=-b/a$.`, sol: R`$x_1+x_2=5$, $x_1x_2=6$; a gyökök $2$ és $3$.` }),
        MB.q({ level: 1, q: R`Oldd meg: $x^2-5x+6>0$.`, a: 'x<2 vagy x>3', alt: ['(-∞,2)U(3,∞)', 'x<=2 vagy x>=3'], type: 'text', hint: R`Felfelé nyíló parabola; a gyökökön kívül pozitív.`, sol: R`$(x-2)(x-3)>0\Rightarrow x<2$ vagy $x>3$.` }),
        MB.q({ level: 3, q: R`Oldd meg: $\ln(x^2)=2\ln 2$. Add meg az összes valós megoldást.`, a: 'x=2 vagy x=-2', alt: ['±2', '2,-2', '-2,2'], type: 'text', hint: R`$\ln(x^2)=2\ln|x|$, és $x\neq0$.`, sol: R`$2\ln|x|=2\ln2\Rightarrow\ln|x|=\ln2\Rightarrow|x|=2\Rightarrow x=\pm2$.` })
      ],
      video: { title: 'Egyenlőtlenségek és abszolútérték', channel: 'Magyar matematika csatornák', kind: 'KERESÉS', search: 'abszolútértékes egyenlőtlenség törtes egyenlőtlenség magyarázat' }
    }
  ]
});
