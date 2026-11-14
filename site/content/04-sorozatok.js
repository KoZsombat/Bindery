var R = String.raw;
MB.section({
  id: 'sorozatok', num: '04', title: 'Sorozatok', subtitle: 'A végtelen viselkedése',
  examTag: 'ZH1',
  intro: R`A sorozat végtelen sok szám felsorolása, és a „határérték” azt kérdezi, hogy hova tart ez a végtelen felsorolás. Ez az első olyan fogalom a kurzuson, ahol a „közelít”, „tetszőlegesen kicsi” kifejezéseket pontosan meg kell fogalmazni. Ezért itt nem a képletek a nehezek, hanem a definíció: az $\varepsilon$–$N$ mondat értelmezése. Ha az megy, a határértékszámítás rutin, a nevezetes határértékek és a rekurzív sorozatok pedig már csak ennek alkalmazásai.`,
  chapters: [
    {
      id: 'sorozat-konvergencia', num: '4.1', title: 'Konvergencia, korlátosság, monotonitás', minutes: 30,
      lead: R`Az $a_n\to A$ azt jelenti, hogy $A$ tetszőleges kicsi környezetébe a sorozat minden elég nagy indexű tagja beleesik. A definíció nem „közelíti” a határértéket: megad egy $\varepsilon$ sugarat, és azt kéri, hogy attól kezdve minden tag azon belül legyen.`,
      why: [
        R`Az $\varepsilon$–$N$ definíció megfordítja a szokásos gondolkodást: nem azt mondjuk, hogy a tagok „egyre közelebb kerülnek”, hanem hogy bármilyen kis $\varepsilon$ távolságot választunk, létezik egy küszöbindex, amely után már egyetlen tag sem esik kívül az $(A-\varepsilon,A+\varepsilon)$ intervallumon. A sorrend fontos: előbb jön az $\varepsilon$ (a kihívó), és csak utána válaszolunk egy $N$-nel. Ez a függőség az egész analízis alapmintája.`,
        R`A konvergenciából két erős tulajdonság következik, amelyeket becsléseknél használunk: a határérték egyértelmű, és a sorozat korlátos. Egyik sem megfordítható: a $(-1)^n$ korlátos, de nem konvergens; a monotonitás viszont a korlátossággal együtt már elégséges (ezt 4.3-ban használjuk fel). A részsorozatok nyújtják a leggyorsabb divergenciabizonyítást: ha két részsorozat különböző határértékhez tart, a sorozat nem lehet konvergens.`
      ],
      when: R`A definíciót akkor kell elővenni, ha egy határértéket bizonyítani kell, vagy ha a feladat $\varepsilon$-t, illetve $N$-et kér. A gyakorlatban a legtöbb határértéket a műveleti szabályokkal és a rendőrelvvel számoljuk (4.2), de ezek érvényessége a definíción nyugszik. A monoton–korlátos tétel a rekurzív sorozatok és a numerikus módszerek konvergenciájának standard eszköze.`,
      theory: [
        MB.def('Konvergencia, $\\varepsilon$–$N$ definíció', R`Az $(a_n)$ sorozat konvergens, és határértéke $A$, ha minden $\varepsilon>0$-hoz létezik olyan $N\in\mathbb N$, hogy minden $n>N$ esetén $|a_n-A|<\varepsilon$. Jelölés: $\lim_{n\to\infty}a_n=A$, vagy $a_n\to A$. Ha nincs ilyen $A$, a sorozat divergens.`),
        MB.thm('A határérték egyértelmű', R`Ha $a_n\to A$ és $a_n\to B$, akkor $A=B$. Bizonyítás: ha $A\neq B$, legyen $\varepsilon=\frac{|A-B|}{2}>0$. A konvergencia miatt elég nagy $n$-re $|a_n-A|<\varepsilon$ és $|a_n-B|<\varepsilon$, ezért $|A-B|\le|A-a_n|+|a_n-B|<2\varepsilon=|A-B|$, ami ellentmondás.`),
        MB.def('Korlátosság', R`Az $(a_n)$ sorozat felülről korlátos, ha létezik $K$ úgy, hogy $a_n\le K$ minden $n$-re; alulról korlátos, ha létezik $k$ úgy, hogy $a_n\ge k$; korlátos, ha mindkettő, azaz létezik $M$ úgy, hogy $|a_n|\le M$ minden $n$-re.`),
        MB.thm('Konvergens $\\Rightarrow$ korlátos', R`Minden konvergens sorozat korlátos. Bizonyítás: $\varepsilon=1$-hez van $N$, hogy $n>N$ esetén $|a_n-A|<1$, tehát $|a_n|<|A|+1$. A véges sok kezdő tag ($a_1,\dots,a_N$) maximumát véve $M=\max\{|a_1|,\dots,|a_N|,|A|+1\}$ jó korlát. A megfordítás hamis: $(-1)^n$ korlátos, de divergens.`),
        MB.formula('Műveletek határértékkel', R`\begin{aligned}
a_n\to A,\ b_n\to B &\Rightarrow a_n\pm b_n\to A\pm B,\\
a_nb_n&\to AB,\\
\frac{a_n}{b_n}&\to\frac AB\quad(B\neq0).
\end{aligned}`, R`A feltételek: mindkét sorozat konvergens. A hányadosnál elég nagy $n$-re $b_n\neq0$ is teljesül, mert $B\neq0$.`),
        MB.thm('Részsorozatok és a divergencia eszköze', R`Ha $a_n\to A$, akkor minden részsorozata is $A$-hoz tart. Következmény: ha két részsorozat különböző határértékhez tart, a sorozat divergens. Például $(-1)^n$ esetén $a_{2n}=1\to1$ és $a_{2n-1}=-1\to-1$, tehát a sorozat nem konvergens.`),
        MB.thm('Bolzano–Weierstrass-tétel', R`Minden korlátos sorozatnak van konvergens részsorozata. Ez a valós számok teljességének egy formája: a korlátos sorozatnak van torlódási pontja, és abból kiválasztható egy részsorozat.`),
        MB.warn('A definíció nem „közelítés”', R`Az $|a_n-A|<\varepsilon$ csak elég nagy $n$-re kell, nem minden $n$-re, és az $N$ függhet $\varepsilon$-tól. Az sem baj, ha a sorozat végtelen sokszor felveszi a határértéket vagy átugrálja azt — csak az számít, hogy elég nagy indextől minden tag közel legyen. Ezért konvergens a $(-1)^n/n$ sorozat is, noha előjelet vált.`)
      ],
      examples: [
        MB.example({
          title: 'Határérték a definícióból',
          problem: R`Bizonyítsuk be a definíció alapján, hogy $\lim_{n\to\infty}\dfrac1n=0$.`,
          steps: [
            R`Legyen $\varepsilon>0$ tetszőleges. Azt kell elérni, hogy $\left|\frac1n-0\right|=\frac1n<\varepsilon$.`,
            R`Ez pontosan akkor teljesül, ha $n>\frac1\varepsilon$.`,
            R`Válasszuk tehát $N=\left\lceil\frac1\varepsilon\right\rceil$ egész számot.`,
            R`Ha $n>N$, akkor $n>\frac1\varepsilon$, tehát $\frac1n<\varepsilon$, azaz $|a_n-0|<\varepsilon$.`,
            R`Mivel $\varepsilon>0$ tetszőleges volt, a definíció teljesül.`
          ],
          answer: R`$\lim\frac1n=0$, $N=\lceil1/\varepsilon\rceil$ választással`
        }),
        MB.example({
          title: 'Műveleti szabályokkal',
          problem: R`Számítsuk ki: $\lim_{n\to\infty}\dfrac{2n+1}{n}$.`,
          steps: [
            R`Alakítsuk át: $\frac{2n+1}{n}=2+\frac1n$.`,
            R`A konstans sorozat határértéke önmaga: $2\to2$.`,
            R`$\frac1n\to0$ az előző példa szerint.`,
            R`Az összeg szabálya miatt a határérték $2+0=2$.`
          ],
          answer: R`$2$`
        }),
        MB.example({
          title: 'Divergencia részsorozatokkal',
          problem: R`Mutassuk meg, hogy az $a_n=(-1)^n$ sorozat divergens.`,
          steps: [
            R`Tekintsük a páros indexű részsorozatot: $a_{2n}=(-1)^{2n}=1$, ez konstans, tehát határértéke $1$.`,
            R`A páratlan indexű részsorozat: $a_{2n-1}=(-1)^{2n-1}=-1$, határértéke $-1$.`,
            R`Ha a sorozat konvergens lenne $A$-hoz, minden részsorozata $A$-hoz tartana.`,
            R`De $1\neq-1$, ellentmondás, tehát a sorozat divergens.`
          ],
          answer: R`Divergens (két részsorozat határértéke különbözik)`
        })
      ],
      mistakes: [
        R`A definícióban a kvantorok sorrendjét felcserélni: $N$-et előbb választani, mint $\varepsilon$-t. Az $N$ mindig függ $\varepsilon$-tól.`,
        R`Azt hinni, hogy a korlátosság elégséges a konvergenciához: $(-1)^n$ ellenpélda.`,
        R`A monotonitást önmagában konvergenciának venni: az $a_n=n$ növekvő, de divergens.`,
        R`Egyetlen részsorozat konvergenciájából a teljes sorozat konvergenciájára következtetni.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Mennyi $\lim_{n\to\infty}\dfrac{n}{n+1}$?`, a: '1', type: 'number', hint: R`Oszd el a számlálót és a nevezőt is $n$-nel.`, sol: R`$\frac{n}{n+1}=\frac{1}{1+1/n}\to\frac{1}{1+0}=1$.` }),
        MB.q({ level: 2, q: R`Az $a_n=\frac1n$ sorozatnál add meg a legkisebb olyan $N$ küszöbindexet, amelyre $n>N$ esetén $|a_n|<\varepsilon$, ha $\varepsilon=0{,}01$.`, a: '100', type: 'number', hint: R`$\frac1n<0{,}01\iff n>100$. Vigyázat: $n>N$, nem $n\ge N$.`, sol: R`$n>100$ szükséges, tehát $N=100$; ekkor $n\ge101$ és $\frac1{101}<0{,}01$. $N=99$ nem jó, mert $n=100$ esetén $\frac1{100}=0{,}01$, ami nem szigorúan kisebb.` }),
        MB.q({ level: 1, q: R`Mennyi $\lim_{n\to\infty}\dfrac{(-1)^n}{n}$?`, a: '0', type: 'number', hint: R`Becsüld felülről abszolút értékben: $\left|\frac{(-1)^n}{n}\right|=\frac1n$.`, sol: R`$0\le\left|\frac{(-1)^n}{n}\right|=\frac1n\to0$, ezért a sorozat $0$-hoz tart.` }),
        MB.q({ level: 2, q: R`Add meg az $a_n=\frac{n}{n+1}$ sorozat legkisebb felső korlátját (szuprémumát).`, a: '1', type: 'number', hint: R`$a_n=1-\frac1{n+1}<1$, és a határérték $1$.`, sol: R`A sorozat szigorúan növekvő és $1$-hez tart, ezért $\sup a_n=1$ (amit nem vesz fel).` }),
        MB.q({ level: 3, q: R`Az $a_n=\frac{2n+1}{n}$ sorozatnál melyik az a legkisebb $N$, amelyre $n>N$ esetén $|a_n-2|<0{,}1$?`, a: '10', type: 'number', hint: R`$|a_n-2|=\frac1n<0{,}1\iff n>10$.`, sol: R`$n>10$, tehát $N=10$; ekkor $n\ge11$ és $\frac1{11}<0{,}1$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy minden konvergens sorozat korlátos.`, type: 'proof', hint: R`Használd a definíciót $\varepsilon=1$-gyel, majd a véges sok kezdő tagot foglald bele egy maximumba.`, sol: R`Ha $a_n\to A$, akkor $\varepsilon=1$-hez van $N$, hogy $n>N$ esetén $|a_n|<|A|+1$. Legyen $M=\max\{|a_1|,\dots,|a_N|,|A|+1\}$. Ekkor minden $n$-re $|a_n|\le M$, tehát a sorozat korlátos.` }),
        MB.q({ level: 2, q: R`Az $(a_n)$ sorozatról tudjuk, hogy $a_{2n}\to1$ és $a_{2n+1}\to2$. Konvergens-e a sorozat?`, type: 'choice', choices: ['Igen, határértéke $1$', 'Igen, határértéke $2$', 'Nem konvergens', 'Ez az adat nem dönthető el'], a: '2', hint: R`Ha konvergens lenne, minden részsorozata ugyanahhoz tartana.`, sol: R`Két részsorozat különböző határértékhez tart, ezért a sorozat nem konvergens.` }),
        MB.q({ level: 2, q: R`Mennyi $\lim_{n\to\infty}\dfrac{n+1}{2n}$?`, a: '1/2', alt: ['0.5', '(n+1)/(2n)'], type: 'expr', hint: R`Oszd el a számlálót és a nevezőt $n$-nel.`, sol: R`$\frac{1+1/n}{2}\to\frac12$.` })
      ],
      video: { id: 'E10SEHSZDZw', title: 'Sorozatok határértéke, monotonitás, korlátosság', channel: 'Felsőfok', kind: 'VIDEÓ' }
    },
    {
      id: 'sorozat-limitszamitas', num: '4.2', title: 'Határértékszámítás', minutes: 30,
      lead: R`A határértékszámítás nem definícióval megy, hanem átalakítással: a domináns tag kiemelésével, a gyökös kifejezés konjugálttal való bővítésével, vagy egy kisebb és egy nagyobb sorozat közé szorítással. A cél mindig az, hogy a kifejezés olyan alakba kerüljön, ahol a műveleti szabályok már láthatóan alkalmazhatók.`,
      why: [
        R`A végtelenben a tört értékét az dönti el, hogy a számláló és a nevező melyik tagja nő a leggyorsabban. Ha kiemeljük a domináns hatványt, a maradék tagok $1/n$ hatványai lesznek, amelyek nullához tartanak. Ezért a racionális tört határértéke három esetre bomlik: ha a számláló foka kisebb, a határérték $0$; ha egyenlő, a főegyütthatók hányadosa; ha nagyobb, a sorozat $\pm\infty$-hez tart. Nem kell külön szabályokat memorizálni, csak a kiemelést kell elvégezni.`,
        R`A gyökös különbség $\sqrt{n+4}-\sqrt n$ látszólag $\infty-\infty$, ami határozatlan. A konjugálttal való bővítés viszont véges nevezőt ad: a különbség $\frac{4}{\sqrt{n+4}+\sqrt n}$, ami nullához tart. Ez ugyanaz a trükk, mint a komplex osztásnál használt bővítés. A rendőrelv pedig akkor kell, ha a sorozat oszcillál, de abszolút értékben egy nullsorozat alatt marad, mint a $\frac{\sin n}{n}$ esetén.`
      ],
      when: R`A ZH határérték-feladatai szinte kivétel nélkül ezekre az eszközökre épülnek. Racionális törteknél mindig a domináns tag kiemelése az első lépés. Gyökös különbségnél a konjugálttal bővítés. Oszcilláló, de korlátos tényezőnél ($\sin$, $\cos$, $(-1)^n$) a rendőrelv. Exponenciális és faktoriális kifejezéseknél a 4.3 nagyságrendi listája dönt.`,
      theory: [
        MB.formula('Racionális tört határértéke', R`\begin{aligned}
\deg P<\deg Q &\Rightarrow \frac{P(n)}{Q(n)}\to0,\\
\deg P=\deg Q &\Rightarrow \frac{P(n)}{Q(n)}\to\frac{a_k}{b_k},\\
\deg P>\deg Q &\Rightarrow \left|\frac{P(n)}{Q(n)}\right|\to\infty.
\end{aligned}`, R`A módszer mindig ugyanaz: emeld ki a számlálóból és a nevezőből is a legnagyobb kitevőjű tagot.`),
        MB.note('A kiemelés konkrétan', R`$\dfrac{4n^3-2n+7}{5n^3+8n^2-1}=\dfrac{n^3\left(4-\frac2{n^2}+\frac7{n^3}\right)}{n^3\left(5+\frac8n-\frac1{n^3}\right)}=\dfrac{4-\frac2{n^2}+\frac7{n^3}}{5+\frac8n-\frac1{n^3}}\to\dfrac45$. A $n^3$ kiesik, mert a számláló és a nevező foka egyenlő.`),
        MB.formula('Gyökös különbség bővítése', R`\sqrt{n+a}-\sqrt n=\frac{a}{\sqrt{n+a}+\sqrt n}\to0,\qquad \sqrt{n^2+n}-n=\frac{n}{\sqrt{n^2+n}+n}\to\frac12.`, R`A bővítés a $\sqrt A-\sqrt B=\frac{A-B}{\sqrt A+\sqrt B}$ azonosságon alapul.`),
        MB.formula('Rendőrelv (csendőrelv)', R`Ha\quad a_n\le c_n\le b_n\quad\text{és}\quad a_n\to L,\ b_n\to L,\quad\text{akkor}\quad c_n\to L.`, R`Gyakori alkalmazás: $0\le\frac{|\sin n|}{n}\le\frac1n\to0$.`),
        MB.formula('Nagyságrendek', R`\ln n\ll n^k\ll a^n\ll n!\ll n^n\qquad(k>0,\ a>1).`, R`Azaz $\frac{n^k}{a^n}\to0$, $\frac{a^n}{n!}\to0$, $\frac{n!}{n^n}\to0$.`),
        MB.thm('Stolz–Cesàro-tétel', R`Ha $(b_n)$ szigorúan növekvő és $b_n\to\infty$, valamint $\dfrac{a_{n+1}-a_n}{b_{n+1}-b_n}\to L$, akkor $\dfrac{a_n}{b_n}\to L$ is teljesül. Ez a hányadosok határértékének „L'Hôpital-ja”, sorozatokra.`),
        MB.warn('$\\infty-\\infty$ és $\\infty/\\infty$', R`Nem szabad a határértéket tagonként venni: $\sqrt{n+4}-\sqrt n$ esetén $\infty-\infty$ adódik, ami határozatlan. Ugyanígy $\frac{4n^3+\dots}{5n^3+\dots}$ esetén a $\frac\infty\infty$ nem eredmény, hanem ok arra, hogy átalakítsuk a kifejezést. A tagonkénti határérték csak akkor érvényes, ha a művelet eredménye nem határozatlan alak.`)
      ],
      examples: [
        MB.example({
          title: 'Racionális tört domináns taggal',
          problem: R`Számítsuk ki: $\lim_{n\to\infty}\dfrac{4n^3-2n+7}{5n^3+8n^2-1}$.`,
          steps: [
            R`Mindkét polinom foka $3$, ezért emeljük ki $n^3$-t a számlálóból és a nevezőből is.`,
            R`Számláló: $n^3\left(4-\frac2{n^2}+\frac7{n^3}\right)$.`,
            R`Nevező: $n^3\left(5+\frac8n-\frac1{n^3}\right)$.`,
            R`A $n^3$ kiesik, a maradék tagok ($\frac1n$ hatványai) nullához tartanak.`,
            R`A határérték a főegyütthatók hányadosa: $\frac45$.`
          ],
          answer: R`$\dfrac45$`
        }),
        MB.example({
          title: 'Gyökös különbség',
          problem: R`Számítsuk ki: $\lim_{n\to\infty}\left(\sqrt{n+4}-\sqrt n\right)$.`,
          steps: [
            R`Ez $\infty-\infty$ alak, ezért bővítsük a konjugálttal: $\frac{(\sqrt{n+4}-\sqrt n)(\sqrt{n+4}+\sqrt n)}{\sqrt{n+4}+\sqrt n}$.`,
            R`A számláló $(n+4)-n=4$.`,
            R`Tehát a kifejezés $\frac{4}{\sqrt{n+4}+\sqrt n}$.`,
            R`A nevező $\infty$-hez tart, ezért a tört $0$-hoz.`
          ],
          answer: R`$0$`
        }),
        MB.example({
          title: 'Rendőrelv oszcilláló tényezővel',
          problem: R`Számítsuk ki: $\lim_{n\to\infty}\dfrac{\sin n}{n}$.`,
          steps: [
            R`Minden $n$-re $-1\le\sin n\le1$.`,
            R`Ebből $-\frac1n\le\frac{\sin n}{n}\le\frac1n$ (osztás pozitív $n$-nel).`,
            R`Mindkét korlát-sorozat $0$-hoz tart: $-\frac1n\to0$ és $\frac1n\to0$.`,
            R`A rendőrelv szerint a közrefogott sorozat is $0$-hoz tart.`
          ],
          answer: R`$0$`
        }),
        MB.example({
          title: 'Exponenciálisok összege gyök alatt',
          problem: R`Számítsuk ki: $\lim_{n\to\infty}\sqrt[n]{2^n+3^n}$.`,
          steps: [
            R`Emeljük ki a nagyobb alapot: $2^n+3^n=3^n\left(\left(\frac23\right)^n+1\right)$.`,
            R`$n$-edik gyök: $\sqrt[n]{3^n}\cdot\sqrt[n]{\left(\frac23\right)^n+1}=3\cdot\sqrt[n]{\left(\frac23\right)^n+1}$.`,
            R`$\left(\frac23\right)^n\to0$, ezért a gyök alatti érték $1$-hez tart.`,
            R`Pontosabban $1\le\left(\frac23\right)^n+1\le2$, így $1\le\sqrt[n]{\left(\frac23\right)^n+1}\le\sqrt[n]{2}\to1$; a rendőrelv szerint a gyök határértéke $1$.`,
            R`A határérték $3$.`
          ],
          answer: R`$3$`
        })
      ],
      mistakes: [
        R`A racionális törtnél csak a legmagasabb fokú tagokat nézni és a többit elhagyni indoklás nélkül — a helyes lépés a kiemelés.`,
        R`$\infty-\infty$-t $0$-nak venni: $\sqrt{n+4}-\sqrt n\to0$, de $\sqrt{n^2+n}-n\to\frac12$, tehát nincs általános szabály.`,
        R`A rendőrelvet rossz irányban használni: a két korlátnak ugyanahhoz az $L$-hez kell tartania.`,
        R`$\frac{\sin n}{n}$-nél azt írni, hogy $\sin n\to0$ — a $\sin n$ nem tart sehova, csak korlátos.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Mennyi $\lim_{n\to\infty}\dfrac{3n^2-n}{n^2+2}$?`, a: '3', type: 'number', hint: R`Egyenlő fokszám: a főegyütthatók hányadosa.`, sol: R`$n^2$-tel osztva $\frac{3-1/n}{1+2/n^2}\to3$.` }),
        MB.q({ level: 1, q: R`Mennyi $\lim_{n\to\infty}\dfrac{2n+5}{4n-1}$?`, a: '1/2', alt: ['0.5'], type: 'expr', hint: R`Mindkettő elsőfokú.`, sol: R`$\frac{2+5/n}{4-1/n}\to\frac24=\frac12$.` }),
        MB.q({ level: 2, q: R`Mennyi $\lim_{n\to\infty}\left(\sqrt{n^2+n}-n\right)$?`, a: '1/2', alt: ['0.5'], type: 'expr', hint: R`Bővítsd a konjugálttal: $\frac{n}{\sqrt{n^2+n}+n}$.`, sol: R`$\frac{n}{n\sqrt{1+1/n}+n}=\frac{1}{\sqrt{1+1/n}+1}\to\frac12$.` }),
        MB.q({ level: 2, q: R`Mi a $\lim_{n\to\infty}\dfrac{n^3+1}{n^2+1}$ határértéke?`, a: '∞', alt: ['+∞', 'végtelen', '+végtelen', 'divergál'], type: 'text', hint: R`A számláló foka nagyobb, mint a nevezőé.`, sol: R`$\frac{n^3+1}{n^2+1}=n\cdot\frac{1+1/n^3}{1+1/n^2}\to\infty$.` }),
        MB.q({ level: 2, q: R`Mennyi $\lim_{n\to\infty}\dfrac{n!}{n^n}$?`, a: '0', type: 'number', hint: R`$\frac{n!}{n^n}=\frac1n\cdot\frac2n\cdots\frac nn\le\frac1n$.`, sol: R`Minden tényező legfeljebb $1$, ezért $0<\frac{n!}{n^n}\le\frac1n\to0$; rendőrelvvel a határérték $0$.` }),
        MB.q({ level: 3, q: R`Mennyi $\lim_{n\to\infty}\sqrt[n]{3^n+4^n}$?`, a: '4', type: 'number', hint: R`Emeld ki a $4^n$-t.`, sol: R`$4\cdot\sqrt[n]{(3/4)^n+1}\to4\cdot1=4$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be: ha $a_n\to0$ és $(b_n)$ korlátos, akkor $a_nb_n\to0$.`, type: 'proof', hint: R`Használj $|b_n|\le M$ korlátot és a rendőrelvet.`, sol: R`Legyen $|b_n|\le M$. Ekkor $0\le|a_nb_n|\le M|a_n|$. Mivel $M|a_n|\to0$, a rendőrelv szerint $|a_nb_n|\to0$, tehát $a_nb_n\to0$.` }),
        MB.q({ level: 3, q: R`Mennyi $\lim_{n\to\infty}\sqrt n\left(\sqrt{n+1}-\sqrt n\right)$?`, a: '1/2', alt: ['0.5'], type: 'expr', hint: R`Előbb bővítsd a konjugálttal, aztán szorozz $\sqrt n$-nel.`, sol: R`$\sqrt{n+1}-\sqrt n=\frac1{\sqrt{n+1}+\sqrt n}$, ezért a szorzat $\frac{\sqrt n}{\sqrt{n+1}+\sqrt n}=\frac{1}{\sqrt{1+1/n}+1}\to\frac12$.` })
      ],
      video: { title: 'Sorozatok határértékszámítása', channel: 'Magyar matematika csatornák', kind: 'KERESÉS', search: 'sorozat határérték számítás gyökös rendőrelv magyarázat' }
    },
    {
      id: 'sorozat-nevezetes', num: '4.3', title: 'Nevezetes határértékek és rekurziók', minutes: 32,
      lead: R`Néhány határértéket érdemes fejből ismerni, mert más feladatokban visszatérő építőelemek: $\left(1+\frac xn\right)^n\to e^x$, $\sqrt[n]{n}\to1$, $\frac{n^k}{a^n}\to0$. A rekurzívan megadott sorozatoknál pedig nem a képletet kell kitalálni, hanem a monotonitást és a korlátosságot igazolni, majd a határértékre egyenletet felírni.`,
      why: [
        R`Az $\left(1+\frac1n\right)^n$ sorozat nem véletlenül konvergál az $e$-hez: ez az $e$ egyik lehetséges definíciója, és ebből származik az $e^x$ összes tulajdonsága. A kitevőben szereplő $x$ csak skálázás: $\left(1+\frac xn\right)^n=\left[\left(1+\frac xn\right)^{n/x}\right]^x\to e^x$. Ezért lesz a folytonos kamatos kamat, a logaritmus deriváltja és az exponenciális függvény deriváltja mind ugyanennek a határértéknek a következménye.`,
        R`A rekurzív sorozatoknál a fixpont-egyenlet ($L=f(L)$) csak azt mondja meg, hogy mi lehet a határérték, azt nem, hogy létezik. Ezért a helyes sorrend: először monotonitás és korlátosság (ez adja a konvergenciát a monoton–korlátos tétellel), és csak utána a fixpont-egyenlet megoldása. A monotonitást legtöbbször indukcióval igazoljuk, a korlátot pedig a feltételezett határértékből sejtjük meg.`
      ],
      when: R`A nevezetes határértékek akkor kellenek, amikor a kifejezés exponenciális vagy gyökös alakú: $\left(1+\frac cn\right)^n$, $\sqrt[n]{n^k+3}$, $\frac{n^{10}}{2^n}$. Rekurzív sorozat (pl. $a_{n+1}=\sqrt{2+a_n}$, $a_{n+1}=7-\frac{10}{a_n}$) esetén a monoton–korlátos tétel a standard út. A limsup/liminf pedig akkor hasznos, ha a sorozat nem konvergens, de jellemezni akarjuk a viselkedését.`,
      theory: [
        MB.formula('Az $e$ határérték és általánosítása', R`\left(1+\frac1n\right)^n\to e,\qquad \left(1+\frac xn\right)^n\to e^x\quad(x\in\mathbb R).`, R`Általánosabban: ha $a_n\to0$, akkor $(1+a_n)^{1/a_n}\to e$; ebből jön az $e^x$ hatványértelmezése.`),
        MB.formula('Gyökök és hatványok', R`\sqrt[n]{n}\to1,\qquad \sqrt[n]{c}\to1\ (c>0),\qquad \sqrt[n]{n^k+3}\to1.`, R`A $\sqrt[n]{n}=e^{\frac{\ln n}{n}}$ átírásból látszik, hogy a kitevő $0$-hoz tart.`),
        MB.formula('Exponenciális legyőzi a polinomot', R`\frac{n^k}{a^n}\to0\quad(k>0,\ a>1),\qquad \frac{a^n}{n!}\to0,\qquad \frac{n!}{n^n}\to0.`, R`A nagyságrendi sorrend: $\ln n\ll n^k\ll a^n\ll n!\ll n^n$.`),
        MB.thm('Monoton–korlátos tétel', R`Ha $(a_n)$ monoton növekvő és felülről korlátos, akkor konvergens, és határértéke $\sup\{a_n\}$. Ha monoton csökkenő és alulról korlátos, akkor konvergens, határértéke $\inf\{a_n\}$.`),
        MB.note('Rekurzív sorozat határértéke', R`Ha $a_{n+1}=f(a_n)$ és $a_n\to L$, valamint $f$ folytonos, akkor $L=f(L)$. Ez ad egy egyenletet $L$-re. De ez csak szükséges feltétel: előbb a konvergenciát kell igazolni (monotonitás és korlátosság), különben hamis gyököt kaphatunk.`),
        MB.def('Limesz szuperior és inferior', R`$\limsup_{n\to\infty}a_n=\lim_{n\to\infty}\left(\sup_{k\ge n}a_k\right)$ és $\liminf_{n\to\infty}a_n=\lim_{n\to\infty}\left(\inf_{k\ge n}a_k\right)$. Ezek minden sorozatra léteznek a kiterjesztett valós számok körében, és $a_n$ pontosan akkor konvergens, ha $\liminf a_n=\limsup a_n$ (végesen).`),
        MB.warn('A fixpont nem elég', R`Az $a_1=2$, $a_{n+1}=a_n^2$ sorozat fixpontjai a $0$ és az $1$ ($L=L^2$), mégis $a_n\to\infty$. A fixpont-egyenlet tehát önmagában félrevezet: a konvergenciát külön kell bizonyítani. Ugyanígy $a_{n+1}=7-\frac{10}{a_n}$ esetén két fixpont van ($2$ és $5$), és csak a kezdőértéktől és a monotonitástól függ, melyik lesz a határérték.`),
        MB.list('Amit érdemes fejből tudni', [
          R`$\left(1+\frac1n\right)^n\to e\approx2{,}718$.`,
          R`$\sqrt[n]{n}\to1$ és $\sqrt[n]{c}\to1$ minden $c>0$-ra.`,
          R`$\frac{n^k}{a^n}\to0$ ($a>1$), $\frac{a^n}{n!}\to0$, $\frac{n!}{n^n}\to0$.`,
          R`$\left(1-\frac1n\right)^n\to e^{-1}$; általában $\left(1+\frac xn\right)^n\to e^x$.`
        ])
      ],
      examples: [
        MB.example({
          title: 'Rekurzív sorozat határértéke',
          problem: R`Legyen $a_1=4$ és $a_{n+1}=7-\dfrac{10}{a_n}$. Mutassuk meg, hogy konvergens, és számítsuk ki a határértékét.`,
          steps: [
            R`Sejtés: $a_n$ növekvő és $5$-nél kisebb. Indukcióval: $a_1=4<5$. Ha $2<a_n<5$, akkor $\frac{10}{a_n}\in(2,5)$, ezért $a_{n+1}=7-\frac{10}{a_n}\in(2,5)$.`,
            R`Monotonitás: $a_{n+1}-a_n=7-\frac{10}{a_n}-a_n=\frac{-(a_n-2)(a_n-5)}{a_n}$. Ha $2<a_n<5$, akkor $(a_n-2)(a_n-5)<0$, tehát a különbség pozitív: a sorozat növekvő.`,
            R`Növekvő és felülről korlátos ($a_n<5$), ezért a monoton–korlátos tétel szerint konvergens; legyen $L=\lim a_n$.`,
            R`A rekurzióban határértéket véve: $L=7-\frac{10}{L}$, azaz $L^2-7L+10=0$.`,
            R`Gyökök: $L=2$ vagy $L=5$. Mivel $a_n\ge4$ minden $n$-re, a határérték nem lehet $2$, tehát $L=5$.`
          ],
          answer: R`$\lim a_n=5$`
        }),
        MB.example({
          title: 'Az $e$ határérték skálázva',
          problem: R`Számítsuk ki: $\lim_{n\to\infty}\left(1+\dfrac2n\right)^n$.`,
          steps: [
            R`Írjuk át a kitevőt: $\left(1+\frac2n\right)^n=\left[\left(1+\frac2n\right)^{n/2}\right]^2$.`,
            R`Legyen $m=\frac n2$; ekkor a belső kifejezés $\left(1+\frac1m\right)^m\to e$.`,
            R`A négyzetre emelés folytonos, ezért a határérték $e^2$.`,
            R`Általában $\left(1+\frac xn\right)^n\to e^x$.`
          ],
          answer: R`$e^2$`
        }),
        MB.example({
          title: 'Négyzetgyökös rekurzió',
          problem: R`Legyen $a_1=1$ és $a_{n+1}=\sqrt{2+a_n}$. Mutassuk meg, hogy konvergens, és adjuk meg a határértékét.`,
          steps: [
            R`Indukcióval: $a_1=1<2$. Ha $a_n<2$, akkor $a_{n+1}=\sqrt{2+a_n}<\sqrt4=2$, tehát a sorozat felülről korlátos $2$-vel.`,
            R`Monotonitás: $a_{n+1}^2-a_n^2=(2+a_n)-a_n^2=-(a_n-2)(a_n+1)>0$, ha $a_n<2$. Mivel $a_{n+1},a_n>0$, ebből $a_{n+1}>a_n$.`,
            R`Növekvő és korlátos, tehát konvergens; legyen $L=\lim a_n$.`,
            R`Határértéket véve: $L=\sqrt{2+L}$, azaz $L^2=2+L$.`,
            R`$L^2-L-2=0$, gyökök $L=2$ és $L=-1$. Mivel $a_n>0$, $L=2$.`
          ],
          answer: R`$\lim a_n=2$`
        }),
        MB.example({
          title: 'Limesz szuperior és inferior',
          problem: R`Határozzuk meg az $a_n=(-1)^n+\dfrac1n$ sorozat $\limsup$ és $\liminf$ értékét.`,
          steps: [
            R`Páros $n$-re: $a_{2n}=1+\frac1{2n}\to1$.`,
            R`Páratlan $n$-re: $a_{2n-1}=-1+\frac1{2n-1}\to-1$.`,
            R`A sorozat torlódási pontjai $-1$ és $1$ (ezek a részsorozatok határértékei), ezért $\limsup a_n=1$ és $\liminf a_n=-1$.`,
            R`Mivel a kettő különbözik, a sorozat nem konvergens.`
          ],
          answer: R`$\limsup a_n=1$, $\liminf a_n=-1$`
        })
      ],
      mistakes: [
        R`A rekurzív sorozatnál a fixpont-egyenletet a konvergencia bizonyítása előtt felírni — így hamis gyököt kaphatunk.`,
        R`$\left(1+\frac2n\right)^n$-nél $e^2$ helyett $2e$-t írni: a kitevőben $n$ áll, nem $2n$.`,
        R`A $\sqrt[n]{n}\to1$ helyett $\sqrt[n]{n}\to0$-t írni.`,
        R`Azt hinni, hogy $\frac{n^k}{a^n}$ csak $k=1$ esetén tart nullához; minden rögzített $k>0$-ra igaz.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Mennyi $\lim_{n\to\infty}\left(1+\dfrac3n\right)^n$?`, a: 'e^3', alt: ['exp(3)', 'e**3', 'e³'], type: 'expr', hint: R`$\left(1+\frac xn\right)^n\to e^x$.`, sol: R`$x=3$, ezért a határérték $e^3$.` }),
        MB.q({ level: 1, q: R`Mennyi $\lim_{n\to\infty}\sqrt[n]{n}$?`, a: '1', type: 'number', hint: R`Írd át $e^{\ln n/n}$ alakba.`, sol: R`$\sqrt[n]{n}=e^{\frac{\ln n}{n}}$, és $\frac{\ln n}{n}\to0$, ezért a határérték $e^0=1$.` }),
        MB.q({ level: 2, q: R`Mennyi $\lim_{n\to\infty}\left(1+\dfrac1n\right)^{2n}$?`, a: 'e^2', alt: ['exp(2)', 'e**2', 'e²'], type: 'expr', hint: R`$\left(1+\frac1n\right)^{2n}=\left[\left(1+\frac1n\right)^n\right]^2$.`, sol: R`A belső sorozat $e$-hez tart, ezért a négyzete $e^2$-höz.` }),
        MB.q({ level: 2, q: R`Mennyi $\lim_{n\to\infty}\dfrac{2^n}{n!}$?`, a: '0', type: 'number', hint: R`$n!$ gyorsabban nő, mint bármely exponenciális.`, sol: R`A nagyságrendi listával $a^n\ll n!$, ezért a hányados $0$-hoz tart.` }),
        MB.q({ level: 2, q: R`Legyen $a_1=1$ és $a_{n+1}=\dfrac{a_n+2}{2}$. Mennyi a határérték?`, a: '2', type: 'number', hint: R`Fixpont: $L=\frac{L+2}{2}$; de előbb ellenőrizd a monotonitást.`, sol: R`$a_n=2-\frac1{2^{n-1}}$ zárt alak, ezért $a_n\to2$. Ellenőrzés: $L=\frac{L+2}{2}\Rightarrow L=2$.` }),
        MB.q({ level: 3, q: R`Legyen $a_1=1$ és $a_{n+1}=1+\dfrac1{a_n}$. Mennyi a határérték?`, a: '(1+sqrt(5))/2', alt: ['(1+√5)/2', '1.618', 'aranymetszés'], type: 'expr', hint: R`A fixpont: $L=1+\frac1L$, azaz $L^2-L-1=0$.`, sol: R`A sorozat korlátos ($1\le a_n\le2$) és konvergens; $L=1+\frac1L\Rightarrow L^2-L-1=0\Rightarrow L=\frac{1+\sqrt5}{2}$ (a negatív gyök nem jó).` }),
        MB.q({ level: 2, q: R`Mennyi az $a_n=(-1)^n+\frac1n$ sorozat limesz szuperiorja és limesz inferiorja?`, a: 'limsup=1, liminf=-1', alt: ['1 és -1', 'limsup 1 liminf -1', '1,-1'], type: 'text', hint: R`Nézd a páros és páratlan részsorozatot.`, sol: R`$a_{2n}\to1$, $a_{2n-1}\to-1$, ezért $\limsup=1$, $\liminf=-1$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy az $a_1=2$, $a_{n+1}=\sqrt{2a_n}$ sorozat konvergens, és határértéke $2$.`, type: 'proof', hint: R`Igazold indukcióval, hogy $a_n\ge2$ és $a_{n+1}\le a_n$; majd oldd meg $L=\sqrt{2L}$.`, sol: R`$a_1=2$, és ha $a_n>0$, akkor $a_{n+1}=\sqrt{2a_n}$ értelmes. Megmutatjuk, hogy $a_n\ge2$ és csökkenő: $a_{n+1}^2-a_n^2=2a_n-a_n^2=a_n(2-a_n)\le0$, ha $a_n\ge2$, tehát $a_{n+1}\le a_n$. Monoton csökkenő és alulról korlátos, így konvergens; $L=\sqrt{2L}\Rightarrow L^2=2L\Rightarrow L=2$ (a $0$ nem lehet, mert $a_n\ge2$).` })
      ],
      video: { title: 'Nevezetes sorozat-határértékek és rekurzív sorozatok', channel: 'Magyar matematika csatornák', kind: 'KERESÉS', search: 'nevezetes határérték e sorozat rekurzív sorozat monoton korlátos tétel' }
    }
  ]
});
