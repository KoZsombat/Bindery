var R = String.raw;
MB.section({
  id: 'taylor', num: '09', title: 'Hatványsorok és Taylor-sorok', subtitle: 'Függvények végtelen polinomjai',
  examTag: 'Analízis 2',
  intro: 'A Taylor-sor válasz arra a kérdésre, hogy egy sima függvény mennyire viselkedik polinomként. Az ötlet egyszerű: illesszünk egy polinomot a függvényhez úgy, hogy a deriváltjai is megegyezzenek. Minél több deriváltat illesztünk, annál nagyobb környezetben lesz jó a közelítés. A fejezet két dolgot tanít meg: hogyan írjuk fel a Taylor-polinomot és a maradéktagot, és hogyan lesz ebből végtelen sor — a konvergenciasugárral és a nevezetes sorokkal együtt.',
  chapters: [
    {
      id: 'taylor-polinom', num: '9.1', title: 'Taylor-polinom, maradéktag', minutes: 32,
      lead: 'A Taylor-polinom az a legfeljebb $n$-edfokú polinom, amelynek az $a$ pontban az első $n$ deriváltja megegyezik a függvényével. A maradéktag megmondja, mekkora hibát követünk el, ha a függvényt ezzel helyettesítjük.',
      why: [
        R`Ha egy polinomot akarunk illeszteni egy függvényhez az $a$ pontban, a legtermészetesebb követelmény, hogy a helyettesítési érték és a deriváltak is egyezzenek. Egy legfeljebb $n$-edfokú polinomnak $n+1$ szabad együtthatója van, és éppen $n+1$ feltételünk van: $T(a)=f(a)$, $T'(a)=f'(a)$, ..., $T^{(n)}(a)=f^{(n)}(a)$. Ez a rendszer egyértelműen megoldható, és az eredmény $T_n(x)=\sum_{k=0}^{n}\frac{f^{(k)}(a)}{k!}(x-a)^k$. A $k!$ azért jelenik meg, mert a $k$-adik hatvány $k$-szori deriválása $k!$-t hoz ki.`,
        R`A maradéktag nem elhanyagolható díszítés: ez adja a közelítés jogosságát. A Lagrange-alak szerint $R_n(x)=\frac{f^{(n+1)}(\xi)}{(n+1)!}(x-a)^{n+1}$ valamely $\xi$ pontra $a$ és $x$ között. Mivel $\xi$ pontos helyét nem ismerjük, a gyakorlatban felülről becsüljük: ha $|f^{(n+1)}|\le M$ az adott intervallumon, akkor $|R_n(x)|\le\frac{M}{(n+1)!}|x-a|^{n+1}$. Ez a becslés a vizsgán önálló feladat szokott lenni.`
      ],
      when: R`Határérték-számításnál ($\frac{\sin x-x}{x^3}$ típusú), közelítő számításnál (pl. $e^{0.1}$, $\sqrt{1{,}1}$), és minden olyan esetben, amikor egy függvényt lokálisan polinommal kell helyettesíteni. Az $n=1$ eset az érintőegyenes, az $n=2$ eset az érintőparabola — ezek adják a linearizálás és a másodrendű közelítés képleteit. A hiba nagysága mindig az $|x-a|$ távolságtól és a derivált korlátjától függ.`,
      theory: [
        MB.def('Taylor-polinom', R`Az $f$ függvény $a$ pont körüli $n$-edfokú Taylor-polinomja
T_n(x)=\sum_{k=0}^{n}\frac{f^{(k)}(a)}{k!}(x-a)^k.`),
        MB.note('Honnan jönnek az együtthatók?', R`Írjuk fel a polinomot $T_n(x)=c_0+c_1(x-a)+\cdots+c_n(x-a)^n$ alakban. Az $x=a$ helyen $T_n(a)=c_0$, tehát $c_0=f(a)$. Deriválva $T_n'(x)=c_1+2c_2(x-a)+\cdots$, így $T_n'(a)=c_1=f'(a)$. A $k$-adik deriváltnál a $k$-adik tag $k!c_k$-t ad, a többi tag eltűnik, ezért $c_k=\frac{f^{(k)}(a)}{k!}$. Ez a levezetés egyben az egyértelműséget is mutatja.`),
        MB.formula('Taylor-polinom felírása', R`T_n(x)=f(a)+f'(a)(x-a)+\frac{f''(a)}{2!}(x-a)^2+\cdots+\frac{f^{(n)}(a)}{n!}(x-a)^n.`, 'Az $a=0$ esetet Maclaurin-polinomnak nevezzük. Az $n=1$ eset az érintőegyenes egyenlete.'),
        MB.thm('Taylor-tétel Lagrange-maradékkal', R`Ha $f$ az $a$ környezetében $n+1$-szer differenciálható, akkor
f(x)=T_n(x)+R_n(x),\qquad R_n(x)=\frac{f^{(n+1)}(\xi)}{(n+1)!}(x-a)^{n+1},`),
        MB.note('Hogyan becsülünk a gyakorlatban?', R`A $\xi$ ismeretlen, ezért a deriváltra kell felső korlátot adni az $a$ és $x$ közötti intervallumon: ha $|f^{(n+1)}(t)|\le M$ minden szóba jövő $t$-re, akkor $|R_n(x)|\le\frac{M}{(n+1)!}|x-a|^{n+1}$. A számítás menete: (1) írd fel $T_n$-et; (2) becsüld a megfelelő deriváltat az intervallumon; (3) helyettesítsd a képletbe.`),
        MB.warn('A hiba nem automatikusan kicsi', R`A Taylor-polinom csak az $a$ pont környezetében jó. Ha $|x-a|$ nagy, a $(x-a)^{n+1}$ tényező miatt a hiba nőhet, sőt a végtelen Taylor-sor is divergálhat. Például a $\ln(1+x)$ sora $x>1$-re divergál. A konvergenciasugár nem díszítés: ezen kívül a sor nem írja le a függvényt.`),
        MB.list('Gyors ellenőrzések', [
          R`$T_n(a)=f(a)$, és $T_n^{(k)}(a)=f^{(k)}(a)$ minden $k\le n$-re.`,
          R`$T_n$ foka legfeljebb $n$; ha $f$ maga polinom $n$-edfokú, akkor $T_n=f$ pontosan.`,
          R`$n=1$-nél az érintőegyenes: $f(a)+f'(a)(x-a)$.`,
          R`Páros függvénynél a Maclaurin-polinom csak páros kitevőket tartalmaz, páratlannál csak páratlanokat.`
        ])
      ],
      examples: [
        MB.example({
          title: 'Az exponenciális függvény',
          problem: R`Írjuk fel az $f(x)=e^x$ függvény $a=0$ körüli Taylor-polinomját általános $n$-re.`,
          steps: [
            R`Minden derivált $e^x$, és $e^0=1$, tehát $f^{(k)}(0)=1$ minden $k$-ra.`,
            R`Behelyettesítve: $T_n(x)=1+x+\frac{x^2}{2!}+\frac{x^3}{3!}+\cdots+\frac{x^n}{n!}$.`,
            R`A maradék: $R_n(x)=\frac{e^{\xi}}{(n+1)!}x^{n+1}$ valamely $\xi$ pontra $0$ és $x$ között.`,
            R`Mivel $e^\xi$ korlátos az adott intervallumon, a maradék minden rögzített $x$-re nullához tart, ha $n\to\infty$.`
          ],
          answer: R`$T_n(x)=\sum_{k=0}^{n}\dfrac{x^k}{k!}$`
        }),
        MB.example({
          title: 'A szinusz függvény',
          problem: R`Írjuk fel a $\sin x$ Maclaurin-polinomját $n=5$-ig.`,
          steps: [
            R`A deriváltak ciklikusak: $\sin x$, $\cos x$, $-\sin x$, $-\cos x$. A nullában: $0,1,0,-1,0,1,\dots$`,
            R`Csak a páratlan kitevőjű tagok maradnak meg, váltakozó előjellel.`,
            R`$T_3(x)=x-\frac{x^3}{3!}$, majd $T_5(x)=x-\frac{x^3}{3!}+\frac{x^5}{5!}$.`,
            R`Tehát $T_5(x)=x-\frac{x^3}{6}+\frac{x^5}{120}$. A következő nem nulla tag a $-\frac{x^7}{5040}$.`
          ],
          answer: R`$T_5(x)=x-\dfrac{x^3}{6}+\dfrac{x^5}{120}$`
        }),
        MB.example({
          title: '$e^{0.1}$ közelítése',
          problem: R`Becsüljük meg $e^{0.1}$-et a másodfokú Maclaurin-polinommal.`,
          steps: [
            R`$T_2(x)=1+x+\frac{x^2}{2}$.`,
            R`$x=0{,}1$ behelyettesítve: $1+0{,}1+0{,}005=1{,}105$.`,
            R`A tényleges érték $e^{0{,}1}\approx1{,}10517$, tehát a közelítés nagyon jó.`,
            R`A hiba nagyságrendje: $\frac{e^{0{,}1}\cdot0{,}1^3}{6}\approx1{,}8\cdot10^{-4}$.`
          ],
          answer: R`$e^{0{,}1}\approx1{,}105$`
        }),
        MB.example({
          title: 'Hibabecslés Lagrange-maradékkal',
          problem: R`Becsüljük felül a $|e^{0{,}1}-T_2(0{,}1)|$ hibát úgy, hogy $e^{\xi}\le3$ adott korlát.`,
          steps: [
            R`A maradék képlete $n=2$-re: $R_2(x)=\frac{e^{\xi}}{3!}x^3$ valamely $0<\xi<0{,}1$-re.`,
            R`Felhasználjuk, hogy $e^{\xi}\le3$ ezen az intervallumon.`,
            R`$|R_2(0{,}1)|\le\frac{3}{6}\cdot0{,}001=0{,}0005$.`,
            R`Tehát a hiba legfeljebb $5\cdot10^{-4}$, ami összhangban van a valódi $1{,}7\cdot10^{-4}$ hibával.`
          ],
          answer: R`$|R_2(0{,}1)|\le0{,}0005$`
        })
      ],
      mistakes: [
        R`A faktoriális elhagyása a nevezőből: a tag $\frac{f^{(k)}(a)}{k!}x^k$, nem $f^{(k)}(a)x^k$.`,
        R`A maradéktagban $n+1$ helyett $n$-nel számolni: az $n$-edfokú polinom hibája az $(n+1)$-edik deriválttól függ.`,
        R`A hibabecslésnél a derivált maximumát nem az adott intervallumon venni, hanem az $a$ pontban.`,
        R`Nagy $|x-a|$ esetén is azt hinni, hogy a polinom jó közelítés — a Taylor-sor csak a konvergenciatartományban írja le a függvényt.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Írd fel a $\cos x$ másodfokú Maclaurin-polinomját.`, a: '1-x^2/2', alt: ['1-x^2/2!', '1 - x^2/2'], type: 'expr', hint: R`$\cos0=1$, $\cos'0=0$, $\cos''0=-1$.`, sol: R`$T_2(x)=1-\frac{x^2}{2!}=1-\frac{x^2}{2}$.` }),
        MB.q({ level: 1, q: R`Írd fel az $e^x$ harmadfokú Maclaurin-polinomját.`, a: '1+x+x^2/2+x^3/6', alt: ['1+x+x^2/2!+x^3/3!', '1 + x + x^2/2 + x^3/6'], type: 'expr', hint: R`Minden derivált 1 a nullában.`, sol: R`$T_3(x)=1+x+\frac{x^2}{2}+\frac{x^3}{6}$.` }),
        MB.q({ level: 2, q: R`Közelítsd $e^{0{,}1}$-et a másodfokú Maclaurin-polinommal.`, a: '1.105', type: 'number', hint: R`$1+x+\frac{x^2}{2}$, $x=0{,}1$.`, sol: R`$1+0{,}1+0{,}005=1{,}105$.` }),
        MB.q({ level: 2, q: R`Becsüld felül a fenti közelítés hibáját Lagrange-maradékkal, ha $e^{\xi}\le3$.`, a: '0.0005', alt: ['1/2000', '5e-4'], type: 'number', hint: R`$\frac{M}{(n+1)!}|x-a|^{n+1}$ $M=3$, $n=2$, $x-a=0{,}1$.`, sol: R`$\frac{3}{6}\cdot0{,}001=0{,}0005$.` }),
        MB.q({ level: 2, q: R`Írd fel az $f(x)=\sqrt x$ függvény $a=1$ körüli másodfokú Taylor-polinomját.`, a: '1+(x-1)/2-(x-1)^2/8', alt: ['1+(x-1)/2-(x-1)^2/8', '1+(x-1)/2-((x-1)^2)/8', '(x-1)^2*(-1)/8+(x-1)/2+1'], type: 'expr', hint: R`$f(1)=1$, $f'(1)=\frac12$, $f''(1)=-\frac14$.`, sol: R`$T_2(x)=1+\frac12(x-1)+\frac{-1/4}{2}(x-1)^2=1+\frac{x-1}{2}-\frac{(x-1)^2}{8}$.` }),
        MB.q({ level: 3, q: R`Közelítsd $\sqrt{1{,}1}$-et az előző másodfokú Taylor-polinommal.`, a: '1.04875', type: 'number', hint: R`$x-1=0{,}1$: $1+0{,}05-0{,}00125$.`, sol: R`$1+\frac{0{,}1}{2}-\frac{0{,}01}{8}=1+0{,}05-0{,}00125=1{,}04875$. A tényleges érték $1{,}04881$.` }),
        MB.q({ level: 1, q: R`Mennyi az $x^4$ együtthatója a $\sin x$ Maclaurin-sorában?`, a: '0', type: 'number', hint: R`A szinusz páratlan függvény.`, sol: R`$\sin x=x-\frac{x^3}{6}+\frac{x^5}{120}-\cdots$, csak páratlan kitevők szerepelnek, tehát az $x^4$ együtthatója 0.` }),
        MB.q({ level: 3, type: 'proof', q: R`Bizonyítsd be, hogy a Taylor-polinom egyértelmű: ha egy legfeljebb $n$-edfokú $P$ polinomra $P^{(k)}(a)=f^{(k)}(a)$ minden $k=0,\dots,n$-re, akkor $P=T_n$.`, hint: R`Tekintsd a $P-T_n$ különbséget, és használd, hogy egy $n$-edfokú polinomnak legfeljebb $n$ gyöke van.`, sol: R`Legyen $Q=P-T_n$. Ekkor $Q$ foka legfeljebb $n$, és $Q^{(k)}(a)=0$ minden $k=0,\dots,n$-re. Azt állítjuk, hogy ekkor $Q\equiv0$. Ha $Q$ nem azonosan nulla, akkor $Q$-nak van egy legkisebb $m\le n$ rendű nem nulla deriváltja az $a$-ban. Ekkor $Q^{(m)}(a)\neq0$, de $Q^{(m+1)}$-től felfelé minden derivált nulla $a$-ban, tehát $Q^{(m)}$ konstans, mégpedig $Q^{(m)}(a)\neq0$. Ezért $Q^{(m-1)}$ szigorúan monoton, és mivel $Q^{(m-1)}(a)=0$, az $a$ egyszerű gyöke. Folytatva visszafelé, $Q$-nak az $a$ pontosan $m$-szeres gyöke, és $Q(x)=(x-a)^m R(x)$ valamilyen $R$ polinomra, ahol $R(a)\neq0$. Mivel $\deg Q\le n$, ezért $\deg R\le n-m$. Viszont $Q^{(k)}(a)=0$ minden $k\le n$-re, ami azt jelenti, hogy $Q$-nak az $a$ legalább $n+1$-szeres gyöke, ami $n$-edfokú polinomnál csak $Q\equiv0$ esetén lehet. Ellenmondás, tehát $Q\equiv0$, azaz $P=T_n$.` })
      ],
      video: { list: 'PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr', title: 'Essence of calculus', channel: '3Blue1Brown', kind: 'LEJÁTSZÁSI LISTA' }
    },
    {
      id: 'taylor-sorok', num: '9.2', title: 'Nevezetes sorok, binomiális sor', minutes: 34,
      lead: 'Ha a Taylor-polinom fokszámát növeljük, a határértékben hatványsort kapunk. Ennek van konvergenciasugara, és a sugáron belül a sor magát a függvényt állítja elő.',
      why: [
        R`A hatványsor $\sum c_n(x-a)^n$ alakú függvénysor. Minden ilyen sornak van egy $R$ konvergenciasugara: $|x-a|<R$ esetén a sor abszolút konvergens, $|x-a|>R$ esetén divergens, és $|x-a|=R$ esetén külön kell vizsgálni. A sugarat a Cauchy–Hadamard-képlet vagy — ha a hányados létezik — az együtthatók arányának határértéke adja. Ez azért fontos, mert a Taylor-sor csak a konvergenciatartományban egyenlő a függvénnyel.`,
        R`A nevezetes sorok nem külön-külön megjegyzendő képletek, hanem egymásból származnak. A mértani sor $\frac{1}{1-x}=\sum x^n$ az alap. Ezt tagonként integrálva kapjuk a $-\ln(1-x)$ sort, $x$ helyett $-x$-et írva a $\ln(1+x)$ sort. Az $\frac{1}{1+x^2}$ sorból integrálással az $\arctan$ sora jön. A binomiális sor pedig a Taylor-együtthatók közvetlen kiszámításából adódik. Ha ezt a néhány kapcsolatot látod, a táblázatot nem kell magolnod.`,
      ],
      when: 'Határértékek kiszámításánál (Taylor-sorral sokkal gyorsabb, mint L’Hôpital-lal), integrálok közelítésénél, differenciálegyenletek sorfejtéses megoldásánál és numerikus módszereknél. Vizsgán tipikus feladat a konvergenciasugár meghatározása, egy sorfejtés felírása, és a végpontok külön vizsgálata. Arra mindig figyelj, hogy a képlet érvényességi tartományát is megadd.',
      theory: [
        MB.def('Hatványsor és konvergenciasugár', R`A $\sum_{n=0}^{\infty}c_n(x-a)^n$ hatványsorhoz egyértelműen tartozik egy $R\in[0,\infty]$ szám, a konvergenciasugár, amelyre $|x-a|<R$ esetén a sor abszolút konvergens, $|x-a|>R$ esetén divergens. A nyílt intervallum $(a-R,a+R)$ a konvergenciaintervallum belseje; a végpontokat külön kell vizsgálni.`),
        MB.thm('A sugár kiszámítása', R`Ha $c_n\neq0$ és a $\left|\dfrac{c_n}{c_{n+1}}\right|$ hányadosnak van határértéke, akkor
R=\lim_{n\to\infty}\left|\frac{c_n}{c_{n+1}}\right|.`),
        MB.thm('Tagonkénti deriválás és integrálás', R`A hatványsor a konvergenciaintervallum belsejében tagonként deriválható és integrálható, és a sugár nem változik:
\left(\sum c_n(x-a)^n\right)'=\sum n\,c_n(x-a)^{n-1}.`, 'A végpontokon a viselkedés megváltozhat, ezért ott külön vizsgálat kell.'),
        MB.formula('Nevezetes sorok', R`\begin{array}{ll}
e^x=\displaystyle\sum_{n=0}^{\infty}\frac{x^n}{n!}, & |x|<\infty\\[8pt]
\sin x=\displaystyle\sum_{n=0}^{\infty}\frac{(-1)^nx^{2n+1}}{(2n+1)!}, & |x|<\infty\\[8pt]
\cos x=\displaystyle\sum_{n=0}^{\infty}\frac{(-1)^nx^{2n}}{(2n)!}, & |x|<\infty\\[8pt]
\ln(1+x)=\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n+1}x^n}{n}, & -1<x\le1\\[8pt]
\arctan x=\displaystyle\sum_{n=0}^{\infty}\frac{(-1)^nx^{2n+1}}{2n+1}, & |x|\le1\\[8pt]
\frac{1}{1-x}=\displaystyle\sum_{n=0}^{\infty}x^n, & |x|<1
\end{array}`),
        MB.thm('Binomiális sor', R`(1+x)^{\alpha}=\sum_{k=0}^{\infty}\binom{\alpha}{k}x^k,\qquad \binom{\alpha}{k}=\frac{\alpha(\alpha-1)\cdots(\alpha-k+1)}{k!},`),
        MB.note('Hogyan kapunk új sort a régiből?', R`A $\frac{1}{1+t}=\sum(-1)^nt^n$ mértani sorból $t=x^2$-et írva $\frac{1}{1+x^2}$ sora adódik, ezt tagonként integrálva pedig $\arctan x=x-\frac{x^3}{3}+\frac{x^5}{5}-\cdots$. Hasonlóan, $\frac{1}{1+t}$ integrálja $-\ln(1-t)$, ahonnan $\ln(1+x)$ sora jön. A mértani sor deriválásával $\frac{1}{(1-x)^2}=\sum (n+1)x^n$ adódik.`),
        MB.warn('A végpontok külön eset', R`A sugár csak a nyílt intervallumot adja meg. A $\ln(1+x)$ sor $x=1$-nél konvergens (összege $\ln2$), $x=-1$-nél divergens (harmonikus sor). Az $\arctan$ sora mindkét végponton konvergens (Leibniz), és $x=1$-nél $\frac{\pi}{4}$-et ad. A $\sum\frac{x^n}{n^2}$ sor mindkét végponton abszolút konvergens. Ezért a végpontokat mindig be kell helyettesíteni és külön eldönteni.`),
        MB.list('Alkalmazások', [
          R`Határérték: $\frac{\sin x-x}{x^3}\to-\frac16$, mert $\sin x-x=-\frac{x^3}{6}+\cdots$.`,
          R`Közelítő integrálás: a sorfejtést tagonként integrálva jó becslés adható.`,
          R`Határozatlan alakok: a sorfejtés megmutatja, melyik tag dominál.`,
          R`Numerikus érték: $\ln2$, $\pi/4$, $e$ kiszámítása a sorral, hibabecsléssel.`
        ])
      ],
      examples: [
        MB.example({
          title: 'A $\ln(1+x)$ sora',
          problem: R`Vezessük le a $\ln(1+x)$ Maclaurin-sorát, és adjuk meg az érvényességi tartományt.`,
          steps: [
            R`Induljunk ki a mértani sorból: $\frac{1}{1+t}=1-t+t^2-t^3+\cdots$, $|t|<1$.`,
            R`Mindkét oldalt integráljuk $0$-tól $x$-ig: $\ln(1+x)=\int_0^x\frac{dt}{1+t}$.`,
            R`Tagonként integrálva: $\ln(1+x)=x-\frac{x^2}{2}+\frac{x^3}{3}-\frac{x^4}{4}+\cdots$.`,
            R`A sugár $R=1$; az $x=1$ végponton a sor konvergens (Leibniz), összege $\ln2$; az $x=-1$ végponton divergens.`,
            R`Tehát az érvényesség: $-1<x\le1$.`
          ],
          answer: R`$\ln(1+x)=\sum_{n=1}^{\infty}\dfrac{(-1)^{n+1}x^n}{n}$, $-1<x\le1$`
        }),
        MB.example({
          title: R`A binomiális sor $\alpha=\frac12$ esetre`,
          problem: R`Írjuk fel a $\sqrt{1+x}=(1+x)^{1/2}$ Maclaurin-sorának első négy tagját.`,
          steps: [
            R`$\binom{1/2}{0}=1$, $\binom{1/2}{1}=\frac12$.`,
            R`$\binom{1/2}{2}=\frac{(1/2)(-1/2)}{2}=-\frac18$; $\binom{1/2}{3}=\frac{(1/2)(-1/2)(-3/2)}{6}=\frac{1}{16}$.`,
            R`Tehát $\sqrt{1+x}=1+\frac{x}{2}-\frac{x^2}{8}+\frac{x^3}{16}-\cdots$.`,
            R`A konvergenciasugár $R=1$; $x=1$-nél a sor $\sqrt2$-höz tart (abszolút konvergens), $x=-1$-nél divergens.`
          ],
          answer: R`$1+\dfrac{x}{2}-\dfrac{x^2}{8}+\dfrac{x^3}{16}-\cdots$`
        }),
        MB.example({
          title: 'Végtelen konvergenciasugár',
          problem: R`Határozzuk meg a $\sum_{n=0}^{\infty}\frac{x^n}{n!}$ hatványsor konvergenciasugarát.`,
          steps: [
            R`Az együtthatók $c_n=\frac{1}{n!}$.`,
            R`$\left|\frac{c_n}{c_{n+1}}\right|=\frac{(n+1)!}{n!}=n+1\to\infty$.`,
            R`Tehát $R=\infty$: a sor minden valós $x$-re konvergens.`,
            R`Az összeg $e^x$, amit a Taylor-tétel maradéktagjának becslése igazol.`
          ],
          answer: R`$R=\infty$`
        })
      ],
      mistakes: [
        R`A konvergenciasugarat összekeverni az érvényességi intervallummal: a végpontokat külön kell vizsgálni.`,
        R`A $\ln(1+x)$ sorát $x=1$-nél divergensnek mondani (valójában konvergens, összege $\ln2$), és $x=-1$-nél konvergensnek.`,
        R`A binomiális sornál a nevezőben elhagyni a $k!$-t.`,
        R`A tagonkénti integrálásnál megváltoztatni a konvergenciasugarat (a sugár nem változik, csak a végpontok viselkedése).`
      ],
      exercises: [
        MB.q({ level: 2, q: R`Határozd meg a $\displaystyle\sum_{n=1}^{\infty}\frac{x^n}{n}$ sor konvergenciasugarát.`, a: '1', type: 'number', hint: R`$c_n=\frac1n$: $\left|\frac{c_n}{c_{n+1}}\right|=\frac{n+1}{n}$.`, sol: R`$\frac{n+1}{n}\to1$, tehát $R=1$. Az $x=1$ végponton harmonikus sor (divergens), $x=-1$-nél Leibniz szerint konvergens.` }),
        MB.q({ level: 2, q: R`Határozd meg a $\displaystyle\sum_{n=0}^{\infty}n!\,x^n$ sor konvergenciasugarát.`, a: '0', type: 'number', hint: R`$\left|\frac{c_n}{c_{n+1}}\right|=\frac{1}{n+1}$.`, sol: R`$\frac{1}{n+1}\to0$, tehát $R=0$: a sor csak $x=0$-ban konvergens.` }),
        MB.q({ level: 2, q: R`Határozd meg a $\displaystyle\sum_{n=0}^{\infty}\frac{(x-2)^n}{3^n}$ sor konvergenciasugarát.`, a: '3', type: 'number', hint: R`$c_n=3^{-n}$: $\left|\frac{c_n}{c_{n+1}}\right|=3$.`, sol: R`$R=3$, a konvergenciaintervallum belseje $(2-3,2+3)=(-1,5)$. A végpontokon a tagok nem tartanak nullához, ezért ott divergens.` }),
        MB.q({ level: 2, q: R`Mennyi az $x^7$ együtthatója az $\arctan x$ Maclaurin-sorában?`, a: '-1/7', alt: ['-0.142857'], type: 'expr', hint: R`$\arctan x=x-\frac{x^3}{3}+\frac{x^5}{5}-\frac{x^7}{7}+\cdots$.`, sol: R`Az előjel váltakozik, a nevező a kitevő: az együttható $-\frac17$.` }),
        MB.q({ level: 3, q: R`A $\ln2$-t a $\sum(-1)^{n+1}/n$ sor első három tagjával közelítjük. Add meg a hibabecslés felső korlátját.`, a: '0.25', alt: ['1/4'], type: 'number', hint: R`Leibniz: a hiba legfeljebb a következő tag, $c_4=\frac14$.`, sol: R`$|S-s_3|\le c_4=\frac14=0{,}25$.` }),
        MB.q({ level: 1, q: R`Közelítsd $\sqrt{1{,}01}$-et a binomiális sor első két tagjával.`, a: '1.005', type: 'number', hint: R`$1+\frac{x}{2}$, $x=0{,}01$.`, sol: R`$1+\frac{0{,}01}{2}=1{,}005$. A harmadik tag $-\frac{x^2}{8}\approx-1{,}25\cdot10^{-5}$, tehát a közelítés nagyon pontos.` }),
        MB.q({ level: 3, q: R`Határozd meg a $\displaystyle\sum_{n=1}^{\infty}\frac{x^n}{n^2}$ sor konvergenciasugarát.`, a: '1', type: 'number', hint: R`$c_n=\frac{1}{n^2}$.`, sol: R`$\left|\frac{c_n}{c_{n+1}}\right|=\frac{(n+1)^2}{n^2}\to1$, tehát $R=1$. Mindkét végponton abszolút konvergens.` }),
        MB.q({ level: 3, type: 'proof', q: R`Vezesd le a $\ln(1+x)$ Maclaurin-sorát a mértani sor tagonkénti integrálásával, és indokold az érvényességi tartományt.`, hint: R`$\frac{1}{1+t}=\sum(-1)^nt^n$ $|t|<1$-re; integrálj $0$-tól $x$-ig.`, sol: R`A mértani sor: $\frac{1}{1+t}=1-t+t^2-t^3+\cdots$ minden $|t|<1$-re. Mindkét oldalt integrálva $0$-tól $x$-ig (ahol $|x|<1$): $\ln(1+x)=\int_0^x\frac{dt}{1+t}=x-\frac{x^2}{2}+\frac{x^3}{3}-\cdots$. A hatványsor tagonként integrálható a konvergenciaintervallum belsejében, és a sugár nem változik, ezért $|x|<1$-re az egyenlőség fennáll. Az $x=1$ végponton a kapott sor $\sum\frac{(-1)^{n+1}}{n}$, amely a Leibniz-kritérium szerint konvergens, és Abel tételével az összeg folytonossága miatt $\ln2$; az $x=-1$ ponton a harmonikus sor miatt divergens. Tehát az érvényesség $-1<x\le1$.` })
      ],
      video: { list: 'PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr', title: 'Essence of calculus', channel: '3Blue1Brown', kind: 'LEJÁTSZÁSI LISTA' }
    }
  ]
});
