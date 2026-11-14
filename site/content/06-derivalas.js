var R = String.raw;
MB.section({
  id: 'derivalas', num: '06', title: 'Deriválás és alkalmazásai', subtitle: 'A pillanatnyi változás',
  examTag: 'ZH2',
  intro: R`A derivált a változás mérőszáma: megmondja, milyen gyorsan változik a függvény egy adott pontban. A definíció egyetlen ötlet — a szelő meredekségéből kiinduló differenciahányados határértéke —, de ebből az ötletből épül fel a teljes eszköztár: szorzat- és láncszabály, implicit deriválás, függvényvizsgálat, szélsőérték és L'Hôpital. Ez a rész a definíciótól halad a biztos számolási rutinig, majd a függvényvizsgálatig.`,
  chapters: [
    {
      id: 'derivalt-definicio', num: '6.1', title: 'A derivált definíciója, érintő', minutes: 32,
      lead: R`A differenciahányados még átlagsebesség: $\frac{f(x+h)-f(x)}{h}$. A derivált a pillanatnyi sebesség, amelyet úgy kapunk, hogy $h\to0$. Geometriailag: a szelő meredekségéből lesz az érintő meredeksége.`,
      why: [
        R`Ha egy autó $2$ óra alatt $120$ km-t tesz meg, az átlagsebesség $60\ \mathrm{km/h}$. A sebességmérő viszont nem átlagot mutat, hanem pillanatnyi értéket: egyre rövidebb időintervallumra vett átlagsebességet. Ez pontosan a differenciahányados határértéke. Ugyanez a gondolat működik minden mennyiségnél: hőmérséklet változási gyorsasága, koncentráció csökkenése, profit növekedési üteme. A derivált tehát nem absztrakt játék, hanem a „mennyire gyorsan” kérdés matematikai alakja.`,
        R`A deriválhatóság erősebb követelmény, mint a folytonosság, és ezt érdemes pontosan látni. A folytonosság azt mondja, hogy a grafikon nem szakad el; a differenciálhatóság azt, hogy nincs benne törés sem — van jól definiált érintő. Az $|x|$ függvény folytonos $0$-ban, mégis „csúcsos”: balról a differenciahányados $-1$-hez, jobbról $+1$-hez tart, tehát a derivált nem létezik. Ez a példa mutatja meg, miért kell a derivált definíciójában kétoldali határértéket venni, és miért nem lehet a folytonosságból deriválhatóságra következtetni.`
      ],
      when: R`Akkor kell a definícióhoz visszanyúlni, ha a derivált létezését kell eldönteni (pl. abszolútérték, darabonként definiált függvény illesztése), ha egy állítást kell bizonyítani, vagy ha olyan függvényt kell deriválni, amelyre nincs kész képlet. A ZH-kon a definíció alapján történő deriválás önálló feladat, és az érintő egyenlete is rendre előkerül.`,
      theory: [
        MB.def('Differenciahányados', R`Az $f$ függvény $a$ pontbeli, $h$ lépésközhöz tartozó differenciahányadosa
$$\frac{f(a+h)-f(a)}{h}.$$
Ez geometriailag az $(a,f(a))$ és $(a+h,f(a+h))$ pontokat összekötő szelő meredeksége, fizikailag pedig az átlagos váltoási sebesség az $[a,a+h]$ intervallumon.`),
        MB.def('Derivált', R`Az $f$ függvény differenciálható az $a$ pontban, ha a
$$f'(a)=\lim_{h\to0}\frac{f(a+h)-f(a)}{h}$$
határérték létezik és véges. Ezt a számot nevezzük a függvény $a$ pontbeli deriváltjának. Ekvivalens alak: $f'(a)=\lim_{x\to a}\frac{f(x)-f(a)}{x-a}$. A derivált függvény az $x\mapsto f'(x)$ hozzárendelés; jelölése $f'(x)$, $\frac{df}{dx}$ vagy $Df(x)$.`),
        MB.formula('Érintő egyenlete', R`y=f(x_0)+f'(x_0)\,(x-x_0).`, R`Az érintő az a lineáris függvény, amely a legjobban közelíti $f$-et $x_0$ közelében. Ezért $f(x_0+h)\approx f(x_0)+f'(x_0)h$ — ez a lineáris approximáció, minden numerikus közelítés alapja.`),
        MB.thm('Differenciálható ⇒ folytonos', R`Ha $f$ differenciálható az $a$ pontban, akkor ott folytonos is.
Bizonyítás: $f(x)-f(a)=\frac{f(x)-f(a)}{x-a}\,(x-a)$. Ha $x\to a$, az első tényező $f'(a)$-hoz, a második $0$-hoz tart, ezért a szorzat $0$-hoz, azaz $f(x)\to f(a)$.`, 'A megfordítás hamis — lásd a következő blokkot.'),
        MB.warn('A megfordítás nem igaz: $|x|$', R`Az $f(x)=|x|$ függvény folytonos $0$-ban, de nem differenciálható ott. Balról $\frac{|0+h|-0}{h}=\frac{-h}{h}=-1$, jobbról $\frac{h}{h}=1$; a két féloldali határérték különbözik, tehát a derivált nem létezik. A grafikonnak csúcsa van: az érintő „bármelyik irányból” elfogadható lenne, ezért nincs egyetlen jól definiált meredekség.`),
        MB.def('Féloldali és intervallumon vett derivált', R`A bal oldali derivált $f'_-(a)=\lim_{h\to0^-}\frac{f(a+h)-f(a)}{h}$, a jobb oldali $f'_+(a)=\lim_{h\to0^+}\frac{f(a+h)-f(a)}{h}$. A függvény pontosan akkor differenciálható $a$-ban, ha mindkét féloldali derivált létezik és egyenlő. Nyílt intervallumon differenciálható, ha minden pontjában az; zárt intervallumon a végpontokban a megfelelő féloldali derivált létezését kérjük.`),
        MB.note('Jelölések, magasabb deriváltak', R`A derivált deriváltja $f''$ (második derivált), jele $\frac{d^2f}{dx^2}$. Általában $f^{(n)}$ az $n$-edik derivált. Fizikában: ha $s(t)$ a hely, akkor $s'(t)=v(t)$ a sebesség és $s''(t)=a(t)$ a gyorsulás — a második derivált a változás változásának sebessége.`),
        MB.note('Miért lesz $x^2$ deriváltja $2x$?', R`$\frac{(x+h)^2-x^2}{h}=\frac{x^2+2xh+h^2-x^2}{h}=2x+h$. A $h\to0$ határérték $2x$. A $h^2$ tag azért tűnik el, mert $h$-nál gyorsabban tart nullához: a derivált csak a lineáris tagot „látja”. Ez a minta működik minden polinomnál, és ezért lesz $(x^n)'=nx^{n-1}$.`)
      ],
      examples: [
        MB.example({
          title: 'Derivált a definícióból',
          problem: R`Határozzuk meg az $f(x)=x^2$ függvény deriváltját a definíció alapján.`,
          steps: [
            R`Írjuk fel a differenciahányadost: $\frac{f(x+h)-f(x)}{h}=\frac{(x+h)^2-x^2}{h}$.`,
            R`Bontsuk ki: $(x+h)^2=x^2+2xh+h^2$.`,
            R`Kivonás után: $\frac{2xh+h^2}{h}=2x+h$ (itt $h\neq0$).`,
            R`Határérték: $2x+h\to 2x$, tehát $f'(x)=2x$.`
          ],
          answer: R`$f'(x)=2x$`
        }),
        MB.example({
          title: 'Érintő egyenlete',
          problem: R`Írjuk fel az $f(x)=x^2$ függvény grafikonjának érintőjét az $x_0=1$ pontban.`,
          steps: [
            R`A pont ordinátája: $f(1)=1$, tehát az érintési pont $(1,1)$.`,
            R`A meredekség: $f'(x)=2x$, ezért $f'(1)=2$.`,
            R`Az érintő: $y=f(1)+f'(1)(x-1)=1+2(x-1)$.`,
            R`Rendezve: $y=2x-1$.`
          ],
          answer: R`$y=2x-1$`
        }),
        MB.example({
          title: 'Differenciálhatóság egy pontban, paraméterrel',
          problem: R`Milyen $a,b$ érték mellett lesz az $f(x)=x^2$ ($x\le1$), $f(x)=ax+b$ ($x>1$) függvény differenciálható az $x=1$ pontban?`,
          steps: [
            R`Differenciálhatóság ⇒ folytonosság, ezért először illeszteni kell: balról $f(1)=1$, jobbról $a\cdot1+b$. Tehát $a+b=1$.`,
            R`Bal oldali derivált: $(x^2)'=2x$, értéke $x=1$-ben $2$.`,
            R`Jobb oldali derivált: $(ax+b)'=a$, mindenhol $a$.`,
            R`A derivált akkor létezik, ha $f'_-(1)=f'_+(1)$, azaz $a=2$.`,
            R`A folytonossági feltételből $b=1-a=-1$.`
          ],
          answer: R`$a=2$, $b=-1$`
        })
      ],
      mistakes: [
        R`A deriváltat a differenciahányadossal azonosítjuk, és elfelejtjük a $h\to0$ határértéket.`,
        R`Azt hisszük, hogy a folytonosságból következik a differenciálhatóság ($|x|$ cáfolja).`,
        R`Az érintő egyenletéből kihagyjuk az $f(x_0)$ tagot, és $y=f'(x_0)(x-x_0)$-t írunk — ez az origón átmenő párhuzamost adja, nem az érintőt.`,
        R`A $|x|$ deriváltját $0$-ban $1$-nek vagy $-1$-nek mondjuk. Ott a derivált nem létezik, mert a féloldali deriváltak különböznek.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Mennyi az $f(x)=x^2$ függvény deriváltja az $x=3$ pontban?`, a: '6', type: 'number', hint: R`$f'(x)=2x$.`, sol: R`$f'(3)=2\cdot3=6$.` }),
        MB.q({ level: 1, q: R`Add meg az $f(x)=x^3$ deriváltját (a definíció alapján számolva is ez jön ki).`, a: '3x^2', alt: ['3*x^2', '3x²'], type: 'expr', hint: R`$(x+h)^3=x^3+3x^2h+3xh^2+h^3$.`, sol: R`$\frac{(x+h)^3-x^3}{h}=3x^2+3xh+h^2\to3x^2$.` }),
        MB.q({ level: 2, q: R`Mi az $f(x)=x^2$ görbe érintőjének egyenlete az $x_0=2$ pontban?`, a: 'y=4x-4', alt: ['4x-4', 'y = 4x - 4'], type: 'text', hint: R`$f(2)=4$, $f'(2)=4$; használd $y=f(x_0)+f'(x_0)(x-x_0)$.`, sol: R`$y=4+4(x-2)=4x-4$.` }),
        MB.q({ level: 2, q: R`Add meg az $f(x)=\dfrac1x$ deriváltját ($x\neq0$).`, a: '-1/x^2', alt: ['-x^-2', '-1/(x^2)'], type: 'expr', hint: R`$\frac{1}{h}\left(\frac{1}{x+h}-\frac1x\right)$, hozz közös nevezőre.`, sol: R`$\frac{x-(x+h)}{h\,x(x+h)}=\frac{-1}{x(x+h)}\to-\frac{1}{x^2}$.` }),
        MB.q({ level: 2, q: R`Differenciálható-e az $f(x)=|x|$ függvény az $x=0$ pontban?`, type: 'choice', choices: ['Igen, a derivált 0', 'Igen, a derivált 1', 'Nem, mert a féloldali deriváltak különböznek', 'Nem, mert a függvény nem folytonos'], a: '2', sol: R`Balról a differenciahányados $-1$, jobbról $+1$; a határérték nem létezik, tehát nem differenciálható. A függvény viszont folytonos $0$-ban.` }),
        MB.q({ level: 2, q: R`Mennyi az $f(x)=\sqrt x$ függvény deriváltja az $x=4$ pontban?`, a: '1/4', alt: ['0.25'], type: 'expr', hint: R`$\frac{\sqrt{4+h}-2}{h}$; bővíts a számláló konjugáltjával.`, sol: R`$\frac{4+h-4}{h(\sqrt{4+h}+2)}=\frac{1}{\sqrt{4+h}+2}\to\frac{1}{4}$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy ha $f$ differenciálható az $a$ pontban, akkor ott folytonos.`, type: 'proof', hint: R`Írd fel $f(x)-f(a)$-t a differenciahányados és $(x-a)$ szorzataként.`, sol: R`$f(x)-f(a)=\frac{f(x)-f(a)}{x-a}(x-a)$. Ha $x\to a$, a hányados $f'(a)$-hoz tart (a differenciálhatóság miatt), az $(x-a)$ tényező pedig $0$-hoz. A szorzat határértéke ezért $f'(a)\cdot0=0$, azaz $f(x)\to f(a)$: a függvény folytonos $a$-ban.` }),
        MB.q({ level: 3, q: R`Az $f(x)=x^2$ ($x\le2$) és $f(x)=ax+b$ ($x>2$) függvény differenciálható az $x=2$ pontban. Mennyi $a$?`, a: '4', type: 'number', hint: R`Előbb folytonosság ($4=2a+b$), aztán a deriváltak egyezése ($4=a$).`, sol: R`Folytonosság: $2a+b=4$. Derivált: balról $2x\to4$, jobbról $a$, ezért $a=4$, majd $b=-4$.` })
      ],
      video: { id: 'PnM6HgPlWbc', title: 'Deriválás alapjai', channel: 'FZsMatek', kind: 'VIDEÓ' }
    },
    {
      id: 'derivalt-szabalyok', num: '6.2', title: 'Deriválási szabályok, láncszabály', minutes: 34,
      lead: R`A deriválás lineáris művelet, ezért összegre és konstans szorzóra szétesik. A szorzatnál és a hányadosnál már megjelenik egy plusz tag, az összetett függvénynél pedig a láncszabály: $(f(g(x)))'=f'(g(x))g'(x)$. Ezekkel a szabályokkal gyakorlatilag minden elemi kifejezés deriválható.`,
      why: [
        R`A szabályok nem külön tételek, hanem a derivált definíciójának következményei. A szorzatnál mindkét tényező változik, ezért a változás két részből áll: „$f$ változik, $g$ áll” és „$g$ változik, $f$ áll” — ezért $(fg)'=f'g+fg'$. A láncszabály pedig arról szól, hogy a változás „átszorzódik”: ha $x$ változására $g$ $g'$-szeres ütemben reagál, és $g$ változására $f$ $f'$-szeres ütemben, akkor az eredő ütem a kettő szorzata. Ezért van benne szorzat, nem összeg.`,
        R`A láncszabály nélkül a gyakorlat megállna: a mérnöki képletek szinte mind összetett függvények ($e^{-t/\tau}$, $\sin(\omega t+\varphi)$, $\ln(1+x^2)$). A logaritmikus deriválás pedig olyan eseteket nyit meg, amelyekre a táblázat nem kínál képletet: $x^x$, $(\sin x)^x$ vagy általában tetszőleges $f(x)^{g(x)}$ alak. Mindkettő ugyanannak a gondolatnak a következménye, hogy a deriválás a szorzat- és láncszabályon keresztül bontható.`
      ],
      when: R`Minden deriválási feladatnál, de különösen: összetett függvényeknél (láncszabály), törtnél (hányados-szabály), soktényezős szorzatnál (logaritmikus deriválás), és amikor egy paramétert tartalmazó kifejezés deriváltjára van szükség. A ZH-kon a deriválás önmagában is pontot ér, de a 6.3 és 6.4 feladatai is ezekre épülnek.`,
      theory: [
        MB.formula('Alapderiváltak', R`\begin{aligned}
(c)' &= 0, & (x^n)' &= nx^{n-1},\\
(\sin x)' &= \cos x, & (\cos x)' &= -\sin x,\\
(e^x)' &= e^x, & (a^x)' &= a^x\ln a,\\
(\ln x)' &= \frac1x, & (\log_a x)' &= \frac{1}{x\ln a}.
\end{aligned}`, R`Hatványfüggvénynél $x>0$, ha a kitevő valós; logaritmusnál $x>0$, $a>0$, $a\neq1$.`),
        MB.thm('Összeg, konstans, szorzat, hányados', R`\begin{aligned}
(cf)' &= cf', & (f\pm g)' &= f'\pm g',\\
(fg)' &= f'g+fg', & \left(\frac fg\right)' &= \frac{f'g-fg'}{g^2}.
\end{aligned}`, R`A hányados-szabály feltétele $g(x)\neq0$; a számláló sorrendje nem cserélhető fel (nem $fg'-f'g$).`),
        MB.thm('Láncszabály', R`Ha $g$ differenciálható $x$-ben és $f$ differenciálható $g(x)$-ben, akkor
$$[f(g(x))]'=f'(g(x))\cdot g'(x).$$
Szavakkal: a külső függvény deriváltja a belső értékénél, szorozva a belső függvény deriváltjával. Többszörös összetételnél láncba fűzhető: $[f(g(h(x)))]'=f'(g(h(x)))\,g'(h(x))\,h'(x)$.`),
        MB.note('Miért szorzat a láncszabályban?', R`Jelölje $\Delta g$ a belső függvény megváltozását. Ekkor $\Delta f\approx f'(g)\,\Delta g$ és $\Delta g\approx g'(x)\,\Delta x$, ezért $\frac{\Delta f}{\Delta x}\approx f'(g)\,g'(x)$. A $h\to0$ határértékben a közelítésből egyenlőség lesz. A lényeg: a két ütem összeszorzódik, mert a belső változás „továbbadódik” a külső függvénynek.`),
        MB.note('Logaritmikus deriválás', R`Ha $y=f(x)^{g(x)}$ (változó alap és változó kitevő), vegyük mindkét oldal logaritmusát: $\ln y=g(x)\ln f(x)$, majd deriváljunk implicit módon: $\frac{y'}{y}=g'\ln f+g\frac{f'}{f}$. Innen $y'=y\left(g'\ln f+g\frac{f'}{f}\right)$. Például $y=x^x$ esetén $\ln y=x\ln x$, $\frac{y'}{y}=\ln x+1$, tehát $y'=x^x(\ln x+1)$.`),
        MB.formula('Tangens és kotangens', R`(\tan x)'=\frac{1}{\cos^2x}=1+\tan^2x,\qquad (\cot x)'=-\frac{1}{\sin^2x}.`, R`Mindkettő a hányados-szabályból jön: $\tan x=\frac{\sin x}{\cos x}$.`),
        MB.warn('A leggyakoribb hibák', R`$(fg)'\neq f'g'$ és $\left(\frac fg\right)'\neq\frac{f'}{g'}$. A $\sin^2x$ deriváltja $2\sin x\cos x=\sin2x$, nem $\cos^2x$ és nem $2\sin x$. A $\sin(x^2)$ deriváltja $2x\cos(x^2)$ — a láncszabály miatt a $2x$ tényező nem maradhat el.`),
        MB.list('Mit érdemes fejből tudni', [
          R`$(x^n)'=nx^{n-1}$ minden valós $n$-re (ahol értelmezett).`,
          R`$(\sqrt x)'=\frac{1}{2\sqrt x}$, mert $n=\frac12$.`,
          R`$(e^{kx})'=ke^{kx}$; $(a^{kx})'=ka^{kx}\ln a$.`,
          R`$(\ln(kx))'=\frac1x$ — a konstans szorzó kiesik.`
        ])
      ],
      examples: [
        MB.example({
          title: 'Láncszabály logaritmuson',
          problem: R`Deriváljuk: $f(x)=\ln(x^2+1)$.`,
          steps: [
            R`Külső függvény: $\ln u$, deriváltja $\frac1u$.`,
            R`Belső függvény: $u=x^2+1$, deriváltja $2x$.`,
            R`Láncszabály: $f'(x)=\frac{1}{x^2+1}\cdot2x$.`,
            R`Egyszerűsítve: $f'(x)=\frac{2x}{x^2+1}$.`
          ],
          answer: R`$f'(x)=\dfrac{2x}{x^2+1}$`
        }),
        MB.example({
          title: 'Szorzat-szabály',
          problem: R`Deriváljuk: $f(x)=x^3e^x$.`,
          steps: [
            R`Alkalmazzuk $(fg)'=f'g+fg'$ szabályt $f=x^3$, $g=e^x$ szereposztással.`,
            R`$f'=3x^2$, $g'=e^x$.`,
            R`$f'(x)=3x^2e^x+x^3e^x$.`,
            R`Kiemelés: $x^2e^x(3+x)$.`
          ],
          answer: R`$f'(x)=x^2e^x(x+3)$`
        }),
        MB.example({
          title: 'Láncszabály szinuszon',
          problem: R`Deriváljuk: $f(x)=\sin(3x^2)$.`,
          steps: [
            R`Külső: $\sin u$, deriváltja $\cos u$.`,
            R`Belső: $u=3x^2$, deriváltja $6x$.`,
            R`$f'(x)=\cos(3x^2)\cdot6x$.`
          ],
          answer: R`$f'(x)=6x\cos(3x^2)$`
        }),
        MB.example({
          title: 'Változó alap és kitevő',
          problem: R`Deriváljuk: $f(x)=x^x$ ($x>0$).`,
          steps: [
            R`Mindkét oldal logaritmusa: $\ln f(x)=x\ln x$.`,
            R`Deriváljunk $x$ szerint (bal oldalon implicit módon): $\frac{f'(x)}{f(x)}=\ln x+x\cdot\frac1x$.`,
            R`$\frac{f'(x)}{f(x)}=\ln x+1$.`,
            R`$f'(x)=f(x)(\ln x+1)=x^x(\ln x+1)$.`
          ],
          answer: R`$f'(x)=x^x(\ln x+1)$`
        })
      ],
      mistakes: [
        R`$(fg)'=f'g'$ — helyesen $f'g+fg'$.`,
        R`A láncszabályban elhagyjuk a belső függvény deriváltját: $(\sin(3x))'=\cos(3x)$ helyett helyesen $3\cos(3x)$.`,
        R`A hányados-szabály számlálójában felcseréljük a tagokat: helyesen $f'g-fg'$, nem $fg'-f'g$.`,
        R`A $\ln x^2$-t $\frac{1}{x^2}$-nek deriváljuk. Helyesen $\ln(x^2)=2\ln|x|$, deriváltja $\frac2x$; láncszabállyal $\frac{1}{x^2}\cdot2x=\frac2x$.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Deriváld: $f(x)=(x^2+1)^{10}$.`, a: '20x(x^2+1)^9', alt: ['20*x*(x^2+1)^9'], type: 'expr', hint: R`Láncszabály: külső $u^{10}$, belső $x^2+1$.`, sol: R`$10(x^2+1)^9\cdot2x=20x(x^2+1)^9$.` }),
        MB.q({ level: 1, q: R`Deriváld: $f(x)=x^3+2x$.`, a: '3x^2+2', alt: ['3*x^2+2'], type: 'expr', hint: R`Tagonként deriválj.`, sol: R`$(x^3)'=3x^2$, $(2x)'=2$, tehát $3x^2+2$.` }),
        MB.q({ level: 2, q: R`Deriváld: $f(x)=e^{x^2}$.`, a: '2xe^(x^2)', alt: ['2x*e^(x^2)', '2xe^{x^2}'], type: 'expr', hint: R`Külső $e^u$, belső $x^2$.`, sol: R`$e^{x^2}\cdot2x=2xe^{x^2}$.` }),
        MB.q({ level: 2, q: R`Deriváld: $f(x)=\dfrac{x+1}{x-1}$.`, a: '-2/(x-1)^2', alt: ['-2/(x-1)^2', '-2*(x-1)^-2'], type: 'expr', hint: R`Hányados-szabály: $\frac{1\cdot(x-1)-(x+1)\cdot1}{(x-1)^2}$.`, sol: R`$\frac{x-1-x-1}{(x-1)^2}=\frac{-2}{(x-1)^2}$.` }),
        MB.q({ level: 2, q: R`Deriváld: $f(x)=\sin^2x$.`, a: 'sin(2x)', alt: ['2sin(x)cos(x)', '2*sin(x)*cos(x)', 'sin2x'], type: 'expr', hint: R`Írd $\sin^2x=(\sin x)^2$ alakba, és alkalmazz láncszabályt.`, sol: R`$2\sin x\cdot\cos x=\sin2x$.` }),
        MB.q({ level: 2, q: R`Deriváld: $f(x)=\ln(\sin x)$ (ahol $\sin x>0$).`, a: 'cot(x)', alt: ['cos(x)/sin(x)', '1/tan(x)', 'cotx'], type: 'expr', hint: R`Külső $\ln u$, belső $\sin x$.`, sol: R`$\frac{1}{\sin x}\cdot\cos x=\cot x$.` }),
        MB.q({ level: 3, q: R`Mennyi az $f(x)=x^x$ deriváltja az $x=1$ pontban?`, a: '1', type: 'number', hint: R`$f'(x)=x^x(\ln x+1)$.`, sol: R`$f'(1)=1^1(\ln1+1)=1$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy $(fgh)'=f'gh+fg'h+fgh'$ (feltéve, hogy mindhárom differenciálható).`, type: 'proof', hint: R`Alkalmazd a szorzat-szabályt kétszer: először $fg$-re, majd a kapott szorzatra.`, sol: R`$(fgh)'=((fg)h)'=(fg)'h+(fg)h'=(f'g+fg')h+fgh'=f'gh+fg'h+fgh'$. A szorzat-szabály kétszeri alkalmazása teljes indukcióval tetszőleges számú tényezőre kiterjeszthető.` })
      ],
      video: { id: 'bqrOMT8YdSg', title: 'Összetett függvény képzése', channel: 'FZsMatek', kind: 'VIDEÓ' }
    },
    {
      id: 'derivalt-inverz', num: '6.3', title: 'Inverz, implicit, paraméteres, elemi függvények', minutes: 36,
      lead: R`A láncszabály három irányban terjeszti ki a deriválást: inverz függvényre, implicit módon megadott függvényre és paraméteres görbére. Ugyanezzel a módszerrel vezethetők le az exponenciális, logaritmikus, arkusz- és hiperbolikus függvények deriváltjai — nem kell külön memorizálni őket.`,
      why: [
        R`Az inverz függvény deriváltjának képlete $\left(f^{-1}\right)'(y)=\frac{1}{f'(x)}$ (ahol $y=f(x)$) egyszerűen azt mondja: ha $f$ egy egység változásra $f'$ egységgel reagál, akkor a visszafelé irányított hozzárendelés egy egységre $\frac{1}{f'}$-vel reagál. Ez nem új tétel, hanem a láncszabály alkalmazása az $f(f^{-1}(y))=y$ azonosságra. Ebből jön az összes „fordított” függvény deriváltja: $\ln$, $a^x$, $\arcsin$, $\arctan$.`,
        R`Az implicit és a paraméteres megadás akkor lép be, amikor a függvény nem írható fel $y=f(x)$ alakban: egy kör egyenlete $x^2+y^2=25$ nem függvény, és egy ciklois pályája is csak paraméterrel írható le. Az implicit deriválásnál $y$-t $x$ függvényeként kezeljük és láncszabályt használunk; a paraméteresnél a két változás arányát osztjuk el: $\frac{dy}{dx}=\frac{y'(t)}{x'(t)}$. Mindkettő ugyanaz a gondolat: a változási ütemek hányadosa adja a meredekséget.`
      ],
      when: R`Inverz függvények deriválásánál (különösen, ha a képletet kell levezetni), érintő meredekségénél implicit görbén (kör, ellipszis, szintvonal), pálya sebességvektoránál paraméteres alakból, és minden olyan ZH-feladatnál, ahol „add meg az érintő meredekségét a $P$ pontban” szerepel egy nem $y=f(x)$ alakú görbénél.`,
      theory: [
        MB.thm('Inverz függvény deriváltja', R`Ha $f$ szigorúan monoton és differenciálható az $x$ pontban, $f'(x)\neq0$, továbbá $f^{-1}$ differenciálható az $y=f(x)$ pontban, akkor
$$\left(f^{-1}\right)'(y)=\frac{1}{f'(x)},\qquad\text{ahol } y=f(x).$$
Bizonyítás: $f\left(f^{-1}(y)\right)=y$. Mindkét oldalt deriválva a láncszabállyal $f'\left(f^{-1}(y)\right)\cdot\left(f^{-1}\right)'(y)=1$, amiből az állítás következik.`),
        MB.note(R`Honnan jön az $(\arcsin x)'$?`, R`Legyen $y=\arcsin x$, azaz $x=\sin y$ és $y\in\left(-\frac\pi2,\frac\pi2\right)$. Deriválva: $1=\cos y\cdot y'$, tehát $y'=\frac{1}{\cos y}$. A $\left(-\frac\pi2,\frac\pi2\right)$ intervallumon $\cos y>0$, ezért $\cos y=\sqrt{1-\sin^2y}=\sqrt{1-x^2}$. Így $(\arcsin x)'=\frac{1}{\sqrt{1-x^2}}$. Ugyanígy $(\arctan x)'=\frac{1}{1+x^2}$.`),
        MB.formula('Exponenciális és logaritmikus', R`(e^x)'=e^x,\quad (a^x)'=a^x\ln a,\quad (\ln x)'=\frac1x,\quad (\log_a x)'=\frac{1}{x\ln a}.`, R`Az $a^x=e^{x\ln a}$ átírásból a láncszabállyal: $(a^x)'=e^{x\ln a}\ln a=a^x\ln a$.`),
        MB.formula('Inverz trigonometrikus', R`(\arcsin x)'=\frac{1}{\sqrt{1-x^2}},\quad (\arccos x)'=-\frac{1}{\sqrt{1-x^2}},\quad (\arctan x)'=\frac{1}{1+x^2}.`, 'Értelmezési tartomány: $|x|<1$ az arkuszoknál, minden valós $x$ az arctannál.'),
        MB.note('Hiperbolikus függvények', R`$\sinh x=\frac{e^x-e^{-x}}{2}$, $\cosh x=\frac{e^x+e^{-x}}{2}$, és $\cosh^2x-\sinh^2x=1$. Deriváltjaik: $(\sinh x)'=\cosh x$, $(\cosh x)'=\sinh x$ — itt nincs mínuszjel, ez a fő különbség a trigonometrikus párhoz képest. Az inverz hiperbolikusra például $(\operatorname{arsinh} x)'=\frac{1}{\sqrt{x^2+1}}$.`),
        MB.thm('Implicit deriválás', R`Legyen a görbe $F(x,y)=0$ alakban adva, és tegyük fel, hogy a görbe egy pont környezetében $y=y(x)$ függvényként írható fel. Deriváljuk mindkét oldalt $x$ szerint, $y$-t $y(x)$-nek tekintve (láncszabály!), majd fejezzük ki $y'$-t. Ha $F$ differenciálható és $F_y\neq0$, akkor
$$y'=-\frac{F_x}{F_y}.$$`),
        MB.thm('Paraméteres görbe', R`Ha a görbét $x=x(t)$, $y=y(t)$ adja meg, és $x'(t)\neq0$, akkor
$$\frac{dy}{dx}=\frac{y'(t)}{x'(t)}.$$
A második derivált: $\frac{d^2y}{dx^2}=\frac{\left(\frac{dy}{dx}\right)'(t)}{x'(t)}$ — itt a belső hányadost előbb $t$ szerint kell deriválni, majd osztani $x'(t)$-vel.`),
        MB.warn('Feltételek, amelyeket könnyű elfelejteni', R`Inverznél $f'(x)\neq0$ kell: az $y=x^3$ inverze $x=\sqrt[3]y$, és $x=0$-ban a derivált végtelen (függőleges érintő). Paraméteresnél $x'(t)\neq0$: ha $x'(t)=0$, a görbe függőleges érintőjű, és $\frac{dy}{dx}$ nem értelmezett. Implicitnél $F_y\neq0$ biztosítja, hogy lokálisan $y$ kifejezhető $x$-ből.`)
      ],
      examples: [
        MB.example({
          title: 'Arkuszszinusz levezetése',
          problem: R`Vezessük le az $(\arcsin x)'$ képletet.`,
          steps: [
            R`$y=\arcsin x\iff x=\sin y$, ahol $y\in\left(-\frac\pi2,\frac\pi2\right)$.`,
            R`Deriválva $x$ szerint: $1=\cos y\cdot y'$.`,
            R`$y'=\frac{1}{\cos y}$, és a megadott intervallumon $\cos y>0$, ezért $\cos y=\sqrt{1-\sin^2y}=\sqrt{1-x^2}$.`,
            R`Tehát $(\arcsin x)'=\frac{1}{\sqrt{1-x^2}}$.`
          ],
          answer: R`$(\arcsin x)'=\dfrac{1}{\sqrt{1-x^2}}$`
        }),
        MB.example({
          title: 'Implicit deriválás körön',
          problem: R`Határozzuk meg az $x^2+y^2=25$ kör érintőjének meredekségét a $P(3,4)$ pontban.`,
          steps: [
            R`Deriváljunk mindkét oldalt $x$ szerint, $y=y(x)$-szel: $2x+2y\,y'=0$.`,
            R`Kifejezve: $y'=-\frac{x}{y}$.`,
            R`A $P(3,4)$ pontban: $y'=-\frac34$.`,
            R`Az érintő: $y-4=-\frac34(x-3)$, azaz $y=-\frac34x+\frac{25}{4}$.`
          ],
          answer: R`$m=-\dfrac34$, az érintő $y=-\dfrac34x+\dfrac{25}{4}$`
        }),
        MB.example({
          title: 'Paraméteres görbe meredeksége',
          problem: R`Az $x=t^2$, $y=t^3$ görbe melyik pontjában mennyi $\frac{dy}{dx}$? Számítsuk ki $t=1$-ben.`,
          steps: [
            R`$x'(t)=2t$, $y'(t)=3t^2$.`,
            R`$\frac{dy}{dx}=\frac{y'(t)}{x'(t)}=\frac{3t^2}{2t}=\frac{3t}{2}$ (ahol $t\neq0$).`,
            R`$t=1$-ben a meredekség $\frac32$; a pont $(1,1)$.`,
            R`Megjegyzés: $t=0$-ban $x'(0)=0$, ott a görbének csúcspontja van, a meredekség nem értelmezett.`
          ],
          answer: R`$\dfrac{dy}{dx}=\dfrac{3t}{2}$; $t=1$-ben $\dfrac32$`
        }),
        MB.example({
          title: 'Exponenciális alapú derivált',
          problem: R`Vezessük le az $(a^x)'$ képletet ($a>0$).`,
          steps: [
            R`Írjuk át: $a^x=e^{x\ln a}$.`,
            R`Láncszabály: a külső $e^u$ deriváltja $e^u$, a belső $x\ln a$ deriváltja $\ln a$.`,
            R`$(a^x)'=e^{x\ln a}\cdot\ln a=a^x\ln a$.`,
            R`Ellenőrzés $a=e$-re: $\ln e=1$, és valóban $(e^x)'=e^x$.`
          ],
          answer: R`$(a^x)'=a^x\ln a$`
        })
      ],
      mistakes: [
        R`Az inverz deriváltját a derivált reciprokaként használjuk, de rossz pontban: $\left(f^{-1}\right)'(y)=\frac{1}{f'(x)}$, ahol $y=f(x)$ — nem $\frac{1}{f'(y)}$.`,
        R`Implicit deriválásnál a $y^2$-t $2y$-nak deriváljuk, elfelejtve a láncszabályt: helyesen $2y\,y'$.`,
        R`Paraméteresnél $\frac{dy}{dx}=\frac{x'(t)}{y'(t)}$-t írunk; a helyes sorrend $\frac{y'(t)}{x'(t)}$.`,
        R`Elfelejtjük az értelmezési tartományt: $(\arcsin x)'$ csak $|x|<1$-re értelmezett, $(\ln x)'$ csak $x>0$-ra.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Add meg az $(\arctan x)'$ képletét.`, a: '1/(1+x^2)', alt: ['1/(1+x^2)', '1/(x^2+1)'], type: 'expr', hint: R`Az $\arctan$ inverze a $\tan$, és $(\tan y)'=1+\tan^2y$.`, sol: R`$x=\tan y\Rightarrow1=(1+\tan^2y)y'$, ezért $y'=\frac{1}{1+x^2}$.` }),
        MB.q({ level: 1, q: R`Deriváld: $f(x)=e^{3x}$.`, a: '3e^(3x)', alt: ['3*e^(3x)', '3e^{3x}'], type: 'expr', hint: R`Láncszabály, belső függvény $3x$.`, sol: R`$e^{3x}\cdot3=3e^{3x}$.` }),
        MB.q({ level: 2, q: R`Deriváld: $f(x)=\arcsin\dfrac x2$.`, a: '1/sqrt(4-x^2)', alt: ['1/sqrt(4-x^2)', '1/(sqrt(4-x^2))'], type: 'expr', hint: R`Láncszabály: $\frac{1}{\sqrt{1-(x/2)^2}}\cdot\frac12$.`, sol: R`$\frac{1/2}{\sqrt{1-x^2/4}}=\frac{1}{\sqrt{4-x^2}}$.` }),
        MB.q({ level: 2, q: R`Az $x^2+xy+y^2=3$ görbe melyik meredekséggel halad át az $(1,1)$ ponton?`, a: '-1', type: 'number', hint: R`Deriválj implicit módon: $2x+y+xy'+2yy'=0$.`, sol: R`$y'=-\frac{2x+y}{x+2y}$; az $(1,1)$ pontban $-\frac{3}{3}=-1$.` }),
        MB.q({ level: 2, q: R`Az $x=\cos t$, $y=\sin t$ paraméteres körnél mennyi $\frac{dy}{dx}$?`, a: '-cot(t)', alt: ['-cos(t)/sin(t)', '-1/tan(t)', '-cot t'], type: 'expr', hint: R`$\frac{y'(t)}{x'(t)}=\frac{\cos t}{-\sin t}$.`, sol: R`$\frac{dy}{dx}=-\frac{\cos t}{\sin t}=-\cot t$.` }),
        MB.q({ level: 2, q: R`Deriváld: $f(x)=\ln(\cos x)$ (ahol $\cos x>0$).`, a: '-tan(x)', alt: ['-sin(x)/cos(x)', '-tanx'], type: 'expr', hint: R`Külső $\ln u$, belső $\cos x$.`, sol: R`$\frac{1}{\cos x}\cdot(-\sin x)=-\tan x$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be az inverz függvény deriválási szabályát: $\left(f^{-1}\right)'(y)=\dfrac{1}{f'(x)}$, ahol $y=f(x)$.`, type: 'proof', hint: R`Indulj ki az $f\left(f^{-1}(y)\right)=y$ azonosságból, és deriválj mindkét oldalt $y$ szerint.`, sol: R`Az $f\left(f^{-1}(y)\right)=y$ azonosság mindkét oldalát $y$ szerint deriválva a láncszabállyal $f'\left(f^{-1}(y)\right)\cdot\left(f^{-1}\right)'(y)=1$ adódik. Mivel $f^{-1}(y)=x$, ebből $\left(f^{-1}\right)'(y)=\frac{1}{f'(x)}$, feltéve hogy $f'(x)\neq0$.` }),
        MB.q({ level: 3, q: R`A ciklois paraméteres egyenlete $x=t-\sin t$, $y=1-\cos t$. Mennyi $\frac{dy}{dx}$?`, a: 'sin(t)/(1-cos(t))', alt: ['sin t/(1-cos t)', 'sin(t)/(1-cos(t))', 'cot(t/2)'], type: 'expr', hint: R`$x'(t)=1-\cos t$, $y'(t)=\sin t$.`, sol: R`$\frac{dy}{dx}=\frac{\sin t}{1-\cos t}$ (ami $t\neq0$ esetén $\cot\frac t2$-vel is egyenlő).` })
      ],
      video: { title: 'Inverz és implicit deriválás', channel: 'Magyar matematika csatornák', kind: 'KERESÉS', search: 'inverz függvény deriváltja implicit deriválás paraméteres görbe magyar előadás' }
    },
    {
      id: 'derivalt-fuggvenyvizsgalat', num: '6.4', title: "L'Hôpital, függvényvizsgálat, szélsőérték", minutes: 38,
      lead: R`A derivált nem csak számolás: alakítja a grafikont. Az előjeléből monotonitás, a nullhelyeiből szélsőérték, a második derivált előjeléből konvexitás és inflexió következik. Ugyanez az eszköz adja a határértékek kiszámításának legerősebb módszerét, a L'Hôpital-szabályt — amely viszont csak a megfelelő alakoknál érvényes.`,
      why: [
        R`A derivált előjele közvetlenül megmondja, merre megy a függvény: ahol $f'>0$, ott nő, ahol $f'<0$, ott csökken. Ebből az következik, hogy egy belső pontban csak úgy lehet szélsőérték, hogy a derivált előjelet vált — ez a Fermat-tétel, a szükséges feltétel. A második derivált ugyanezt a gondolatot ismétli a meredekségre: $f''>0$ azt jelenti, hogy a meredekség nő, tehát a görbe felfelé hajlik (konvex). Az inflexiós pont az, ahol a görbe átvált konkávból konvexbe — itt a második derivált előjelet vált.`,
        R`Zárt intervallumon a globális szélsőértéket nem elég a derivált nullhelyeinél keresni: Weierstrass tétele szerint folytonos függvény felveszi a maximumát és minimumát, de ez a végpontokban is történhet. Ezért a vizsgálat mindig három jelölt típusból áll: stacionárius pontok, végpontok, és a nem differenciálható pontok. A L'Hôpital-szabály ugyanennek a gépezetnek a mellékterméke: a $0/0$ alakot az érintők hányadosának határértékére cseréli.`
      ],
      when: R`Függvényvizsgálatnál (monotonitás, szélsőérték, inflexió, vázlatrajz), szélsőérték-feladatoknál (zárt intervallumon vagy szöveges optimalizálásnál), és minden $0/0$ vagy $\infty/\infty$ alakú határértéknél. A ZH-kon a függvényvizsgálat önálló, pontozott feladat, a L'Hôpital pedig gyors pontszerző lehet — ha az alakot előbb ellenőrizzük.`,
      theory: [
        MB.thm("L'Hôpital-szabály", R`Legyen $f,g$ differenciálható az $a$ pont egy környezetében és $g'(x)\neq0$ ott. Ha $\lim_{x\to a}\frac{f(x)}{g(x)}$ alakja $\frac00$ vagy $\frac{\infty}{\infty}$, és létezik $\lim_{x\to a}\frac{f'(x)}{g'(x)}$ (véges vagy $\pm\infty$), akkor
$$\lim_{x\to a}\frac{f(x)}{g(x)}=\lim_{x\to a}\frac{f'(x)}{g'(x)}.$$
Az állítás $x\to\pm\infty$ esetére is igaz.`, 'A szabály irányított: ha a deriváltak hányadosának nincs határértéke, abból nem következik, hogy az eredeti hányadosnak sincs (lásd a figyelmeztetést).'),
        MB.note('A többi határozatlan alak', R`A $0\cdot\infty$, $\infty-\infty$, $1^\infty$, $0^0$ és $\infty^0$ alakokat előbb át kell alakítani. A $0\cdot\infty$-t törtté írjuk ($f g=\frac{f}{1/g}$), a különbséget közös nevezőre hozzuk, a hatvány-alakot pedig logaritmáljuk: $f^g=e^{g\ln f}$, és a kitevő $g\ln f$ határértékét számoljuk (ez $0\cdot\infty$ alakú).`),
        MB.thm('Monotonitás', R`Ha $f$ folytonos $[a,b]$-n és differenciálható $(a,b)$-n, akkor $f'>0$ esetén szigorúan növekvő, $f'<0$ esetén szigorúan csökkenő, $f'=0$ esetén konstans. A bizonyítás a Lagrange-középértéktételen nyugszik: $f(x_2)-f(x_1)=f'(\xi)(x_2-x_1)$ valamely $\xi$-re, és itt a jobb oldal előjelét $f'(\xi)$ dönti el.`),
        MB.thm('Szélsőérték: szükséges és elégséges feltétel', R`Ha $f$-nek $a$-ban lokális szélsőértéke van és $f$ differenciálható $a$-ban, akkor $f'(a)=0$ (Fermat). Ez csak szükséges: az $f(x)=x^3$ esetén $f'(0)=0$, mégsincs szélsőérték.
Elégséges: ha $f$ folytonos $a$-ban, differenciálható egy környezetében, és $f'$ előjelet vált $a$-ban ($+\to-$: lokális maximum, $-\to+$: lokális minimum), akkor ott szélsőérték van. Alternatív teszt: ha $f'(a)=0$ és $f''(a)<0$, akkor lokális maximum; ha $f''(a)>0$, akkor lokális minimum.`),
        MB.note('Konvexitás és inflexió', R`$f''>0$ az intervallumon: konvex (felfelé nyíló, „mosolygó”) görbe; $f''<0$: konkáv. Az inflexiós pontban a görbe konvexitása megváltozik, amihez az kell, hogy $f''$ előjelet váltson. Az $f''(x_0)=0$ önmagában nem elég: az $x^4$ esetén $f''(0)=0$, de $x=0$-ban nincs inflexió, mert $f''$ nem vált előjelet.`),
        MB.thm('Globális szélsőérték zárt intervallumon', R`Ha $f$ folytonos $[a,b]$-n, akkor a Weierstrass-tétel szerint felveszi a maximumát és minimumát. Jelöltek: (1) a stacionárius pontok, ahol $f'=0$; (2) a végpontok $a$ és $b$; (3) azok a pontok, ahol $f$ nem differenciálható. Mindegyikben kiszámítjuk $f$ értékét, és a legnagyobbat, illetve a legkisebbet választjuk.`),
        MB.list('Függvényvizsgálat lépései', [
          R`Értelmezési tartomány, tengelymetszetek, periodicitás, paritás.`,
          R`Határértékek az értelmezési tartomány szélein; aszimptoták.`,
          R`$f'$ kiszámítása, nullhelyei, előjeltáblázat: monotonitás és lokális szélsőértékek.`,
          R`$f''$ kiszámítása, nullhelyei, előjeltáblázat: konvexitás és inflexiós pontok.`,
          R`Értéktáblázat a nevezetes pontokban, majd vázlatrajz.`
        ]),
        MB.warn("L'Hôpital csapdái", R`(1) Ellenőrizd az alakot: $\frac{x+1}{x}$-nél nincs $0/0$, a határérték egyszerűen $1$; L'Hôpital-lal $\frac11=1$ ugyan kijön, de ez véletlen. (2) Ha a deriváltak hányadosának nincs határértéke, a szabály nem alkalmazható, az eredeti határérték még létezhet: $\frac{x+\sin x}{x}\to1$, miközben $\frac{1+\cos x}{1}$ nem tart sehova. (3) A $\frac{\sin x}{x}$ határértékre nem bizonyítás, mert $(\sin x)'=\cos x$ épp ebből származik.`)
      ],
      examples: [
        MB.example({
          title: "L'Hôpital alapeset",
          problem: R`Számítsuk ki: $\displaystyle\lim_{x\to0}\frac{\sin x}{x}$.`,
          steps: [
            R`Az alak $\frac00$, tehát a szabály alkalmazható.`,
            R`Deriváltak: $(\sin x)'=\cos x$, $(x)'=1$.`,
            R`$\lim_{x\to0}\frac{\cos x}{1}=\cos0=1$.`,
            R`Megjegyzés: ez csak számolási ellenőrzés, nem bizonyítás — a képlet körkörös lenne. A bizonyítás az 5.2 fejezet rendőrelves érvelése.`
          ],
          answer: R`$1$`
        }),
        MB.example({
          title: 'Teljes függvényvizsgálat',
          problem: R`Vizsgáljuk az $f(x)=x^3-3x$ függvényt: monotonitás, szélsőértékek, konvexitás.`,
          steps: [
            R`$f'(x)=3x^2-3=3(x-1)(x+1)$, nullhelyek $x=\pm1$.`,
            R`Előjel: $x<-1$ esetén $f'>0$ (nő), $-1<x<1$ esetén $f'<0$ (csökken), $x>1$ esetén $f'>0$ (nő).`,
            R`Ezért $x=-1$-ben lokális maximum, $x=1$-ben lokális minimum. Értékek: $f(-1)=2$, $f(1)=-2$.`,
            R`$f''(x)=6x$: $x<0$ konkáv, $x>0$ konvex, $x=0$-ban inflexió (érték $0$).`
          ],
          answer: R`Max: $(-1,2)$; min: $(1,-2)$; inflexió: $(0,0)$; nő: $(-\infty,-1)\cup(1,\infty)$, csökken: $(-1,1)$.`
        }),
        MB.example({
          title: 'Inflexió második deriválttal',
          problem: R`Határozzuk meg az $f(x)=e^{-x^2}$ függvény inflexiós pontjait.`,
          steps: [
            R`$f'(x)=-2xe^{-x^2}$.`,
            R`$f''(x)=-2e^{-x^2}+(-2x)(-2x)e^{-x^2}=(4x^2-2)e^{-x^2}$.`,
            R`$f''=0$ pontosan akkor, ha $4x^2-2=0$, azaz $x=\pm\frac{1}{\sqrt2}$.`,
            R`Az $e^{-x^2}>0$ tényező miatt $f''$ előjelét $4x^2-2$ adja: $|x|>\frac{1}{\sqrt2}$ esetén pozitív, között negatív — tehát mindkét helyen előjelváltás van.`
          ],
          answer: R`$x=\pm\dfrac{1}{\sqrt2}$, az érték $e^{-1/2}=\dfrac{1}{\sqrt e}$`
        }),
        MB.example({
          title: 'Globális szélsőérték zárt intervallumon',
          problem: R`Határozzuk meg az $f(x)=x^3-3x$ függvény globális maximumát és minimumát a $[0,3]$ intervallumon.`,
          steps: [
            R`Stacionárius pontok: $f'(x)=3x^2-3=0$ → $x=\pm1$; a $[0,3]$-ba csak $x=1$ esik.`,
            R`Értékek a jelöltekben: $f(0)=0$, $f(1)=1-3=-2$, $f(3)=27-9=18$.`,
            R`Nem differenciálható pont nincs, a végpontokat figyelembe vettük.`,
            R`A legnagyobb érték $18$ (az $x=3$ végpontban), a legkisebb $-2$ (az $x=1$-ben).`
          ],
          answer: R`Maximum: $18$ ($x=3$); minimum: $-2$ ($x=1$).`
        })
      ],
      mistakes: [
        R`A zárt intervallumos szélsőértéknél csak a stacionárius pontokat vizsgáljuk, a végpontokat nem — pedig a maximum épp ott lehet.`,
        R`Az $f'(a)=0$ feltételt elégségesnek tekintjük: az $x^3$-nak $0$-ban nincs szélsőértéke, noha a derivált nulla.`,
        R`Inflexiónak nevezzük az $f''=0$ helyet előjelváltás nélkül (pl. $x^4$ a $0$-ban).`,
        R`L'Hôpital-t olyan törtre alkalmazzuk, amely nem $0/0$ vagy $\infty/\infty$ alakú, vagy olyankor, amikor a deriváltak hányadosának nincs határértéke.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Számítsd ki L'Hôpital-lal: $\displaystyle\lim_{x\to0}\frac{e^x-1}{x}$.`, a: '1', type: 'number', hint: R`$0/0$ alak; deriváld a számlálót és a nevezőt.`, sol: R`$\frac{e^x}{1}\to1$.` }),
        MB.q({ level: 1, q: R`Számítsd ki: $\displaystyle\lim_{x\to\infty}\frac{\ln x}{x}$.`, a: '0', type: 'number', hint: R`$\infty/\infty$ alak; L'Hôpital után $\frac{1/x}{1}$.`, sol: R`$\frac{1/x}{1}=\frac1x\to0$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\lim_{x\to0}\frac{e^x-1-x}{x^2}$.`, a: '1/2', alt: ['0.5'], type: 'expr', hint: R`Kétszer kell L'Hôpital-t alkalmazni.`, sol: R`Először $\frac{e^x-1}{2x}$, majd $\frac{e^x}{2}\to\frac12$.` }),
        MB.q({ level: 2, q: R`Hány lokális szélsőértéke van az $f(x)=x^3-3x$ függvénynek?`, a: '2', type: 'number', hint: R`$f'=3(x-1)(x+1)$; mindkét helyen előjelet vált.`, sol: R`$x=-1$ (maximum) és $x=1$ (minimum), tehát kettő.` }),
        MB.q({ level: 2, q: R`Mennyi az $f(x)=x^2e^{-x}$ függvény lokális maximumának értéke?`, a: '4/e^2', alt: ['4e^-2', '4*e^(-2)'], type: 'expr', hint: R`$f'(x)=x(2-x)e^{-x}$; a maximum $x=2$-ben van.`, sol: R`$f(2)=4e^{-2}=\frac{4}{e^2}$.` }),
        MB.q({ level: 2, q: R`Hány inflexiós pontja van az $f(x)=e^{-x^2}$ függvénynek?`, a: '2', type: 'number', hint: R`$f''=(4x^2-2)e^{-x^2}$.`, sol: R`$f''=0$ az $x=\pm\frac{1}{\sqrt2}$ helyeken, és mindkettőben előjelet vált: két inflexiós pont.` }),
        MB.q({ level: 3, q: R`Határozd meg az $f(x)=x+\dfrac4x$ függvény minimumának értékét a $[1,4]$ intervallumon.`, a: '4', type: 'number', hint: R`$f'(x)=1-\frac{4}{x^2}$, stacionárius pont $x=2$; vizsgáld a végpontokat is.`, sol: R`$f'(x)=0\Rightarrow x=2$, $f(2)=4$; a végpontokban $f(1)=f(4)=5$. A minimum tehát $4$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy ha $f$ folytonos $[a,b]$-n, differenciálható $(a,b)$-n és $f'>0$, akkor $f$ szigorúan növekvő.`, type: 'proof', hint: R`Használd a Lagrange-középértéktételt két tetszőleges $x_1<x_2$ pontra.`, sol: R`Legyen $a\le x_1<x_2\le b$. A Lagrange-középértéktétel szerint létezik $\xi\in(x_1,x_2)$, amelyre $f(x_2)-f(x_1)=f'(\xi)(x_2-x_1)$. Mivel $f'(\xi)>0$ és $x_2-x_1>0$, a jobb oldal pozitív, tehát $f(x_2)>f(x_1)$: a függvény szigorúan növekvő.` })
      ],
      video: { id: 'AdLwcT9ztU0', title: 'Deriválás definíció alapján', channel: 'Felsőfok', kind: 'VIDEÓ' }
    }
  ]
});
