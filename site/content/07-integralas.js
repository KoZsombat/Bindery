var R = String.raw;
MB.section({
  id: 'integralas', num: '07', title: 'Integrálás', subtitle: 'Terület, antiderivált, felhalmozódás',
  examTag: 'vizsga',
  intro: 'Az integrál két kérdésre ad választ, és a kurzus nagy része arról szól, hogy rájöjjünk: ez a két kérdés ugyanaz. Egyrészt: melyik függvény deriváltja az adott $f$? Másrészt: mennyi terület halmozódik fel $f$ grafikonja alatt? Az első a határozatlan, a második a határozott integrál, és a Newton–Leibniz-tétel mondja ki, hogy a kettő egy és ugyanaz. A vizsgán nem a trükkök száma dönt, hanem hogy felismered-e, melyik minta illik a feladatra, és hogy ellenőrizni tudod-e a választ deriválással.',
  chapters: [
    {
      id: 'integral-alap', num: '7.1', title: 'Határozatlan integrál, helyettesítés', minutes: 30,
      lead: 'A határozatlan integrál nem más, mint a deriválás visszafelé. Ezért minden integrálás ellenőrizhető: deriváld a kapott függvényt, és az eredeti integrandust kell visszakapnod.',
      why: [
        'Ha $F\'(x)=f(x)$, akkor $F$ az $f$ primitív függvénye. Mivel egy konstans deriváltja nulla, egy primitív függvényből végtelen sok van: $F(x)+C$ mindegyik primitív függvény, és megfordítva, bármely két primitív függvény csak konstansban tér el. Ezért írjuk a $+C$-t: nem díszítés, hanem a megoldáshalmaz leírása. Egy konkrét $C$ megadása annyit jelentene, mintha azt állítanánk, hogy csak egyetlen ős létezik.',
        'A helyettesítés nem új trükk, hanem a láncszabály visszafelé olvasva. A láncszabály szerint $[F(g(x))]\'=F\'(g(x))g\'(x)=f(g(x))g\'(x)$. Tehát ha az integrandusban felismerünk egy belső függvényt és annak deriváltját szorzóként, akkor az integrál egyszerűen $F(g(x))$. Ezért kulcsfontosságú, hogy a belső függvény deriváltját keresd, és ne a képletet magold.'
      ],
      when: 'Minden integrálfeladat első lépése: van-e olyan belső függvény, amelynek a deriváltja (konstans szorzótól eltekintve) ott van az integrandusban? Ha igen, helyettesítés. Ha az integrandus szorzat, amelyben az egyik tényező logaritmus, arkuszfüggvény vagy polinom, akkor parciális integrálás felé érdemes menni. A $+C$ elhagyása és a konstans faktor elvesztése a két leggyakoribb pontvesztés ezen a szinten.',
      theory: [
        MB.def('Primitív függvény és határozatlan integrál', R`Az $F$ függvény az $f$ primitív függvénye egy intervallumon, ha ott $F'(x)=f(x)$ minden $x$-re. Ennek jelölése $\int f(x)\,dx=F(x)+C$, ahol $C\in\mathbb R$ tetszőleges állandó. A $dx$ nem szorzótényező, hanem azt jelöli, hogy melyik a változó: $\int f(u)\,du$ ugyanaz a függvény, csak más betűvel.`),
        MB.formula('Alapintegrálok', R`\begin{array}{ll}
\int x^n\,dx=\dfrac{x^{n+1}}{n+1}+C & (n\neq-1)\\[6pt]
\int \dfrac{dx}{x}=\ln|x|+C & \int e^{ax}\,dx=\dfrac{e^{ax}}{a}+C\\[6pt]
\int \sin(ax)\,dx=-\dfrac{\cos(ax)}{a}+C & \int \cos(ax)\,dx=\dfrac{\sin(ax)}{a}+C\\[6pt]
\int \dfrac{dx}{1+x^2}=\arctan x+C & \int \dfrac{dx}{\sqrt{1-x^2}}=\arcsin x+C
\end{array}`, 'Az $a\neq0$ konstans. A $\ln|x|$ abszolútértéke azért kell, mert $1/x$ a negatív félegyenesen is értelmezett.'),
        MB.note('Miért van ott a $+C$?', R`A deriválás nem injektív: $x^2+3$ és $x^2-100$ deriváltja egyaránt $2x$. Ezért a primitív függvény csak konstans erejéig meghatározott. Két primitív függvény különbségének deriváltja nulla, egy intervallumon pedig a nulla deriváltjú függvény konstans. Tehát a teljes megoldáshalmaz valóban $F(x)+C$. Határozott integrálnál a konstans kiesik, ezért ott nem írjuk ki.`),
        MB.formula('Lineáris belső függvény', R`\int f(ax+b)\,dx=\frac{1}{a}F(ax+b)+C,\qquad a\neq 0.`, 'Ez a leggyorsabb eset: csak el kell osztani a belső függvény deriváltjával.'),
        MB.thm('Helyettesítéses integrálás', R`Ha $u=g(x)$ differenciálható és $f$ folytonos, akkor
\int f(g(x))\,g'(x)\,dx=\int f(u)\,du\Big|_{u=g(x)}=F(g(x))+C,`),
        MB.note('Hogyan ismerjük fel a mintát?', R`Nézzük az integrandust, és keressünk benne egy „belső” függvényt. Ha a belső függvény deriváltja ott van szorzóként, kész a helyettesítés. Például $\frac{2x}{x^2+1}$-ben a belső $x^2+1$, deriváltja $2x$ — pontosan ott van. A $\cos(3x)$-ban a belső $3x$, deriváltja $3$, ami konstans szorzóként kiemelhető. Ha a derivált csak konstans szorzóban tér el, azt a konstansot korrigálni kell, de a hiányzó $x$-et nem lehet „kitalálni”.`),
        MB.warn('A leggyakoribb hibák', R`$\int f(x)g(x)\,dx\neq \int f(x)\,dx\cdot\int g(x)\,dx$: az integrál nem bontja fel a szorzatot. Ugyanígy $\int\frac{1}{x^2+1}\,dx\neq\ln(x^2+1)$: itt nem helyettesítés, hanem $\arctan$ a válasz. A $\int \frac{1}{x}\,dx=\ln|x|$, nem $\ln x$, és nem $x^{-1}/(-1)$.`),
        MB.list('Amit érdemes fejben tartani', [
          R`A deriválás és az integrálás inverz műveletek (a konstans erejéig).`,
          R`Minden integrál ellenőrizhető deriválással — ezt a vizsgán is érdemes megtenni.`,
          R`A konstans szorzó kiemelhető: $\int c f(x)\,dx=c\int f(x)\,dx$.`,
          R`Összeget tagonként integrálunk, szorzatot nem.`
        ])
      ],
      examples: [
        MB.example({
          title: 'Elemi hatványintegrál',
          problem: R`Számítsuk ki: $\displaystyle\int x^2\,dx$.`,
          steps: [
            R`A hatványszabály szerint $x^n$ primitív függvénye $\frac{x^{n+1}}{n+1}$, itt $n=2$.`,
            R`$\int x^2\,dx=\frac{x^{3}}{3}+C$.`,
            R`Ellenőrzés: $\left(\frac{x^3}{3}\right)'=\frac{3x^2}{3}=x^2$, tehát helyes.`
          ],
          answer: R`$\dfrac{x^3}{3}+C$`
        }),
        MB.example({
          title: 'Exponenciális függvény lineáris belsővel',
          problem: R`Számítsuk ki: $\displaystyle\int e^{3x}\,dx$.`,
          steps: [
            R`A belső függvény $3x$, deriváltja $3$.`,
            R`A lineáris helyettesítés szabálya: $\int e^{ax}dx=\frac{1}{a}e^{ax}+C$.`,
            R`Tehát $\int e^{3x}dx=\frac{1}{3}e^{3x}+C$.`,
            R`Ellenőrzés: $\left(\frac{e^{3x}}{3}\right)'=\frac{3e^{3x}}{3}=e^{3x}$.`
          ],
          answer: R`$\dfrac{e^{3x}}{3}+C$`
        }),
        MB.example({
          title: 'Logaritmikus helyettesítés',
          problem: R`Számítsuk ki: $\displaystyle\int\frac{2x}{x^2+1}\,dx$.`,
          steps: [
            R`Válasszuk a belső függvényt: $u=x^2+1$, ekkor $du=2x\,dx$.`,
            R`Az integrandus pontosan $\frac{du}{u}$ alakú.`,
            R`$\int\frac{du}{u}=\ln|u|+C=\ln(x^2+1)+C$.`,
            R`Mivel $x^2+1>0$ minden valós $x$-re, az abszolútérték elhagyható.`
          ],
          answer: R`$\ln(x^2+1)+C$`
        }),
        MB.example({
          title: 'Trigonometrikus függvény lineáris belsővel',
          problem: R`Számítsuk ki: $\displaystyle\int \sin(5x)\,dx$.`,
          steps: [
            R`A belső függvény $5x$, deriváltja $5$.`,
            R`$\int\sin(ax)dx=-\frac{\cos(ax)}{a}+C$ képletből $a=5$.`,
            R`$\int\sin(5x)dx=-\frac{\cos(5x)}{5}+C$.`,
            R`Ellenőrzés: $\left(-\frac{\cos(5x)}{5}\right)'=\frac{5\sin(5x)}{5}=\sin(5x)$.`
          ],
          answer: R`$-\dfrac{\cos(5x)}{5}+C$`
        })
      ],
      mistakes: [
        R`A $+C$ elhagyása határozatlan integrálnál.`,
        R`A konstans faktor elvesztése: $\int e^{3x}dx=e^{3x}+C$ (helyesen $e^{3x}/3$).`,
        R`Hiányzó $x$ „pótlása”: $\int\frac{1}{x^2+1}dx$-nél $\ln$-re gondolni, holott $\arctan$ a válasz.`,
        R`A szorzat tagonkénti integrálása: $\int x\cos x\,dx\neq\frac{x^2}{2}\sin x$.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Számítsd ki: $\displaystyle\int x^5\,dx$. (A $+C$-t ne írd be.)`, a: 'x^6/6', type: 'expr', hint: R`A kitevőt eggyel növeled, és az új kitevővel osztasz.`, sol: R`$\int x^5dx=\frac{x^6}{6}+C$.` }),
        MB.q({ level: 1, q: R`Számítsd ki: $\displaystyle\int\big(3x^2+2\big)\,dx$. (A $+C$-t ne írd be.)`, a: 'x^3+2x', type: 'expr', hint: R`Tagonként integrálj.`, sol: R`$\int 3x^2dx=x^3$, $\int 2dx=2x$, tehát $x^3+2x+C$.` }),
        MB.q({ level: 1, q: R`Számítsd ki: $\displaystyle\int \cos(3x)\,dx$. (A $+C$-t ne írd be.)`, a: 'sin(3x)/3', type: 'expr', hint: R`$\int\cos(ax)dx=\frac{\sin(ax)}{a}+C$.`, sol: R`$a=3$, tehát $\frac{\sin(3x)}{3}+C$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\int e^{-x}\,dx$. (A $+C$-t ne írd be.)`, a: '-e^(-x)', alt: ['-1/e^x', '-exp(-x)'], type: 'expr', hint: R`A belső függvény $-x$, deriváltja $-1$.`, sol: R`$\int e^{-x}dx=\frac{e^{-x}}{-1}+C=-e^{-x}+C$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\int (2x+1)^5\,dx$. (A $+C$-t ne írd be.)`, a: '(2x+1)^6/12', type: 'expr', hint: R`Lineáris belső függvény: oszd el a belső deriváltjával.`, sol: R`$\frac{1}{2}\cdot\frac{(2x+1)^6}{6}=\frac{(2x+1)^6}{12}+C$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\int\frac{dx}{3x+2}$. Add meg a primitív függvényt ($+C$ nélkül).`, a: 'ln|3x+2|/3', alt: ['(1/3)ln|3x+2|', 'ln(abs(3x+2))/3'], type: 'text', hint: R`$u=3x+2$, $du=3\,dx$, tehát $\frac13\int\frac{du}{u}$.`, sol: R`$\frac{1}{3}\ln|3x+2|+C$. Az abszolútérték azért kell, mert $3x+2$ negatív is lehet.` }),
        MB.q({ level: 3, q: R`Számítsd ki: $\displaystyle\int x\,e^{x^2}\,dx$. (A $+C$-t ne írd be.)`, a: 'e^(x^2)/2', alt: ['exp(x^2)/2', '0.5*e^(x^2)'], type: 'expr', hint: R`$u=x^2$, ekkor $du=2x\,dx$, tehát $x\,dx=\frac{du}{2}$.`, sol: R`$\frac12\int e^u du=\frac{e^{x^2}}{2}+C$. Ellenőrzés: deriváltja $x e^{x^2}$.` }),
        MB.q({ level: 3, type: 'proof', q: R`Bizonyítsd be, hogy ha $F$ az $f$ primitív függvénye és $g$ differenciálható, akkor $\int f(g(x))g'(x)\,dx=F(g(x))+C$.`, hint: R`A láncszabályt olvasd visszafelé: deriváld $F(g(x))$-et.`, sol: R`A láncszabály szerint $[F(g(x))]'=F'(g(x))\,g'(x)=f(g(x))\,g'(x)$, mert $F'=f$. Tehát $F(g(x))$ valóban primitív függvénye az $f(g(x))g'(x)$ integrandusnak. Mivel minden primitív függvény konstansban tér el, az összes megoldás $F(g(x))+C$ alakú.` })
      ],
      video: { list: 'PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr', title: 'Essence of calculus', channel: '3Blue1Brown', kind: 'LEJÁTSZÁSI LISTA' }
    },
    {
      id: 'integral-parcialis', num: '7.2', title: 'Parciális integrálás, racionális törtek', minutes: 34,
      lead: 'Két olyan technika, amely a legtöbb vizsgafeladatot lefedi: a szorzat visszafelé integrálása, és a tört polinomok egyszerű törtekre bontása.',
      why: [
        R`A parciális integrálás a szorzat deriválási szabályából jön. Ha $(fg)'=f'g+fg'$, akkor átrendezve $fg'=(fg)'-f'g$, és integrálva $\int fg'=fg-\int f'g$. Ez a képlet akkor hasznos, ha $\int f'g$ egyszerűbb, mint az eredeti $\int fg'$. Ezért nem mindegy, melyik tényezőt nevezzük $f$-nek: azt érdemes $f$-nek választani, amelyik deriválással egyszerűsödik (logaritmus, arkuszfüggvény, polinom), és azt $g'$-nek, amelyiket könnyű integrálni (exponenciális, szinusz, koszinusz).`,
        R`A racionális tört integrálása nem ötletkérdés, hanem algoritmus. Ha a számláló foka nem kisebb, mint a nevezőé, először polinomosztást végzünk. Utána a nevezőt valós tényezőkre bontjuk, és a törtet parciális törtek összegére írjuk. Innen minden tag vagy $\ln$, vagy $\arctan$ alakú. Azért működik mindig, mert a valós együtthatós polinomok első- és másodfokú tényezők szorzatára bomlanak.`,
      ],
      when: R`Parciális integrálás: ha az integrandus szorzat, és az egyik tényező „rossz” (logaritmus, arkusz), vagy ha ciklikusan visszatér az eredeti integrál ($e^x\sin x$). Racionális törtek: ha az integrandus két polinom hányadosa. A vizsgán a felismerés a nehéz: a $\int\ln x\,dx$ első ránézésre nem szorzat, de $1\cdot\ln x$-ként igen.`,
      theory: [
        MB.formula('Parciális integrálás', R`\int f(x)\,g'(x)\,dx=f(x)g(x)-\int f'(x)\,g(x)\,dx.`, 'A szorzat deriválási szabályának integrált alakja. Gyakran $\int u\,dv=uv-\int v\,du$ alakban használjuk.'),
        MB.note('Hogyan válasszunk?', R`Azt a tényezőt érdemes $f$-nek (azaz $u$-nak) venni, amelyik deriválással egyszerűbb lesz: logaritmus, arkuszfüggvény, polinom. A $g'$-t (azaz $dv$-t) abból a tényezőből képezzük, amelyet könnyű integrálni: $e^{ax}$, $\sin(ax)$, $\cos(ax)$, $1$. Ha rosszul választunk, az új integrál bonyolultabb lesz — akkor érdemes visszalépni és cserélni.`),
        MB.note('Ismételt és ciklikus eset', R`Polinom szorzatánál a polinom fokszáma minden lépésben eggyel csökken, ezért véges sok lépés után elfogy: $\int x^2e^x dx$-hez kétszer kell parciálisan integrálni. Ha $\int e^x\sin x\,dx$-et számoljuk, a parciális integrálás után az eredeti integrál újra megjelenik; ekkor az egyenletet rendezzük ki. Ilyenkor a konstans a legvégén kerül a válaszba.`),
        MB.def('Valódi racionális tört', R`A $\frac{P(x)}{Q(x)}$ racionális tört valódi, ha $\deg P<\deg Q$. Ha nem az, akkor polinomosztással $P=Q\cdot S+T$ alakba írjuk, tehát $\frac PQ=S+\frac TQ$, ahol $\frac TQ$ már valódi. Az $S$ polinom tagonként integrálható, ezért a nehéz rész mindig a valódi tört.`),
        MB.thm('Parciális törtekre bontás', R`Ha $Q$ különböző valós gyökei $\alpha_1,\dots,\alpha_k$, akkor $\dfrac{P}{Q}=\sum_{i}\dfrac{A_i}{x-\alpha_i}$. Ismétlődő $(x-\alpha)^m$ tényezőnél $\sum_{j=1}^{m}\dfrac{B_j}{(x-\alpha)^j}$ szerepel. Felbonthatatlan $(x^2+px+q)$ tényezőnél a számláló lineáris: $\dfrac{Cx+D}{x^2+px+q}$.`),
        MB.formula('A két záró integrál', R`\int\frac{dx}{x^2+a^2}=\frac1a\arctan\frac xa+C,\qquad \int\frac{dx}{x^2-a^2}=\frac{1}{2a}\ln\left|\frac{x-a}{x+a}\right|+C.`, R`A második a $\frac{1}{x^2-a^2}=\frac{1}{2a}\left(\frac{1}{x-a}-\frac{1}{x+a}\right)$ felbontásból jön.`),
        MB.warn('Ellenőrzés mindig lehetséges', R`A parciális törtekre bontást nem kell hinni: közös nevezőre hozva vissza kell kapnod az eredeti számlálót. A felbonthatatlan másodfokú tényezőnél a számláló nem lehet konstans, ha a nevezőben $x^2$ szerepel — ezt a hibát nehéz észrevenni, ezért a visszaszorzás a legjobb védelem.`),
        MB.list('Mikor melyik módszer?', [
          R`Polinom × exponenciális vagy polinom × trigonometrikus: parciális integrálás, a polinomot deriváljuk.`,
          R`Logaritmus vagy arkuszfüggvény egyedül: parciális integrálás $dv=dx$ választással.`,
          R`Két polinom hányadosa: parciális törtek (előbb polinomosztás).`,
          R`Szorzat, ahol a belső függvény deriváltja ott van: helyettesítés, nem parciális integrálás.`
        ])
      ],
      examples: [
        MB.example({
          title: 'Polinom szor exponenciális',
          problem: R`Számítsuk ki: $\displaystyle\int x\,e^x\,dx$.`,
          steps: [
            R`Válasszuk $f=x$-et és $g'=e^x$-et, mert a polinom deriválással egyszerűsödik.`,
            R`Ekkor $f'=1$ és $g=e^x$.`,
            R`A képlet: $\int xe^xdx=xe^x-\int 1\cdot e^xdx=xe^x-e^x+C$.`,
            R`Kiemelve: $(x-1)e^x+C$. Ellenőrzés: $(xe^x-e^x)'=e^x+xe^x-e^x=xe^x$.`
          ],
          answer: R`$(x-1)e^x+C$`
        }),
        MB.example({
          title: 'Logaritmus integrálja',
          problem: R`Számítsuk ki: $\displaystyle\int \ln x\,dx$.`,
          steps: [
            R`Írjuk fel szorzatként: $\ln x=\ln x\cdot 1$. Legyen $f=\ln x$, $g'=1$.`,
            R`Ekkor $f'=\frac1x$ és $g=x$.`,
            R`$\int\ln x\,dx=x\ln x-\int x\cdot\frac1x\,dx=x\ln x-\int 1\,dx$.`,
            R`Tehát $x\ln x-x+C=x(\ln x-1)+C$, értelmezve $x>0$-ra.`
          ],
          answer: R`$x\ln x-x+C$`
        }),
        MB.example({
          title: 'Egyszerű parciális törtek',
          problem: R`Számítsuk ki: $\displaystyle\int\frac{dx}{x^2-1}$.`,
          steps: [
            R`A nevező szorzattá alakítható: $x^2-1=(x-1)(x+1)$.`,
            R`Keressük a felbontást: $\frac{1}{(x-1)(x+1)}=\frac{A}{x-1}+\frac{B}{x+1}$.`,
            R`Közös nevező után $1=A(x+1)+B(x-1)$. Az $x=1$ helyen $1=2A$, tehát $A=\frac12$; az $x=-1$ helyen $1=-2B$, tehát $B=-\frac12$.`,
            R`Tehát $\int\left(\frac{1/2}{x-1}-\frac{1/2}{x+1}\right)dx=\frac12\ln|x-1|-\frac12\ln|x+1|+C$.`,
            R`Összevonva: $\frac12\ln\left|\frac{x-1}{x+1}\right|+C$.`
          ],
          answer: R`$\dfrac12\ln\left|\dfrac{x-1}{x+1}\right|+C$`
        }),
        MB.example({
          title: 'Nem valódi tört felbontása',
          problem: R`Számítsuk ki: $\displaystyle\int\frac{x+1}{x^2-3x+2}\,dx$.`,
          steps: [
            R`A nevező: $x^2-3x+2=(x-1)(x-2)$. A számláló foka kisebb, tehát valódi tört.`,
            R`$\frac{x+1}{(x-1)(x-2)}=\frac{A}{x-1}+\frac{B}{x-2}$, azaz $x+1=A(x-2)+B(x-1)$.`,
            R`$x=1$-nél $2=-A$, tehát $A=-2$; $x=2$-nél $3=B$, tehát $B=3$.`,
            R`Az integrál: $-2\ln|x-1|+3\ln|x-2|+C$.`,
            R`Ellenőrzés deriválással: $-\frac{2}{x-1}+\frac{3}{x-2}=\frac{-2(x-2)+3(x-1)}{(x-1)(x-2)}=\frac{x+1}{x^2-3x+2}$.`
          ],
          answer: R`$3\ln|x-2|-2\ln|x-1|+C$`
        })
      ],
      mistakes: [
        R`Rossz $u$ választás: $\int x\ln x\,dx$-nél $u=x$-et venni a logaritmus helyett — így bonyolultabb integrál jön ki.`,
        R`A parciális integrálásnál a mínuszjel elhagyása: $\int fg'=fg-\int f'g$, nem $fg+\int f'g$.`,
        R`Nem valódi törtnél elfelejtett polinomosztás: $\frac{x^2}{x+1}$-et közvetlenül próbáljuk bontani.`,
        R`A felbonthatatlan másodfokú tényezőhöz konstans számlálót írni $Cx+D$ helyett.`
      ],
      exercises: [
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\int x\cos x\,dx$. (A $+C$-t ne írd be.)`, a: 'x*sin(x)+cos(x)', alt: ['xsinx+cosx', 'x sin(x) + cos(x)'], type: 'expr', hint: R`$f=x$, $g'=\cos x$; a polinom deriválással elfogy.`, sol: R`$x\sin x-\int\sin x\,dx=x\sin x+\cos x+C$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\int x\ln x\,dx$ ($x>0$). (A $+C$-t ne írd be.)`, a: 'x^2*ln(x)/2-x^2/4', alt: ['(x^2/2)lnx-x^2/4', 'x^2ln(x)/2 - x^2/4'], type: 'expr', hint: R`$f=\ln x$, $g'=x$.`, sol: R`$\frac{x^2}{2}\ln x-\int\frac{x^2}{2}\cdot\frac1x dx=\frac{x^2}{2}\ln x-\frac{x^2}{4}+C$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\int\frac{dx}{x^2+9}$. Add meg a primitív függvényt.`, a: 'arctan(x/3)/3', alt: ['(1/3)arctan(x/3)', 'atan(x/3)/3'], type: 'text', hint: R`$a=3$: $\int\frac{dx}{x^2+a^2}=\frac1a\arctan\frac xa$.`, sol: R`$\frac13\arctan\frac{x}{3}+C$. Ellenőrzés: deriváltja $\frac13\cdot\frac{1/3}{1+(x/3)^2}=\frac{1}{x^2+9}$.` }),
        MB.q({ level: 3, q: R`Számítsd ki: $\displaystyle\int x^2e^x\,dx$. (A $+C$-t ne írd be.)`, a: '(x^2-2x+2)*e^x', alt: ['(x^2-2x+2)e^x', 'e^x(x^2-2x+2)'], type: 'expr', hint: R`Kétszer integrálj parciálisan, mindig a polinomot deriválva.`, sol: R`Először $x^2e^x-2\int xe^xdx$, majd $\int xe^xdx=(x-1)e^x$, tehát $x^2e^x-2(x-1)e^x=(x^2-2x+2)e^x+C$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\int\frac{2x+3}{x^2+3x+2}\,dx$. Add meg a primitív függvényt.`, a: 'ln|x+1|+ln|x+2|', alt: ['ln|x^2+3x+2|', 'ln(abs(x+1))+ln(abs(x+2))'], type: 'text', hint: R`A nevező $(x+1)(x+2)$; a felbontás $\frac{1}{x+1}+\frac{1}{x+2}$.`, sol: R`$\frac{2x+3}{(x+1)(x+2)}=\frac{1}{x+1}+\frac{1}{x+2}$, tehát $\ln|x+1|+\ln|x+2|+C=\ln|x^2+3x+2|+C$.` }),
        MB.q({ level: 3, q: R`Számítsd ki: $\displaystyle\int e^x\sin x\,dx$. (A $+C$-t ne írd be.)`, a: 'e^x*(sin(x)-cos(x))/2', alt: ['e^x(sinx-cosx)/2', 'exp(x)*(sin(x)-cos(x))/2'], type: 'expr', hint: R`Kétszer parciálisan integrálva az eredeti integrál újra megjelenik; rendezd ki.`, sol: R`Kétszeri parciális integrálás után $I=e^x\sin x-e^x\cos x-I$, tehát $2I=e^x(\sin x-\cos x)$, azaz $I=\frac{e^x(\sin x-\cos x)}{2}+C$.` }),
        MB.q({ level: 3, q: R`Számítsd ki: $\displaystyle\int\frac{dx}{x^2-4}$. Add meg a primitív függvényt.`, a: '(1/4)ln|(x-2)/(x+2)|', alt: ['ln|x-2|/4-ln|x+2|/4', '0.25*ln|(x-2)/(x+2)|'], type: 'text', hint: R`$a=2$, és $x^2-4=(x-2)(x+2)$.`, sol: R`$\frac{1}{x^2-4}=\frac14\left(\frac{1}{x-2}-\frac{1}{x+2}\right)$, tehát $\frac14\ln\left|\frac{x-2}{x+2}\right|+C$.` }),
        MB.q({ level: 3, type: 'proof', q: R`Vezesd le a parciális integrálás képletét a szorzat deriválási szabályából.`, hint: R`Indulj ki $(fg)'=f'g+fg'$-ből, és integrálj mindkét oldalon.`, sol: R`A szorzat deriválási szabálya: $(fg)'=f'g+fg'$. Mindkét oldalt integrálva $fg=\int f'g\,dx+\int fg'\,dx$ (a konstansot a végén írjuk ki). Átrendezve $\int fg'\,dx=fg-\int f'g\,dx$, ami éppen a parciális integrálás képlete.` })
      ],
      video: { list: 'PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr', title: 'Essence of calculus', channel: '3Blue1Brown', kind: 'LEJÁTSZÁSI LISTA' }
    },
    {
      id: 'integral-hatarozott', num: '7.3', title: 'Határozott integrál, terület, térfogat, improprius', minutes: 32,
      lead: 'A határozott integrál egy szám: előjeles terület. Ebből lesz a területszámítás, a forgástest térfogata és a végtelenbe nyúló tartományok kezelése — mindhárom ugyanazon a határérték-ötleten alapul.',
      why: [
        'A határozott integrált a terület közelítésével definiáljuk: az $[a,b]$ intervallumot felosztjuk, minden darabon egy téglalappal közelítünk, és a felosztást finomítjuk. A részletösszegek határértéke az integrál. Ebből a definícióból azonnal látszik, hogy az integrál előjeles terület: a tengely alatti rész negatív előjellel számít. Ezért a „terület” szó használatakor mindig ellenőrizni kell, hol van a függvény a tengely felett.',
        R`A Newton–Leibniz-tétel az, ami a definíciót használhatóvá teszi: eszerint $\int_a^b f=F(b)-F(a)$ bármely primitív függvénnyel. Nem kell téglalapokat összegezni, elég egy primitív függvény. Ez az összefüggés egyben azt is megmutatja, miért ugyanaz a terület és az antiderivált: a felhalmozódási függvény $A(x)=\int_a^xf$ deriváltja $f(x)$.`
      ],
      when: 'Területszámításnál (két görbe között is), forgástest térfogatánál, valószínűségszámításban (sűrűségfüggvény), fizikában (munka, út) és improprius integráloknál. Vizsgán a tipikus hibák: a terület előjelének figyelmen kívül hagyása, a szakadási ponton való átintegrálás, és a végtelen határérték „behelyettesítése”.',
      theory: [
        MB.def('Határozott integrál', R`Az $f$ függvény $[a,b]$ feletti határozott integrálja $\int_a^b f(x)\,dx$ a közelítő összegek határértéke, amikor a felosztás finomsága nullához tart. Szemléletesen: az $f$ grafikonja és az $x$-tengely közötti előjeles terület, ahol a tengely alatti rész negatív.`),
        MB.thm('Newton–Leibniz-tétel', R`Ha $f$ folytonos $[a,b]$-n és $F$ primitív függvénye, akkor
\int_a^b f(x)\,dx=F(b)-F(a).`, 'A konstans kiesik, ezért határozott integrálnál nem kell $+C$-t írni.'),
        MB.formula('Tulajdonságok', R`\begin{aligned}
\int_a^b \big(\alpha f+\beta g\big)&=\alpha\int_a^b f+\beta\int_a^b g,\\
\int_a^b f&=\int_a^c f+\int_c^b f,\\
\int_a^a f&=0,\qquad \int_a^b f=-\int_b^a f.
\end{aligned}`, 'A második tulajdonság (intervallum felbontása) akkor létfontosságú, ha a függvény a szakaszon belül előjelet vált vagy szakad.'),
        MB.formula('Terület két görbe között', R`A=\int_a^b\big|f(x)-g(x)\big|\,dx.`, 'Ha a két görbe a vizsgált intervallumon belül többször metszi egymást, a metszéspontoknál fel kell bontani az integrált, és a felső függvényt darabonként kell megkeresni. Lépések: rajzold fel a görbéket és keresd meg a metszéspontokat; döntsd el, melyik intervallumon melyik függvény van felül; a különbséget integráld; területnél az eredmény nemnegatív, tehát ha negatív jött ki, valószínűleg felcserélted a sorrendet.'),
        MB.formula('Forgástest térfogata', R`V=\pi\int_a^b f(x)^2\,dx,`),
        MB.def('Improprius integrál', R`Végtelen intervallumon: $\int_a^\infty f=\lim_{b\to\infty}\int_a^b f$, ha a határérték létezik és véges; ekkor az integrál konvergens. Szakadás esetén: ha $f$ az $a$-ban nem folytonos, $\int_a^b f=\lim_{c\to a+}\int_c^b f$. Ha a határérték nem létezik vagy végtelen, az integrál divergens.`),
        MB.thm('A $p$-integrál', R`\int_1^\infty\frac{dx}{x^p}\ \text{konvergens}\iff p>1,\qquad \int_0^1\frac{dx}{x^p}\ \text{konvergens}\iff p<1.`, 'Konvergens esetben $\int_1^\infty x^{-p}dx=\frac{1}{p-1}$, illetve $\int_0^1x^{-p}dx=\frac{1}{1-p}$. A $p=1$ mindkét esetben a határeset: $\int_1^\infty \frac{dx}{x}$ és $\int_0^1\frac{dx}{x}$ is divergens.'),
        MB.warn('Miért nem szabad „behelyettesíteni a végtelent”?', R`A $\int_1^\infty x^{-2}dx$ esetén a helyes út: $\lim_{b\to\infty}\left[-\frac1x\right]_1^b=\lim_{b\to\infty}\left(1-\frac1b\right)=1$. A $\infty$ nem szám, ezért $\left[-\frac1x\right]_1^\infty$ önmagában értelmetlen írásmód. Ugyanígy, ha az integrandus a szakasz belsejében szakad, az integrált fel kell bontani a szakadási pontnál, különben hibás eredményt kapunk.`)
      ],
      examples: [
        MB.example({
          title: 'Alapintegrál Newton–Leibnizzel',
          problem: R`Számítsuk ki: $\displaystyle\int_0^{\pi}\sin x\,dx$.`,
          steps: [
            R`Primitív függvény: $-\cos x$.`,
            R`Newton–Leibniz: $\big[-\cos x\big]_0^{\pi}=-\cos\pi-(-\cos 0)$.`,
            R`$\cos\pi=-1$, $\cos 0=1$, tehát $1+1=2$.`,
            R`Szemléletesen: a $\sin$ grafikonja alatti terület a $[0,\pi]$ intervallumon valóban 2.`
          ],
          answer: R`$2$`
        }),
        MB.example({
          title: 'Terület két görbe között',
          problem: R`Határozzuk meg az $y=x^2$ parabola és az $y=x$ egyenes közötti területet.`,
          steps: [
            R`Metszéspontok: $x^2=x$, azaz $x(x-1)=0$, tehát $x=0$ és $x=1$.`,
            R`A $[0,1]$ intervallumon $x\ge x^2$, mert például $x=\frac12$-nél $\frac12>\frac14$.`,
            R`A terület: $\int_0^1(x-x^2)\,dx=\left[\frac{x^2}{2}-\frac{x^3}{3}\right]_0^1$.`,
            R`Behelyettesítve: $\frac12-\frac13=\frac16$.`
          ],
          answer: R`$\dfrac16$`
        }),
        MB.example({
          title: 'Forgástest térfogata',
          problem: R`Forgassuk meg az $y=x^2$ görbét az $x$-tengely körül az $[0,1]$ intervallumon. Mekkora a keletkező test térfogata?`,
          steps: [
            R`A forgatásnál keletkező szelet sugara $f(x)=x^2$, ezért a térfogatelem $\pi f(x)^2dx$.`,
            R`$V=\pi\int_0^1 (x^2)^2\,dx=\pi\int_0^1 x^4\,dx$.`,
            R`$\int_0^1 x^4dx=\left[\frac{x^5}{5}\right]_0^1=\frac15$.`,
            R`Tehát $V=\frac{\pi}{5}$.`
          ],
          answer: R`$V=\dfrac{\pi}{5}$`
        }),
        MB.example({
          title: 'Improprius integrál kiszámítása',
          problem: R`Számítsuk ki: $\displaystyle\int_1^\infty\frac{dx}{x^2}$.`,
          steps: [
            R`Definíció szerint: $\lim_{b\to\infty}\int_1^b x^{-2}\,dx$.`,
            R`Primitív függvény: $-x^{-1}=-\frac1x$.`,
            R`$\int_1^b x^{-2}dx=\left[-\frac1x\right]_1^b=-\frac1b+1$.`,
            R`Határérték: $\lim_{b\to\infty}\left(1-\frac1b\right)=1$, tehát az integrál konvergens és értéke 1.`
          ],
          answer: R`$1$`
        })
      ],
      mistakes: [
        R`A tengely alatti területet negatív előjellel vesszük, és negatív területet adunk meg; területnél abszolútérték vagy intervallumfelbontás kell.`,
        R`A végtelen határértéket egyszerűen behelyettesítjük a primitív függvénybe, határérték nélkül.`,
        R`Szakadási ponton átintegrálunk: $\int_{-1}^1\frac{dx}{x^2}$ nem $[-1/x]_{-1}^1=-2$, mert az integrandus 0-ban nem folytonos.`,
        R`Forgástestnél a sugarat nem négyzetre emeljük: $V=\pi\int f\,dx$ helyett $V=\pi\int f^2dx$.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Számítsd ki: $\displaystyle\int_0^1 x^2\,dx$.`, a: '1/3', type: 'number', hint: R`Primitív függvény: $x^3/3$.`, sol: R`$\left[\frac{x^3}{3}\right]_0^1=\frac13$.` }),
        MB.q({ level: 1, q: R`Számítsd ki: $\displaystyle\int_0^{\pi/2}\cos x\,dx$.`, a: '1', type: 'number', hint: R`A $\cos$ primitív függvénye $\sin$.`, sol: R`$\big[\sin x\big]_0^{\pi/2}=\sin\frac{\pi}{2}-\sin0=1$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\int_{-1}^{1}x^3\,dx$.`, a: '0', type: 'number', hint: R`Páratlan függvény szimmetrikus intervallumon.`, sol: R`$\left[\frac{x^4}{4}\right]_{-1}^1=\frac14-\frac14=0$. Páratlan integrandus szimmetrikus intervallumon: az előjeles területek kioltják egymást.` }),
        MB.q({ level: 2, q: R`Mekkora az $y=x^2$ és $y=x$ görbék közötti terület?`, a: '1/6', type: 'number', hint: R`Metszéspontok: $x=0$ és $x=1$.`, sol: R`$\int_0^1(x-x^2)dx=\frac12-\frac13=\frac16$.` }),
        MB.q({ level: 2, q: R`Az $y=\sqrt{x}$ görbét az $x$-tengely körül forgatjuk a $[0,1]$ intervallumon. Mennyi a térfogat?`, a: 'pi/2', alt: ['π/2', '1.5707963'], type: 'expr', hint: R`$V=\pi\int_0^1(\sqrt x)^2dx=\pi\int_0^1 x\,dx$.`, sol: R`$V=\pi\left[\frac{x^2}{2}\right]_0^1=\frac{\pi}{2}$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\int_0^\infty e^{-x}\,dx$.`, a: '1', type: 'number', hint: R`$\lim_{b\to\infty}\big[-e^{-x}\big]_0^b$.`, sol: R`$\int_0^b e^{-x}dx=1-e^{-b}\to1$, tehát az integrál konvergens, értéke 1.` }),
        MB.q({ level: 2, q: R`Konvergens vagy divergens: $\displaystyle\int_1^\infty\frac{dx}{x}$?`, type: 'choice', choices: ['Konvergens', 'Divergens'], a: '1', sol: R`$\int_1^b\frac{dx}{x}=\ln b\to\infty$, tehát divergens. Ez a $p=1$ határeset.` }),
        MB.q({ level: 3, type: 'proof', q: R`Bizonyítsd be, hogy $\displaystyle\int_0^1 x^{-p}\,dx$ pontosan akkor konvergens, ha $p<1$.`, hint: R`Külön vizsgáld a $p=1$ és a $p\neq1$ esetet, és számítsd ki a $\lim_{c\to0+}\int_c^1x^{-p}dx$ határértéket.`, sol: R`Ha $p\neq1$: $\int_c^1x^{-p}dx=\left[\frac{x^{1-p}}{1-p}\right]_c^1=\frac{1}{1-p}-\frac{c^{1-p}}{1-p}$. Ha $p<1$, akkor $1-p>0$, ezért $c^{1-p}\to0$, és a határérték $\frac{1}{1-p}$ véges: konvergens. Ha $p>1$, akkor $1-p<0$, ezért $c^{1-p}\to\infty$: divergens. Ha $p=1$: $\int_c^1\frac{dx}{x}=-\ln c\to\infty$: divergens. Tehát pontosan $p<1$ esetén konvergens.` })
      ],
      video: { list: 'PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr', title: 'Essence of calculus', channel: '3Blue1Brown', kind: 'LEJÁTSZÁSI LISTA' }
    }
  ]
});
