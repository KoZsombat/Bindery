var R = String.raw;
MB.section({
  id: 'hatarertek', num: '05', title: 'Függvények határértéke és folytonossága', subtitle: 'A pontbeli viselkedés',
  examTag: 'ZH1',
  intro: 'A határérték az analízis központi fogalma: nem azt kérdezi, mennyi a függvény értéke egy pontban, hanem azt, mihez tart, amikor a bemenet egyre közelebb kerül a ponthoz. A derivált, az integrál, a folytonosság és az aszimptoták mind erre a kérdésre épülnek. Ez a rész a definícióval kezd, majd a kiszámítás rutinjaival folytatja.',
  chapters: [
    {
      id: 'fuggveny-hatarertek', num: '5.1', title: 'Határérték és folytonosság', minutes: 35,
      lead: 'A vitathatatlanul egyetemi rész: $$\\lim_{x\\to a}f(x)=L.$$ A definíció két játékos alkuja — te adsz $\\varepsilon$-t, a függvény ad $\\delta$-t. A rutin (beszorzás, kiemelés, rendőrelv) csak ezután jön, és a folytonosság sem más, mint a határérték és a helyettesítési érték egybeesése.',
      why: [
        'Egy függvény pontbeli viselkedése két külön kérdésre bomlik: mi az $f(a)$ érték, és mihez tart $f(x)$, ha $x\\to a$. A derivált definíciójában például a differenciahányadosban $h=0$-t nem lehet behelyettesíteni, csak a $h\\to0$ határértéket venni — ezért a derivált létezése tisztán határérték-kérdés. Ugyanígy a folytonosság, az aszimptota és később az improprius integrál is határértékkel van definiálva, nem pedig „ránézésre”.',
        'Az $\\varepsilon$–$\\delta$ definíció nem öncélú formalizmus: pontosan azt rögzíti, hogy „tetszőlegesen közel kerül”, és ezt a megfogalmazást használjuk minden bizonyításban. A gyakorlatban két dolgot kell megtanulni: (1) hogyan lehet a definícióból $\\delta$-t adott $\\varepsilon$-hoz megkonstruálni (lineáris esetben $\\delta=\\varepsilon/|m|$), és (2) hogyan lehet a definíciót cáfolni — ehhez elég két olyan sorozatot mutatni, amelyek ugyanahhoz a ponthoz tartanak, de a függvényértékek különböző határértékhez.'
      ],
      when: 'A ZH1 első nagy témaköre. Akkor kell elővenni, amikor: tört határértékét kell kiszámolni $0/0$ alakban; egy darabonként definiált függvény illesztési paraméterét kell megadni; folytonosságot vagy szakadási pont típusát kell eldönteni; vagy egy állítást $\\varepsilon$–$\\delta$ módon kell bizonyítani. Minden későbbi fejezet (derivált, integrál, sorok) ezen a nyelven íródott.',
      theory: [
        MB.def('Határérték (ε–δ)', R`Legyen $f$ értelmezve az $a$ pont valamely környezetében (esetleg magában $a$-ban nem). Azt mondjuk, hogy $\lim_{x\to a}f(x)=L$, ha minden $\varepsilon>0$ számhoz létezik olyan $\delta>0$, hogy
$$0<|x-a|<\delta \ \Longrightarrow\ |f(x)-L|<\varepsilon.$$
A $0<$ feltétel azt jelenti, hogy az $a$ pontot magát kizárjuk: a határérték nem függ attól, hogy $f(a)$ létezik-e, és ha létezik, mennyi.`),
        MB.note('Hogyan kell olvasni a definíciót', R`Két játékos: a kihívó megad egy $\varepsilon$ hibakorlátot („ennél jobban közelíts”), mi pedig válaszolunk egy $\delta$-val („ha ennél közelebb jössz, akkor teljesül”). A sorrend kötött: $\delta$ függhet $\varepsilon$-tól, de $\varepsilon$-tól nem szabad függenie $\delta$-nak. A definíció akkor igaz, ha minden $\varepsilon$-ra van jó $\delta$ — egyetlen $\varepsilon$ ellenpéldája is cáfolja az állítást.`),
        MB.def('Féloldali határérték', R`$\lim_{x\to a^-}f(x)=L$ (bal oldali), ha csak az $x<a$ pontokat tekintjük; $\lim_{x\to a^+}f(x)=L$ (jobb oldali), ha csak az $x>a$ pontokat. Kétoldali határérték pontosan akkor létezik és egyenlő $L$-lel, ha mindkét féloldali határérték létezik és $L$-lel egyenlő.`),
        MB.thm('Átviteli elv (sorozatokkal)', R`$\lim_{x\to a}f(x)=L$ pontosan akkor, ha minden olyan $(x_n)$ sorozatra, amelyre $x_n\to a$ és $x_n\neq a$, teljesül $f(x_n)\to L$.
Ennek a cáfoló iránya a leggyakrabban használt eszköz: ha találunk két sorozatot, $x_n\to a$ és $y_n\to a$ mellett $f(x_n)\to L_1$, $f(y_n)\to L_2$ és $L_1\neq L_2$, akkor a határérték nem létezik.`),
        MB.def('Folytonosság', R`$f$ folytonos az $a$ pontban, ha $f$ értelmezve van $a$-ban, létezik a határérték, és
$$\lim_{x\to a}f(x)=f(a).$$
Ez három feltétel együtt: létezik $f(a)$, létezik a határérték, és a kettő egyenlő. Intervallumon folytonos, ha annak minden belső pontjában folytonos; zárt intervallumon a végpontokban a megfelelő féloldali folytonosságot is megköveteljük.`),
        MB.list('Szakadási pontok típusai', [
          R`Megszüntethető: a határérték létezik és véges, de $f(a)$ nem létezik vagy nem egyenlő vele. Példa: $\frac{x^2-4}{x-2}$ az $x=2$-ben (határérték $4$).`,
          R`Ugrás: mindkét féloldali határérték véges, de különbözik. Példa: $\frac{x}{|x|}$ az $x=0$-ban ($-1$ és $+1$).`,
          R`Végtelen (pólus): valamelyik féloldali határérték $\pm\infty$. Példa: $\frac{1}{x^2}$ az $x=0$-ban.`,
          R`Lényeges (oszcilláló): még a féloldali határérték sem létezik. Példa: $\sin\frac1x$ az $x=0$-ban.`
        ]),
        MB.note('Rendőrelv (szorítótétel)', R`Ha $g(x)\le f(x)\le h(x)$ az $a$ egy környezetében, és $\lim_{x\to a}g(x)=\lim_{x\to a}h(x)=L$, akkor $\lim_{x\to a}f(x)=L$ is teljesül. Ezzel kezeljük az oszcilláló tényezőket: $x\sin\frac1x\to0$, mert $-|x|\le x\sin\frac1x\le|x|$. Műveletek: összeg, szorzat, hányados (nem nulla nevező mellett) és összetett függvény határértéke a határértékekből számolható.`),
        MB.warn('A $0/0$ nem eredmény', R`Ha behelyettesítéskor $\frac00$ alakot kapsz, az nem azt jelenti, hogy a határérték nem létezik, hanem azt, hogy a függvény a pontban „lyukas”, és algebrai átalakítás kell. A $\frac00$ csupán annyit mond, hogy a számláló és a nevező is eltűnik — a hányados határértéke lehet $0$, véges nem nulla, $\pm\infty$ vagy nem létező. Soha ne írd le, hogy „$=0/0$”, mert az nem szám. A trigonometrikus függvények folytonossága viszont ingyen jön: $\lim_{x\to0}\sin x=0$ és $\lim_{x\to0}\cos x=1$.`)
      ],
      examples: [
        MB.example({
          title: '0/0 alak szorzattá alakítással',
          problem: R`Számítsuk ki: $\displaystyle\lim_{x\to2}\frac{x^2-4}{x^2-2x}$.`,
          steps: [
            R`Behelyettesítés: $\frac{4-4}{4-4}=\frac00$, tehát átalakítás kell.`,
            R`Számláló: $x^2-4=(x-2)(x+2)$; nevező: $x^2-2x=x(x-2)$.`,
            R`A közös $(x-2)$ tényezővel egyszerűsítünk, ami $x\neq2$ esetén megengedett: $\frac{(x-2)(x+2)}{x(x-2)}=\frac{x+2}{x}$.`,
            R`Most már behelyettesíthető: $\frac{2+2}{2}=2$.`
          ],
          answer: R`$2$`
        }),
        MB.example({
          title: 'Másodfokú tényezőkre bontás',
          problem: R`Számítsuk ki: $\displaystyle\lim_{x\to3}\frac{x^2-5x+6}{x-3}$.`,
          steps: [
            R`Behelyettesítés: $\frac{9-15+6}{0}=\frac00$.`,
            R`A számláló gyökei $2$ és $3$ (Viète: összeg $5$, szorzat $6$), ezért $x^2-5x+6=(x-2)(x-3)$.`,
            R`Egyszerűsítés: $\frac{(x-2)(x-3)}{x-3}=x-2$ ($x\neq3$).`,
            R`Határérték: $3-2=1$.`
          ],
          answer: R`$1$`
        }),
        MB.example({
          title: 'Rendőrelv oszcilláló tényezővel',
          problem: R`Mutassuk meg, hogy $\displaystyle\lim_{x\to0}x\sin\frac1x=0$.`,
          steps: [
            R`A $\sin\frac1x$ tényező $x=0$ közelében végtelen sokszor vált előjelet, határértéke nem létezik — de korlátos: $\left|\sin\frac1x\right|\le1$.`,
            R`Ezért $0\le\left|x\sin\frac1x\right|\le|x|$.`,
            R`$|x|\to0$, ha $x\to0$, tehát a rendőrelv szerint a közrefogott kifejezés is $0$-hoz tart.`,
            R`Következtetés: a szorzat határértéke $0$, noha az egyik tényezőnek nincs határértéke.`
          ],
          answer: R`$0$`
        }),
        MB.example({
          title: 'Szakadási pont osztályozása',
          problem: R`Elemezzük az $f(x)=\dfrac{x^2-1}{x-1}$ ($x\neq1$), $f(1)=3$ függvényt az $x=1$ pontban.`,
          steps: [
            R`A határérték: $\frac{x^2-1}{x-1}=\frac{(x-1)(x+1)}{x-1}=x+1\to2$.`,
            R`A helyettesítési érték: $f(1)=3$.`,
            R`A határérték létezik és véges ($2$), de nem egyenlő $f(1)$-gyel, ezért a függvény nem folytonos $x=1$-ben.`,
            R`A szakadás megszüntethető: az $f(1)=2$ átdefiniálással folytonossá válik. (Ha csak a határértéket nézzük, a „lyuk” típusú szakadást látjuk.)`
          ],
          answer: R`Megszüntethető szakadás; a folytonos kiterjesztés értéke $f(1)=2$.`
        })
      ],
      mistakes: [
        R`Behelyettesítés után $\frac00$-t írunk eredménynek, és nem alakítunk tovább.`,
        R`Azt hisszük, hogy a határértékhez $f(a)$-nak léteznie kell. Például $\frac{\sin x}{x}$-nek $x=0$-ban nincs értéke, a határértéke mégis $1$.`,
        R`Két féloldali határértéket összeadunk vagy „átlagolunk” — ha különböznek, a kétoldali határérték nem létezik.`,
        R`Az egyszerűsítést megengedhetetlen esetre is elvégezzük: $\frac{x^2-4}{x-2}=x+2$ csak $x\neq2$ mellett, és pont ezért lehet a határértéket venni.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Számítsd ki: $\displaystyle\lim_{x\to3}\frac{x^2-9}{x-3}$.`, a: '6', type: 'number', hint: R`$x^2-9=(x-3)(x+3)$.`, sol: R`$\frac{(x-3)(x+3)}{x-3}=x+3\to6$.` }),
        MB.q({ level: 1, q: R`Számítsd ki: $\displaystyle\lim_{x\to0}\frac{\sqrt{1+x}-1}{x}$.`, a: '1/2', alt: ['0.5'], type: 'expr', hint: R`Bővítsd a törtet $\sqrt{1+x}+1$-gyel (konjugált).`, sol: R`$\frac{(1+x)-1}{x(\sqrt{1+x}+1)}=\frac{1}{\sqrt{1+x}+1}\to\frac12$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\lim_{x\to1}\frac{x^3-1}{x-1}$.`, a: '3', type: 'number', hint: R`$x^3-1=(x-1)(x^2+x+1)$.`, sol: R`Egyszerűsítés után $x^2+x+1\to3$.` }),
        MB.q({ level: 2, q: R`Legyen $f(x)=x+1$, ha $x<0$, és $f(x)=x^2+2$, ha $x\ge0$. Létezik-e $\lim_{x\to0}f(x)$?`, type: 'choice', choices: ['Igen, értéke 1', 'Igen, értéke 2', 'Nem, mert a féloldali határértékek különböznek', 'Nem, mert $f$ nem folytonos'], a: '2', sol: R`Balról $x+1\to1$, jobbról $x^2+2\to2$. A két féloldali határérték különbözik, ezért a kétoldali határérték nem létezik.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\lim_{x\to0}x^2\sin\frac1x$.`, a: '0', type: 'number', hint: R`Rendőrelv: $0\le|x^2\sin(1/x)|\le x^2$.`, sol: R`A szinusz korlátos, ezért $|x^2\sin(1/x)|\le x^2\to0$, tehát a határérték $0$.` }),
        MB.q({ level: 2, q: R`Milyen $k$ érték mellett lesz folytonos az $f(x)=\dfrac{x^2-9}{x-3}$ ($x\neq3$), $f(3)=k$ függvény az $x=3$ pontban?`, a: '6', type: 'number', hint: R`A folytonossághoz $k$ a határértékkel kell egyenlő legyen.`, sol: R`$\frac{x^2-9}{x-3}=x+3\to6$, ezért $k=6$ kell.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be a definíció alapján, hogy $\displaystyle\lim_{x\to2}(3x-1)=5$.`, type: 'proof', hint: R`Adott $\varepsilon$-hoz válassz $\delta=\varepsilon/3$-at, és becsüld $|(3x-1)-5|$-öt.`, sol: R`$|(3x-1)-5|=|3x-6|=3|x-2|$. Adott $\varepsilon>0$-hoz legyen $\delta=\varepsilon/3$. Ekkor $0<|x-2|<\delta$ esetén $|f(x)-5|=3|x-2|<3\delta=\varepsilon$, tehát a definíció teljesül.` }),
        MB.q({ level: 3, q: R`Számítsd ki: $\displaystyle\lim_{x\to0}\frac{1-\cos x}{x^2}$.`, a: '1/2', alt: ['0.5'], type: 'expr', hint: R`Használd az $1-\cos x=2\sin^2\frac x2$ azonosságot.`, sol: R`$\frac{2\sin^2(x/2)}{x^2}=2\left(\frac{\sin(x/2)}{x}\right)^2=\frac12\left(\frac{\sin(x/2)}{x/2}\right)^2\to\frac12$.` })
      ],
      video: { title: 'Függvények határértéke és folytonossága', channel: 'Magyar matematika csatornák', kind: 'KERESÉS', search: 'függvény határérték epsilon delta definíció folytonosság magyar előadás' }
    },
    {
      id: 'fuggveny-nevezetes', num: '5.2', title: 'Nevezetes határértékek, aszimptoták', minutes: 30,
      lead: 'Néhány határérték annyiszor fordul elő, hogy érdemes készletből tudni: $\\frac{\\sin x}{x}$, $\\frac{e^x-1}{x}$, $\\frac{\\ln(1+x)}{x}$, $\\left(1+\\frac ax\\right)^x$. Ugyanezek a határértékek adják meg a függvény viselkedését a végtelenben és a pólusoknál — vagyis az aszimptotákat.',
      why: [
        'A $\\frac{\\sin x}{x}\\to1$ határérték nem érdekesség: ebből származik a $(\\sin x)\'=\\cos x$ derivált, és ezen keresztül az összes trigonometrikus derivált és integrál. Hasonlóan, a $\\frac{e^x-1}{x}\\to1$ határérték adja az $(e^x)\'=e^x$ tulajdonságot, a $\\frac{\\ln(1+x)}{x}\\to1$ pedig a $(\\ln x)\'=1/x$ képletet. Aki ezeket a határértékeket érti, az a derivált táblázatot nem bemagolja, hanem le tudja vezetni.',
        'Az $\\left(1+\\frac ax\\right)^x\\to e^a$ határérték a folytonos kamatos kamat modellje, és a $e$ szám természetes definíciója. Az aszimptoták pedig ugyanezt a gondolatot viszik tovább: a végtelenbeli határérték mondja meg, hogy a függvény kilaposodik-e egy vízszintes egyenesre, vagy egy ferde egyenest követ. A ferde aszimptota $m$ és $b$ paramétere nem varázslat, hanem pontosan az a két határérték, amelyet a fejezet definíciói adnak.'
      ],
      when: 'Határérték-számításnál, ha trigonometrikus, exponenciális vagy logaritmikus kifejezés áll $0/0$ alakban; függvényvizsgálatnál az értelmezési tartomány szélein és a pólusoknál; deriváltak levezetésénél; és minden olyan feladatnál, ahol „mennyi a határérték a végtelenben” a kérdés. A ZH-ban jellemzően 2–3 rövid számolás és egy aszimptota-feladat van ebből a körből.',
      theory: [
        MB.formula('Nevezetes határértékek', R`\begin{aligned}
\lim_{x\to0}\frac{\sin x}{x} &= 1, & \lim_{x\to0}\frac{\tan x}{x} &= 1,\\
\lim_{x\to0}\frac{e^x-1}{x} &= 1, & \lim_{x\to0}\frac{\ln(1+x)}{x} &= 1,\\
\lim_{x\to0}(1+x)^{1/x} &= e, & \lim_{x\to\infty}\left(1+\frac ax\right)^x &= e^a.
\end{aligned}`, R`Az $\left(1+\frac ax\right)^x=\left[\left(1+\frac ax\right)^{x/a}\right]^a$ átírásban az $u=\frac xa$ helyettesítéssel a belső zárójel $e$-hez tart, ezért a határérték $e^a$ (negatív $a$-ra is). Ugyanez az átírás adja az $a^x=e^{x\ln a}$ azonosságot.`),
        MB.note('Honnan jön a sin x/x → 1?', R`A $0<x<\frac\pi2$ tartományon a területek összehasonlításából $\sin x<x<\tan x$, amiből $\cos x<\frac{\sin x}{x}<1$. Mivel $\cos x\to1$, a rendőrelv szerint a hányados is $1$-hez tart. Ez a bizonyítás kulcsfontosságú: a derivált-táblázat trigonometrikus része erre épül, ezért nem bizonyítható később L'Hôpital-lal — az körben forgó érvelés lenne.`),
        MB.def('Függőleges aszimptota', R`Az $x=a$ egyenes függőleges aszimptota, ha $\lim_{x\to a^-}f(x)=\pm\infty$ vagy $\lim_{x\to a^+}f(x)=\pm\infty$ (a két oldal előjele eltérhet). Tört esetén ott kell keresni, ahol a nevező nulla, de a számláló nem — ha mindkettő nulla, előbb egyszerűsíteni kell.`),
        MB.def('Vízszintes és ferde aszimptota', R`Az $y=c$ vízszintes aszimptota, ha $\lim_{x\to\infty}f(x)=c$ vagy $\lim_{x\to-\infty}f(x)=c$. Az $y=mx+b$ ferde aszimptota paraméterei:
$$m=\lim_{x\to\infty}\frac{f(x)}{x},\qquad b=\lim_{x\to\infty}\bigl(f(x)-mx\bigr),$$
feltéve, hogy mindkét határérték véges. A vízszintes aszimptota ennek az $m=0$ esete, ezért a kettő együtt kezelhető.`),
        MB.note("L'Hôpital előzetes", R`A szabály: ha $\frac{f(x)}{g(x)}$ $0/0$ vagy $\infty/\infty$ alakú, és a deriváltak hányadosának van határértéke, akkor $\lim\frac fg=\lim\frac{f'}{g'}$. Két figyelmeztetés. (1) Csak a két határozatlan alaknál használható; $\frac{2}{0}$-ra nem. (2) Nem bizonyítja a $\frac{\sin x}{x}$ határértéket, mert a $(\sin x)'=\cos x$ képlet épp ebből a határértékből következik. Számolni viszont kényelmes, és a 6.4-ben részletesen visszatérünk rá.`),
        MB.list('Gyors áttekintés: mit hogyan', [
          R`$\frac{\sin(ax)}{x}\to a$, mert $\frac{\sin(ax)}{ax}\cdot a\to1\cdot a$.`,
          R`$\frac{e^{ax}-1}{x}\to a$, mert $\frac{e^{ax}-1}{ax}\cdot a\to a$.`,
          R`$\frac{\ln(1+ax)}{x}\to a$, mert $\frac{\ln(1+ax)}{ax}\cdot a\to a$.`,
          R`$\left(1+\frac ax\right)^{bx}\to e^{ab}$, mert a korábbi határérték $b$-edik hatványa.`
        ]),
        MB.warn('A hatvány-alak csapdája', R`Az $1^\infty$ határozatlan alak! Az $\left(1+\frac1x\right)^x$-ben $x\to\infty$ mellett az alap $1$-hez, a kitevő $\infty$-hez tart, a határérték mégsem $1$, hanem $e$. Soha ne helyettesítsd be a részek határértékét külön-külön, ha az eredmény $1^\infty$, $0^0$ vagy $\infty^0$ lenne.`),
        MB.note('Aszimptota polinomosztással', R`Ha a számláló foka pontosan eggyel nagyobb a nevezőénél, a ferde aszimptota a polinomosztás egész része. Például $\frac{2x^2+1}{x-1}=2x+2+\frac{3}{x-1}$, így a ferde aszimptota $y=2x+2$; a maradék pedig megmutatja, melyik oldalról közelít a függvény az egyeneshez. A nagyságrendekre pedig $\ln x\ll x^k\ll e^x$, ezért $\frac{\ln x}{x}\to0$.`)
      ],
      examples: [
        MB.example({
          title: 'sin(5x)/x',
          problem: R`Számítsuk ki: $\displaystyle\lim_{x\to0}\frac{\sin 5x}{x}$.`,
          steps: [
            R`Az alaphatárérték $\frac{\sin u}{u}\to1$.`,
            R`Bővítsünk $5$-tel: $\frac{\sin5x}{x}=5\cdot\frac{\sin5x}{5x}$.`,
            R`Az $u=5x$ helyettesítéssel $u\to0$, ezért a második tényező $1$-hez tart.`,
            R`Határérték: $5\cdot1=5$.`
          ],
          answer: R`$5$`
        }),
        MB.example({
          title: 'Másodrendű tag exponenciálisból',
          problem: R`Számítsuk ki: $\displaystyle\lim_{x\to0}\frac{e^x-1-x}{x^2}$.`,
          steps: [
            R`Behelyettesítés: $\frac{1-1-0}{0}=\frac00$.`,
            R`L'Hôpital egyszer: $\frac{e^x-1}{2x}$, ami még mindig $\frac00$.`,
            R`L'Hôpital másodszor: $\frac{e^x}{2}$.`,
            R`Behelyettesítés: $\frac{1}{2}$, tehát a határérték $\frac12$. (Taylor-sorral ugyanez: $e^x=1+x+\frac{x^2}{2}+o(x^2)$.)`
          ],
          answer: R`$\dfrac12$`
        }),
        MB.example({
          title: 'Aszimptoták meghatározása',
          problem: R`Határozzuk meg az $f(x)=\dfrac{2x^2+1}{x-1}$ függvény aszimptotáit.`,
          steps: [
            R`Függőleges: a nevező $x=1$-nél nulla, a számláló itt $3\neq0$, ezért $\lim_{x\to1^\pm}f(x)=\pm\infty$ — az $x=1$ függőleges aszimptota.`,
            R`Polinomosztás: $2x^2+1=(x-1)(2x+2)+3$, azaz $f(x)=2x+2+\frac{3}{x-1}$.`,
            R`Ferden: $m=\lim\frac{f(x)}{x}=2$, $b=\lim(f(x)-2x)=2$, tehát $y=2x+2$.`,
            R`Vízszintes nincs, mert $f(x)\to\pm\infty$ a két irányban.`
          ],
          answer: R`$x=1$ (függőleges), $y=2x+2$ (ferde); vízszintes aszimptota nincs.`
        }),
        MB.example({
          title: 'Hatvány-alak a végtelenben',
          problem: R`Számítsuk ki: $\displaystyle\lim_{x\to\infty}\left(1+\frac2x\right)^x$.`,
          steps: [
            R`Írjuk át: $\left(1+\frac2x\right)^x=\left[\left(1+\frac2x\right)^{x/2}\right]^{2}$.`,
            R`Az $u=\frac x2\to\infty$ helyettesítéssel a belső zárójel $\left(1+\frac1u\right)^u\to e$.`,
            R`A külső hatvány folytonos, ezért a határérték $e^2$.`
          ],
          answer: R`$e^2$`
        })
      ],
      mistakes: [
        R`Azt gondoljuk, hogy $\frac{\sin 5x}{x}\to0$, „mert a szinusz kicsi”. Valójában $5$-höz tart, mert a belső $5x$ és a nevező $x$ aránya számít.`,
        R`Az $\left(1+\frac1x\right)^x$-nél külön vesszük a részek határértékét és $1^\infty=1$-et írunk. A helyes érték $e$.`,
        R`A ferde aszimptotánál csak $m$-et számoljuk ki, a $b$ eltolást elfelejtjük — pedig $y=mx$ és $y=mx+b$ nem ugyanaz az egyenes.`,
        R`L'Hôpital-t nem $0/0$ vagy $\infty/\infty$ alaknál is alkalmazzuk, például $\frac{x+1}{x}$-nél, ahol a válasz egyszerűen $1$.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Számítsd ki: $\displaystyle\lim_{x\to0}\frac{\sin 3x}{x}$.`, a: '3', type: 'number', hint: R`$\frac{\sin3x}{x}=3\cdot\frac{\sin3x}{3x}$.`, sol: R`$3\cdot1=3$.` }),
        MB.q({ level: 1, q: R`Számítsd ki: $\displaystyle\lim_{x\to0}\frac{e^x-1}{x}$.`, a: '1', type: 'number', hint: R`Nevezetes határérték.`, sol: R`A nevezetes határérték szerint $1$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\lim_{x\to0}\frac{e^{2x}-1}{x}$.`, a: '2', type: 'number', hint: R`Bővíts $2$-vel: $\frac{e^{2x}-1}{2x}\cdot2$.`, sol: R`$2\cdot1=2$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\lim_{x\to0}\frac{\ln(1+5x)}{x}$.`, a: '5', type: 'number', hint: R`$\frac{\ln(1+5x)}{5x}\cdot5$.`, sol: R`A nevezetes határérték szerint $1\cdot5=5$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\lim_{x\to\infty}\left(1+\frac3x\right)^x$. Add meg zárt alakban.`, a: 'e^3', alt: ['exp(3)', 'e**3', 'e^3'], type: 'expr', hint: R`Rendezd át $\left[\left(1+\frac3x\right)^{x/3}\right]^3$ alakra.`, sol: R`A belső rész $e$-hez tart, ezért a határérték $e^3$.` }),
        MB.q({ level: 2, q: R`Mi a ferde aszimptota egyenlete az $f(x)=\dfrac{x^2+1}{x-1}$ függvénynél?`, a: 'y=x+1', alt: ['x+1', 'y = x + 1'], type: 'text', hint: R`Végezd el a polinomosztást: $x^2+1=(x-1)(x+1)+2$.`, sol: R`$f(x)=x+1+\frac{2}{x-1}$, ezért $m=1$, $b=1$, az aszimptota $y=x+1$.` }),
        MB.q({ level: 3, q: R`Számítsd ki: $\displaystyle\lim_{x\to0}\frac{\tan x}{x}$.`, a: '1', type: 'number', hint: R`$\tan x=\frac{\sin x}{\cos x}$, és $\cos x\to1$.`, sol: R`$\frac{\tan x}{x}=\frac{\sin x}{x}\cdot\frac{1}{\cos x}\to1\cdot1=1$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy $\displaystyle\lim_{x\to0}\frac{\sin x}{x}=1$.`, type: 'proof', hint: R`Használd a $0<x<\frac\pi2$ esetén érvényes $\sin x<x<\tan x$ egyenlőtlenséget, és a rendőrelvet.`, sol: R`$0<x<\frac\pi2$ esetén a területek összehasonlításából $\sin x<x<\tan x$. Elosztva $\sin x>0$-val: $1<\frac{x}{\sin x}<\frac{1}{\cos x}$, azaz $\cos x<\frac{\sin x}{x}<1$. Mivel $\cos x\to1$, a rendőrelv szerint $\frac{\sin x}{x}\to1$. Páratlan függvény lévén az állítás negatív $x$-re is igaz.` })
      ],
      video: { list: 'PLDNTiqexHdaBWTDDKSd7lclvowbGcY-VU', title: 'Felsőfok analízis', channel: 'FZsMatek', kind: 'LEJÁTSZÁSI LISTA' }
    }
  ]
});
