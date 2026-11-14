var R = String.raw;
MB.section({
  id: 'komplex', num: '03', title: 'Komplex számok', subtitle: 'A valós számegyenes síkba fordul',
  examTag: 'ZH1',
  intro: R`A komplex szám nem misztikus bővítés, hanem a sík pontjainak természetes számolási módja. Az $x^2+1=0$ megoldhatatlansága a valós számokon csak addig probléma, amíg egy dimenzióban gondolkodunk: a síkon van elég „hely” egy új iránynak. Ez a rész először a számolás rutinját adja meg (algebrai alak, konjugált, modulus), majd áttér a trigonometrikus és exponenciális alakra, mert a szorzás és a hatványozás ott válik átláthatóvá.`,
  chapters: [
    {
      id: 'komplex-algebra', num: '3.1', title: 'Algebrai alak és műveletek', minutes: 26,
      lead: R`A komplex szám $a+bi$ alakú, ahol $i^2=-1$. Minden művelet azzal a két szabállyal működik, amit a valós számoknál már ismersz: tagonként összeadunk, és minden tagot minden taggal megszorzunk — csak $i^2$ helyére $-1$-et írunk.`,
      why: [
        R`A valós számokon az $x^2=-1$ egyenletnek nincs megoldása, mert bármely valós szám négyzete nemnegatív. Ha mégis szeretnénk megoldást, ki kell bővíteni a számfogalmat. A komplex számokban pontosan egy új „irányt” adunk hozzá: az $i$-t, amelyre $i^2=-1$. Ebből az egyetlen definícióból már minden más következik — nem kell külön szabályokat bevezetni.`,
        R`A számítási szabályok használat közben maguktól kialakulnak. Az összeadás tagonként megy, mert a valós és a képzetes rész egymástól független irány. A szorzásnál egyszerűen felbontjuk a zárójelet, és a keletkező $i^2$-et $-1$-re cseréljük. A nevezőben álló komplex számot pedig a konjugálttal bővítjük: ez az a trükk, amely a nevezőt valóssá teszi, pontosan úgy, ahogy a $\frac{1}{\sqrt2}$-t $\frac{\sqrt2}{2}$-vé alakítjuk.`,
      ],
      when: R`Minden komplex feladat alapja: ha egy kifejezésben $i$ szerepel, először $a+bi$ alakra kell hozni. A modulus kell a konvergencia-vizsgálatokhoz (komplex számsorok), a konjugált a nevező kitisztításához és a valós együtthatós polinomok gyökeinek vizsgálatához. A ZH-n leggyakrabban osztás és hatványozás szerepel, de a modulusos becslés is rendszeres.`,
      theory: [
        MB.def('A komplex szám és az algebrai alak', R`A komplex számok halmaza $\mathbb C=\{a+bi \mid a,b\in\mathbb R\}$, ahol $i^2=-1$. Az $a$ a valós rész ($\operatorname{Re}z$), a $b$ a képzetes rész ($\operatorname{Im}z$). Két komplex szám pontosan akkor egyenlő, ha valós és képzetes része is egyezik: $a+bi=c+di\iff a=c$ és $b=d$. Ezért egy komplex egyenlet valójában két valós egyenlet.`),
        MB.formula('Összeadás és szorzás', R`\begin{aligned}
(a+bi)+(c+di) &= (a+c)+(b+d)i,\\
(a+bi)(c+di) &= (ac-bd)+(ad+bc)i.
\end{aligned}`, R`A szorzás a zárójelek felbontásából jön, majd $i^2=-1$ és $i^3=-i$ helyettesítéssel.`),
        MB.def('Konjugált', R`A $z=a+bi$ konjugáltja $\bar z=a-bi$. Tulajdonságai: $\overline{z+w}=\bar z+\bar w$, $\overline{zw}=\bar z\cdot\bar w$, $z+\bar z=2a$, $z-\bar z=2bi$, és $z\bar z=a^2+b^2$ valós, nemnegatív szám.`),
        MB.formula('Modulus', R`|z|=\sqrt{a^2+b^2},\qquad |z|^2=z\bar z.`, R`A modulus az origótól mért távolság, ezért mindig nemnegatív valós szám.`),
        MB.formula('Osztás', R`\frac{a+bi}{c+di}=\frac{(a+bi)(c-di)}{c^2+d^2}\qquad (c+di\neq0).`, R`A nevező konjugáltjával bővítünk; a nevező ezáltal $|c+di|^2$ lesz, ami valós.`),
        MB.warn('$i$ hatványai és a ciklikusság', R`$i^1=i$, $i^2=-1$, $i^3=-i$, $i^4=1$, és innen ismétlődik. Ezért $i^n$ értéke csak az $n\bmod 4$ maradéktól függ: $i^{4k}=1$, $i^{4k+1}=i$, $i^{4k+2}=-1$, $i^{4k+3}=-i$. A leggyakoribb hiba: $i^2$-t $-1$ helyett $1$-nek venni, vagy a $4$-es periódust elfelejteni.`),
        MB.note('Geometriai jelentés', R`A $z=a+bi$ számot a sík $(a,b)$ pontjaként (vagy origóból induló vektoraként) ábrázoljuk. Az összeadás vektorösszeadás. A konjugálás az $x$-tengelyre való tükrözés. A modulus az origótól mért távolság: $|z-w|$ két komplex szám távolsága. A szorzás nem ilyen egyszerű, de a 3.2-ben kiderül: hosszakat szoroz és szögeket forgat.`),
        MB.list('Amit fejből érdemes tudni', [
          R`$i^2=-1$, ezért $i^3=-i$ és $i^4=1$.`,
          R`$z\bar z=|z|^2$ valós és nemnegatív; ebből $|z|=\sqrt{z\bar z}$.`,
          R`$\overline{z+w}=\bar z+\bar w$ és $\overline{zw}=\bar z\bar w$.`,
          R`$|zw|=|z||w|$ és $\left|\frac zw\right|=\frac{|z|}{|w|}$ (ha $w\neq0$).`
        ])
      ],
      examples: [
        MB.example({
          title: 'Szorzás algebrai alakban',
          problem: R`Számítsuk ki: $(3+2i)(1-4i)$.`,
          steps: [
            R`Bontsuk fel a zárójelet: $3\cdot1+3\cdot(-4i)+2i\cdot1+2i\cdot(-4i)$.`,
            R`A tagok: $3-12i+2i-8i^2$.`,
            R`Használjuk, hogy $i^2=-1$, tehát $-8i^2=+8$.`,
            R`Valós rész: $3+8=11$; képzetes rész: $-12+2=-10$.`
          ],
          answer: R`$11-10i$`
        }),
        MB.example({
          title: 'Osztás konjugálttal',
          problem: R`Számítsuk ki: $\dfrac{1+i}{2-i}$.`,
          steps: [
            R`A nevező konjugáltja $2+i$; ezzel bővítünk.`,
            R`Számláló: $(1+i)(2+i)=2+i+2i+i^2=1+3i$.`,
            R`Nevező: $(2-i)(2+i)=4-i^2=5$, ami valós.`,
            R`Tehát a hányados $\frac{1+3i}{5}=\frac15+\frac35 i$.`
          ],
          answer: R`$\dfrac{1+3i}{5}$`
        }),
        MB.example({
          title: 'Modulus és geometria',
          problem: R`Mennyi $|3+4i|$, és mit jelent ez a síkon?`,
          steps: [
            R`$|3+4i|=\sqrt{3^2+4^2}=\sqrt{9+16}=\sqrt{25}=5$.`,
            R`Ez a $(3,4)$ pont origótól mért távolsága (a $3$–$4$–$5$ Pitagoraszi háromszög).`,
            R`Ellenőrzés a konjugálttal: $z\bar z=(3+4i)(3-4i)=9+16=25=|z|^2$.`
          ],
          answer: R`$|3+4i|=5$`
        }),
        MB.example({
          title: 'Az $i$ hatványai',
          problem: R`Mennyi $i^{100}$ és $i^{2023}$?`,
          steps: [
            R`A periódus $4$, ezért csak a kitevő $4$-es maradéka számít.`,
            R`$100=4\cdot25$, tehát $i^{100}=(i^4)^{25}=1^{25}=1$.`,
            R`$2023=4\cdot505+3$, tehát $i^{2023}=i^3=-i$.`
          ],
          answer: R`$i^{100}=1$, $i^{2023}=-i$`
        })
      ],
      mistakes: [
        R`$i^2$-t $1$-nek venni $-1$ helyett — ezzel minden szorzat előjele elromlik.`,
        R`$|z|=a^2+b^2$ írása: a modulus gyök, tehát $|z|=\sqrt{a^2+b^2}$.`,
        R`Osztásnál tagonként osztani a nevezővel: $\frac{a+bi}{c+di}\neq\frac ac+\frac bd i$. A helyes út a konjugálttal bővítés.`,
        R`$\sqrt{-4}=-2$ írása: valós számból vett páros gyök nemnegatív, itt $\sqrt{-4}=2i$.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Számítsd ki: $(2+3i)+(4-i)$.`, a: '6+2i', alt: ['2i+6', '6+2*i', '6+i2'], type: 'text', hint: R`Valós részt a valóshoz, képzetest a képzeteshez.`, sol: R`$(2+4)+(3-1)i=6+2i$.` }),
        MB.q({ level: 1, q: R`Számítsd ki: $(1+2i)(3-i)$.`, a: '5+5i', alt: ['5i+5', '5+5*i'], type: 'text', hint: R`Bontsd fel a zárójelet, majd $i^2=-1$.`, sol: R`$3-i+6i-2i^2=3+5i+2=5+5i$.` }),
        MB.q({ level: 1, q: R`Mennyi $|1-i\sqrt3|$?`, a: '2', type: 'number', hint: R`$|a+bi|=\sqrt{a^2+b^2}$, itt $b=-\sqrt3$.`, sol: R`$\sqrt{1+3}=2$.` }),
        MB.q({ level: 2, q: R`Mennyi $i^{2023}$?`, a: '-i', alt: ['-1i'], type: 'text', hint: R`Oszd el a kitevőt $4$-gyel, és nézd a maradékot.`, sol: R`$2023=4\cdot505+3$, ezért $i^{2023}=i^3=-i$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\dfrac{3+i}{1-i}$.`, a: '1+2i', alt: ['2i+1', '1+2*i'], type: 'text', hint: R`Bővítsd a nevező konjugáltjával, $1+i$-vel.`, sol: R`$\frac{(3+i)(1+i)}{2}=\frac{3+3i+i+i^2}{2}=\frac{2+4i}{2}=1+2i$.` }),
        MB.q({ level: 3, q: R`Oldd meg $\mathbb C$-ben: $z+2\bar z=3+i$.`, a: '1-i', alt: ['-i+1', '1-1i'], type: 'text', hint: R`Írd $z=x+yi$ alakban; két valós egyenletet kapsz.`, sol: R`$z+2\bar z=(x+2x)+(y-2y)i=3x-yi$. Innen $3x=3$ és $-y=1$, tehát $x=1$, $y=-1$, azaz $z=1-i$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy bármely $z,w\in\mathbb C$ esetén $|zw|=|z||w|$.`, type: 'proof', hint: R`Használd a $|u|^2=u\bar u$ azonosságot és a konjugált szorzási szabályát.`, sol: R`$|zw|^2=(zw)\overline{(zw)}=zw\bar z\bar w=(z\bar z)(w\bar w)=|z|^2|w|^2$. Mivel mindkét oldal nemnegatív, négyzetgyököt vonva $|zw|=|z||w|$.` }),
        MB.q({ level: 2, q: R`Mennyi $\dfrac1i$?`, type: 'choice', choices: ['$i$', '$-i$', '$1$', '$-1$'], a: '1', hint: R`Bővítsd $-i$-vel, vagy használd, hogy $i\cdot(-i)=1$.`, sol: R`$\frac1i=\frac{1\cdot(-i)}{i\cdot(-i)}=\frac{-i}{-i^2}=\frac{-i}{1}=-i$.` })
      ],
      video: { list: 'PLqdN24UCw5hnYkiVjRDCTAp2KE8KKFhtz', title: 'Komplex számok', channel: 'Magyar matematika', kind: 'LEJÁTSZÁSI LISTA' }
    },
    {
      id: 'komplex-trig', num: '3.2', title: 'Trigonometrikus alak, Euler, gyökök', minutes: 32,
      lead: R`A $z=a+bi$ alak jó összeadásra, de szorzásra és hatványozásra kényelmetlen. A trigonometrikus alak $z=r(\cos\varphi+i\sin\varphi)$ pontosan azt mutatja meg, ami a szorzásnál történik: a hosszak összeszorzódnak, a szögek összeadódnak.`,
      why: [
        R`A síkon minden nemnulla pont megadható a hosszával és a valós tengellyel bezárt szögével. Ez a $z=r(\cos\varphi+i\sin\varphi)$ trigonometrikus alak, ahol $r=|z|$ és $\varphi$ az argumentum. Ezzel a szorzás szabálya addíciós tétellé válik: $r_1r_2(\cos(\varphi_1+\varphi_2)+i\sin(\varphi_1+\varphi_2))$. A szorzás tehát nyújtás és forgatás egyszerre — ezért lesz a hatványozás is triviális.`,
        R`Az Euler-formula $e^{i\varphi}=\cos\varphi+i\sin\varphi$ ezt a tényt írja fel tömören: $z=re^{i\varphi}$. Ezzel a komplex szorzás kitevő-összeadássá lesz, a hatványozás pedig kitevő-szorzássá: $(re^{i\varphi})^n=r^ne^{in\varphi}$. Ez a de Moivre-tétel, és ez az az egyetlen képlet, amit a gyökvonáshoz tudni kell. Az $n$-edik gyököknél csak azt kell észrevenni, hogy a szög $2\pi$ többszörösével bizonytalan, ezért $n$ különböző gyök van, szabályos $n$-szöget alkotva.`
      ],
      when: R`Hatványozásnál és gyökvonásnál kötelező: az algebrai alakos $(1+i)^{10}$ kiszámolása nyolc szorzás, a trigonometrikus alakkal két sor. Komplex egyenleteknél ($z^3=8$, $z^4=-4$), valós együtthatós polinomok gyökeinél és a reziduumtételnél is ez a forma kell. Az argumentum meghatározásakor viszont figyelni kell a síknegyedre: $x<0$ esetén az $\arctan(y/x)$ önmagában rossz értéket ad.`,
      theory: [
        MB.def('Argumentum és trigonometrikus alak', R`Ha $z=a+bi\neq0$, akkor $r=|z|=\sqrt{a^2+b^2}>0$ és $\varphi$ az a szög, amelyre $a=r\cos\varphi$, $b=r\sin\varphi$. Ekkor $z=r(\cos\varphi+i\sin\varphi)$ a trigonometrikus alak. A $\varphi$ nincs egyértelműen meghatározva: bármely $\varphi+2k\pi$ is jó. A $[0,2\pi)$ (vagy $(-\pi,\pi]$) intervallumba eső értéket főértéknek nevezzük.`),
        MB.warn('A síknegyed-csapda', R`Az $\arctan\frac ba$ csak a $(-\frac\pi2,\frac\pi2)$ intervallumban ad helyes szöget, azaz csak $a>0$ esetén. Ha $a<0$, a kapott értékhez $\pi$-t kell adni (vagy $\pi$-t kell kivonni), mert a pont a második vagy harmadik síknegyedben van. Például $z=-1+i$ esetén $\arctan(-1)=-\frac\pi4$, ami rossz; a helyes argumentum $\pi-\frac\pi4=\frac{3\pi}{4}$. Mindig rajzolj, vagy ellenőrizd a $\cos\varphi$, $\sin\varphi$ előjelét!`),
        MB.formula('Euler-formula és exponenciális alak', R`e^{i\varphi}=\cos\varphi+i\sin\varphi,\qquad z=r e^{i\varphi}.`, R`Ebből $\cos\varphi=\frac{e^{i\varphi}+e^{-i\varphi}}2$ és $\sin\varphi=\frac{e^{i\varphi}-e^{-i\varphi}}{2i}$.`),
        MB.formula('Moivre-tétel', R`\big(r(\cos\varphi+i\sin\varphi)\big)^n=r^n(\cos n\varphi+i\sin n\varphi).`, R`A bizonyítás az addíciós tétel ismételt alkalmazása; exponenciális alakban $(re^{i\varphi})^n=r^ne^{in\varphi}$.`),
        MB.formula('$n$-edik gyökök', R`z_k=\sqrt[n]{r}\left(\cos\frac{\varphi+2k\pi}{n}+i\sin\frac{\varphi+2k\pi}{n}\right),\quad k=0,1,\dots,n-1.`, R`Pontosan $n$ darab gyök van; mindegyik ugyanazon a $\sqrt[n]{r}$ sugarú körön helyezkedik el, szabályos $n$-szöget alkotva.`),
        MB.thm('Konjugált gyökpár tétele', R`Ha a $P(z)=a_nz^n+\dots+a_0$ polinom együtthatói valósak és $P(z_0)=0$, akkor $P(\bar z_0)=0$ is teljesül. Ez azért igaz, mert $\overline{z^k}=\bar z^k$ és valós együtthatóra $\overline{a_kz^k}=a_k\bar z^k$, ezért $P(\bar z)=\overline{P(z)}=0$.`),
        MB.note('Forgatás és nyújtás', R`A $w=re^{i\varphi}$ számmal való szorzás a síkot $r$-szeresére nyújtja és $\varphi$-vel elforgatja. Ezért $i$-vel való szorzás $90^\circ$-os forgatás: $i(a+bi)=-b+ai$. Az $n$-edik gyökök pedig azért vannak szabályos sokszögön, mert a $\frac{2\pi}{n}$ szögű forgatás a gyökhalmazt önmagába viszi.`),
        MB.list('Nevezetes argumentumok', [
          R`$1$: $\varphi=0$; $-1$: $\varphi=\pi$; $i$: $\varphi=\frac\pi2$; $-i$: $\varphi=-\frac\pi2$.`,
          R`$1+i$: $\varphi=\frac\pi4$ (első síknegyed); $-1+i$: $\varphi=\frac{3\pi}4$ (második).`,
          R`$-1-i$: $\varphi=\frac{5\pi}4$ vagy $-\frac{3\pi}4$ (harmadik síknegyed).`,
          R`$1-i$: $\varphi=-\frac\pi4$ vagy $\frac{7\pi}4$ (negyedik síknegyed).`
        ])
      ],
      examples: [
        MB.example({
          title: 'Trigonometrikus alak és hatványozás',
          problem: R`Írjuk fel $z=1+i$ trigonometrikus alakját, és számítsuk ki $z^4$-et.`,
          steps: [
            R`$r=|1+i|=\sqrt{1+1}=\sqrt2$.`,
            R`Az argumentum: $\arctan(1)=\frac\pi4$, és a pont az első síknegyedben van, tehát $\varphi=\frac\pi4$.`,
            R`$z=\sqrt2\left(\cos\frac\pi4+i\sin\frac\pi4\right)=\sqrt2\,e^{i\pi/4}$.`,
            R`Moivre: $z^4=(\sqrt2)^4\left(\cos\pi+i\sin\pi\right)=4\cdot(-1)=-4$.`,
            R`Ellenőrzés algebrai alakban: $(1+i)^2=2i$, így $(1+i)^4=(2i)^2=-4$.`
          ],
          answer: R`$z=\sqrt2\,e^{i\pi/4}$, $z^4=-4$`
        }),
        MB.example({
          title: 'Argumentum második síknegyedben',
          problem: R`Add meg $z=-1+i$ modulusát és argumentumát.`,
          steps: [
            R`$r=\sqrt{(-1)^2+1^2}=\sqrt2$.`,
            R`$a=-1<0$, ezért az $\arctan\frac{b}{a}=\arctan(-1)=-\frac\pi4$ érték önmagában nem jó.`,
            R`A pont a második síknegyedben van ($a<0$, $b>0$), ezért $\varphi=\pi-\frac\pi4=\frac{3\pi}4$.`,
            R`Ellenőrzés: $\cos\frac{3\pi}4=-\frac{\sqrt2}{2}$, $\sin\frac{3\pi}4=\frac{\sqrt2}{2}$, és $\sqrt2$-vel szorozva $(-1,1)$-et kapunk.`
          ],
          answer: R`$|z|=\sqrt2$, $\arg z=\frac{3\pi}4$`
        }),
        MB.example({
          title: 'Harmadik gyökök: $z^3=8$',
          problem: R`Oldjuk meg: $z^3=8$.`,
          steps: [
            R`A jobb oldal trigonometrikus alakja: $8=8(\cos0+i\sin0)$, tehát $r=8$, $\varphi=0$.`,
            R`A gyökök: $z_k=\sqrt[3]{8}\left(\cos\frac{0+2k\pi}{3}+i\sin\frac{0+2k\pi}{3}\right)=2\left(\cos\frac{2k\pi}{3}+i\sin\frac{2k\pi}{3}\right)$.`,
            R`$k=0$: $z_0=2(\cos0+i\sin0)=2$.`,
            R`$k=1$: $z_1=2\left(\cos\frac{2\pi}{3}+i\sin\frac{2\pi}{3}\right)=2\left(-\frac12+\frac{\sqrt3}{2}i\right)=-1+i\sqrt3$.`,
            R`$k=2$: $z_2=2\left(\cos\frac{4\pi}{3}+i\sin\frac{4\pi}{3}\right)=-1-i\sqrt3$.`,
            R`A három gyök szabályos háromszöget alkot a $2$ sugarú körön.`
          ],
          answer: R`$z\in\{2,\ -1+i\sqrt3,\ -1-i\sqrt3\}$`
        }),
        MB.example({
          title: 'Negatív diszkrimináns',
          problem: R`Oldjuk meg: $z^2+2z+5=0$.`,
          steps: [
            R`A megoldóképlet: $z=\frac{-2\pm\sqrt{4-20}}{2}=\frac{-2\pm\sqrt{-16}}{2}$.`,
            R`$\sqrt{-16}=4i$, mert $(4i)^2=16i^2=-16$.`,
            R`Tehát $z=\frac{-2\pm4i}{2}=-1\pm2i$.`,
            R`Ellenőrzés a konjugált gyökpár tételével: az együtthatók valósak, ezért a két gyök konjugáltja egymásnak — ez teljesül.`
          ],
          answer: R`$z=-1+2i$ vagy $z=-1-2i$`
        })
      ],
      mistakes: [
        R`Az $\arctan\frac ba$ képletet minden síknegyedben használni: $a<0$ esetén $\pi$-t kell hozzáadni.`,
        R`A trigonometrikus alakban a modulus helyére a számot írni: $1+i\neq\cos\frac\pi4+i\sin\frac\pi4$, mert a hossz $\sqrt2$.`,
        R`Az $n$-edik gyöknél csak a $k=0$ ágat felírni: $z^3=8$-nak három gyöke van.`,
        R`A konjugált gyökpár tételét valós együttható nélkül használni: komplex együtthatós polinomra nem igaz.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Mennyi $z=\sqrt3+i$ argumentuma radiánban?`, a: 'pi/6', alt: ['π/6', '0.5236'], type: 'expr', hint: R`$\tan\varphi=\frac{1}{\sqrt3}$, és a pont az első síknegyedben van.`, sol: R`$\tan\varphi=\frac{1}{\sqrt3}\Rightarrow\varphi=\frac\pi6$, mert $a>0$, $b>0$.` }),
        MB.q({ level: 1, q: R`Mennyi $z=-2i$ argumentuma?`, a: '-pi/2', alt: ['-π/2', '3pi/2'], type: 'expr', hint: R`A pont a negatív képzetes tengelyen van.`, sol: R`$a=0$, $b=-2<0$, ezért $\varphi=-\frac\pi2$ (vagy $\frac{3\pi}2$).` }),
        MB.q({ level: 2, q: R`Számítsd ki: $(1+i)^8$.`, a: '16', type: 'number', hint: R`$1+i=\sqrt2\,e^{i\pi/4}$, majd Moivre.`, sol: R`$(1+i)^8=(\sqrt2)^8e^{i2\pi}=16\cdot1=16$.` }),
        MB.q({ level: 2, q: R`Mennyi a $z^3=-8$ egyenlet valós gyöke?`, a: '-2', type: 'number', hint: R`$-8=8e^{i\pi}$; a valós gyök a negatív valós tengelyen van.`, sol: R`A gyökök: $2e^{i\pi/3}=1+i\sqrt3$, $2e^{i\pi}=-2$, $2e^{i5\pi/3}=1-i\sqrt3$. A valós gyök $-2$.` }),
        MB.q({ level: 3, q: R`Számítsd ki: $(1-i)^{10}$.`, a: '-32i', alt: ['-32*i', '0-32i'], type: 'text', hint: R`$1-i=\sqrt2\,e^{-i\pi/4}$, a kitevőben $10\cdot(-\frac\pi4)=-\frac{5\pi}2$.`, sol: R`$(1-i)^{10}=(\sqrt2)^{10}e^{-i5\pi/2}=32e^{-i\pi/2}=-32i$.` }),
        MB.q({ level: 2, q: R`Oldd meg: $z^2+4z+13=0$. Add meg a gyököket.`, a: '-2±3i', alt: ['-2+3i és -2-3i', '-2+3i, -2-3i', '-2+3i;-2-3i', '-2+3i,-2-3i'], type: 'text', hint: R`A diszkrimináns $16-52=-36$.`, sol: R`$z=\frac{-4\pm6i}{2}=-2\pm3i$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy minden $n\in\mathbb N$-re $(\cos\varphi+i\sin\varphi)^n=\cos n\varphi+i\sin n\varphi$.`, type: 'proof', hint: R`Teljes indukció $n$-re, az addíciós tételt használva.`, sol: R`$n=1$-re azonosság. Ha $n$-re igaz, akkor $(\cos\varphi+i\sin\varphi)^{n+1}=(\cos n\varphi+i\sin n\varphi)(\cos\varphi+i\sin\varphi)$. A szorzást kifejtve és a $\cos(A+B)$, $\sin(A+B)$ addíciós tételét alkalmazva $\cos(n+1)\varphi+i\sin(n+1)\varphi$ adódik.` }),
        MB.q({ level: 1, q: R`Hány $n$-edik gyöke van egy $z\neq0$ komplex számnak?`, type: 'choice', choices: ['$1$', '$2$', '$n$', '$n-1$'], a: '2', hint: R`A szög $2k\pi$ többszöröseivel bizonytalan, és $k=0,\dots,n-1$ ad különböző gyököt.`, sol: R`Pontosan $n$ darab, mert $k$ $n$ egymást követő értéke ad különböző szöget modulo $2\pi$.` })
      ],
      video: { list: 'PLqdN24UCw5hnYkiVjRDCTAp2KE8KKFhtz', title: 'Komplex számok', channel: 'Magyar matematika', kind: 'LEJÁTSZÁSI LISTA' }
    }
  ]
});
