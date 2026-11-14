var R = String.raw;
MB.section({
  id: 'tobbvaltozos', num: '10', title: 'Többváltozós analízis', subtitle: 'Felületek, gradiensek, térfogatok',
  examTag: 'Analízis 2',
  intro: 'Két változótól kezdve a „közelítés” fogalma megváltozik: nem egyetlen irányból kell közeledni, hanem minden lehetséges úton. Ezért lesz a határérték nehezebb, a derivált viszont részlegesen egyszerű, és éppen ebből a kettősségből születik a felületi érintősík, a gradiens és a Hesse-teszt. Az integrálásnál pedig az a kérdés, hogy melyik koordinátarendszerben lesz a tartomány egyszerű — a Jacobi-determináns ennek az ára.',
  chapters: [
    {
      id: 'tobbvaltozos-derivalt', num: '10.1', title: 'Határérték, parciális és totális derivált', minutes: 30,
      lead: R`Kétváltozós függvénynél a $\lim_{(x,y)\to(a,b)}f(x,y)$ azt jelenti, hogy minden úton ugyanahhoz az értékhez kell tartania. A parciális derivált csak két kiemelt út menti viselkedést néz meg, ezért önmagában kevés: a totális differenciálhatóság az, ami a felület simaságát jelenti.`,
      why: [
        'Egyváltozós esetben két oldalról lehet közeledni, és ha mindkettő ugyanazt adja, kész. Síkban viszont végtelen sok görbe vezet a ponthoz: az $x$-tengely, az $y$-tengely, az $y=x$ átló, bármilyen spirál. A határérték csak akkor létezik, ha ezek mindegyike ugyanazt adja. Ezért a leggyakoribb vizsgafeladat nem az, hogy kiszámoljunk egy határértéket, hanem hogy két út mentén különböző értéket mutatva bebizonyítsuk: a határérték nem létezik.',
        'A parciális derivált az egyik változót befagyasztja, tehát valójában egyváltozós deriválás. Ezért könnyű számolni — és ezért veszélyes is: a parciális deriváltak létezése nem garantál folytonosságot, mert nem mond semmit a többi irányról. A totális differenciálhatóság erősebb: azt jelenti, hogy a felület lokálisan egy síkkal jól közelíthető, és ebből már folytonosság is következik.'
      ],
      when: 'Minden olyan feladatnál, ahol kétváltozós függvény viselkedését kell minősíteni: létezik-e a határérték, folytonos-e az origóban, differenciálható-e, mi az érintősík egy pontban, merre nő a leggyorsabban. A gradiens és az érintősík a szélsőérték-keresés és a numerikus optimalizálás alapja, az iránymenti derivált pedig a „merre induljunk” kérdésre ad választ.',
      theory: [
        MB.def('Kétváltozós határérték', R`$\lim_{(x,y)\to(a,b)} f(x,y)=L$, ha minden $\varepsilon>0$-hoz van $\delta>0$, hogy $0<\sqrt{(x-a)^2+(y-b)^2}<\delta$ esetén $|f(x,y)-L|<\varepsilon$. Az átviteli elv itt is működik: minden $(a,b)$-hez tartó, a pontot elkerülő pontsorozat képe ugyanahhoz az $L$-hez tart.`),
        MB.warn('A határérték nem létezhet „úttól függően”', R`Az $f(x,y)=\dfrac{xy}{x^2+y^2}$ függvénynél az $y=0$ út mentén $f(x,0)=0$, az $y=x$ út mentén viszont $f(x,x)=\dfrac{x^2}{2x^2}=\dfrac12$. Két út, két különböző határérték, tehát a határérték nem létezik. Ez a legfontosabb ellenpélda-típus: nem kell minden utat végigpróbálni, elég kettő, amelyik mást ad.`),
        MB.def('Folytonosság', R`Az $f$ folytonos az $(a,b)$ pontban, ha értelmezve van ott, létezik a határérték, és $\lim_{(x,y)\to(a,b)}f(x,y)=f(a,b)$. Polinomok és két polinom hányadosa (ahol a nevező nem nulla) folytonosak.`),
        MB.def('Parciális derivált', R`A parciális derivált az egyik változó szerinti közönséges derivált, a másikat konstansnak tekintve:
$$f_x(a,b)=\lim_{h\to0}\frac{f(a+h,b)-f(a,b)}{h},\qquad f_y(a,b)=\lim_{h\to0}\frac{f(a,b+h)-f(a,b)}{h}.$$
Jelölés: $f_x=\partial f/\partial x$, $f_y=\partial f/\partial y$; a másodrendűek $f_{xx},f_{xy},f_{yx},f_{yy}$.`),
        MB.warn('Parciális derivált ≠ folytonosság', R`Legyen $f(x,y)=\dfrac{xy}{x^2+y^2}$ az origón kívül, és $f(0,0)=0$. Ekkor $f(x,0)=0$ minden $x$-re, ezért $f_x(0,0)=0$; ugyanígy $f_y(0,0)=0$. A függvény mégis folytontalan az origóban, mert az $y=x$ út mentén a határérték $1/2\neq f(0,0)$. A parciális deriváltak csak két irányt látnak.`),
        MB.def('Totális differenciálhatóság', R`Az $f$ totálisan differenciálható az $(a,b)$ pontban, ha létezik olyan $A,B$ szám, hogy
$$f(a+h,b+k)=f(a,b)+Ah+Bk+o\!\left(\sqrt{h^2+k^2}\right),$$
ahol a hiba a távolságnál gyorsabban tart nullához. Ekkor szükségképpen $A=f_x(a,b)$, $B=f_y(a,b)$, tehát a lineáris rész a gradienssel írható fel.`),
        MB.thm('Elégséges feltétel', R`Ha az $f_x$ és $f_y$ parciális deriváltak léteznek az $(a,b)$ egy környezetében és ott folytonosak, akkor $f$ totálisan differenciálható $(a,b)$-ben. Ilyenkor $f$ folytonos is. A tétel megfordítása nem igaz: a differenciálhatóságból nem következik a parciális deriváltak folytonossága.`),
        MB.formula('Gradiens, iránymenti derivált, érintősík', R`\begin{aligned}
\nabla f &= (f_x,f_y),\\
D_{\mathbf u}f &= \nabla f\cdot\mathbf u\quad(\|\mathbf u\|=1),\\
z &= f(a,b)+f_x(a,b)(x-a)+f_y(a,b)(y-b).
\end{aligned}`, R`A gradiens a legnagyobb növekedés irányába mutat, hossza a maximális iránymenti derivált; a szintvonalakra merőleges. Az $\mathbf u$ vektornak egységvektornak kell lennie, különben az érték a hosszal is skálázódik.`),
      ],
      examples: [
        MB.example({
          title: 'Nullához tartó határérték becsléssel',
          problem: R`Számítsuk ki: $\displaystyle\lim_{(x,y)\to(0,0)}\frac{x^2y}{x^2+y^2}$.`,
          steps: [
            R`Nem kell feltétlenül polárkoordinátára váltani: becsüljünk. Mivel $x^2\le x^2+y^2$, fennáll
$$\left|\frac{x^2y}{x^2+y^2}\right|=|y|\cdot\frac{x^2}{x^2+y^2}\le |y|.$$`,
            R`Az $|y|$ pedig nullához tart, függetlenül attól, milyen úton közeledünk.`,
            R`Polárban ugyanez: $x=r\cos\varphi$, $y=r\sin\varphi$, így a kifejezés $r\cos^2\varphi\sin\varphi$, amit $r$ korlátoz, mert $|\cos^2\varphi\sin\varphi|\le1$.`,
            R`A rendőrelv szerint a határérték $0$.`
          ],
          answer: R`$0$`
        }),
        MB.example({
          title: 'Nem létező határérték két út mentén',
          problem: R`Létezik-e $\displaystyle\lim_{(x,y)\to(0,0)}\frac{xy}{x^2+y^2}$?`,
          steps: [
            R`Első út: $y=0$, ekkor $f(x,0)=\dfrac{0}{x^2}=0$ minden $x\neq0$-ra, tehát a határérték $0$.`,
            R`Második út: $y=x$, ekkor $f(x,x)=\dfrac{x^2}{2x^2}=\dfrac12$ minden $x\neq0$-ra, tehát a határérték $1/2$.`,
            R`Két különböző érték ugyanahhoz a ponthoz: a határérték nem létezik.`,
            R`Polárban ez még szemléletesebb: $f=\dfrac{r^2\cos\varphi\sin\varphi}{r^2}=\frac12\sin2\varphi$, ami csak a szögtől függ — a sugárral nem csökken.`
          ],
          answer: R`Nem létezik ($0$ és $1/2$ is előfordul)`
        }),
        MB.example({
          title: 'Gradiens és érintősík',
          problem: R`Legyen $f(x,y)=x^2y+y^3$. Határozzuk meg a gradiensét, majd az $(1,2)$ ponthoz tartozó érintősíkot.`,
          steps: [
            R`Parciális deriváltak: $f_x=2xy$, $f_y=x^2+3y^2$.`,
            R`Az $(1,2)$ pontban: $f_x(1,2)=4$, $f_y(1,2)=1+12=13$, tehát $\nabla f(1,2)=(4,13)$.`,
            R`A függvényérték: $f(1,2)=1^2\cdot2+2^3=2+8=10$.`,
            R`Az érintősík: $z=10+4(x-1)+13(y-2)$, azaz $z=4x+13y-20$.`,
            R`Ellenőrzés: az $(1,2)$ pontban $4+26-20=10$, és a sík meredeksége $x$ irányban $4$, $y$ irányban $13$.`
          ],
          answer: R`$\nabla f(1,2)=(4,13)$, érintősík: $z=4x+13y-20$`
        })
      ],
      mistakes: [
        R`A határértéket egyetlen út mentén kiszámolni és késznek tekinteni. Egy út csak azt bizonyítja, hogy a határérték nem lehet más, de a létezést nem.`,
        R`Azt hinni, hogy ha $f_x$ és $f_y$ létezik, akkor a függvény folytonos. Az $xy/(x^2+y^2)$ ellenpélda.`,
        R`Az iránymenti deriváltnál nem egységvektorral szorozni: $D_{\mathbf u}f=\nabla f\cdot\frac{\mathbf u}{\|\mathbf u\|}$.`,
        R`Az érintősík képletében a függvényértéket kihagyni: a sík nem $z=f_x\Delta x+f_y\Delta y$, hanem $f(a,b)$-vel kezdődik.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Mennyi $\displaystyle\lim_{(x,y)\to(0,0)}\frac{x^2y}{x^2+y^2}$?`, a: '0', type: 'number', hint: R`Becsüld: $\frac{x^2}{x^2+y^2}\le1$.`, sol: R`$\left|\frac{x^2y}{x^2+y^2}\right|\le|y|\to0$, tehát a határérték $0$.` }),
        MB.q({ level: 2, q: R`Létezik-e a $\displaystyle\lim_{(x,y)\to(0,0)}\frac{xy}{x^2+y^2}$ határérték?`, type: 'choice', choices: ['Igen, és értéke $0$', 'Igen, és értéke $1/2$', 'Nem létezik'], a: '2', sol: R`Nem: $y=0$ mentén $0$, $y=x$ mentén $1/2$.` }),
        MB.q({ level: 1, q: R`Legyen $f(x,y)=x^2y+y^3$. Mennyi $f_x(1,2)$?`, a: '4', type: 'number', hint: R`$f_x=2xy$.`, sol: R`$f_x=2xy$, ezért $f_x(1,2)=4$.` }),
        MB.q({ level: 2, q: R`Ugyanerre az $f$-re mennyi $f_y(1,2)$?`, a: '13', type: 'number', hint: R`$f_y=x^2+3y^2$.`, sol: R`$f_y=x^2+3y^2$, ezért $f_y(1,2)=1+12=13$.` }),
        MB.q({ level: 2, q: R`Mi a $z=x^2+y^2$ felület érintősíkja az $(1,1)$ pontban? Írd fel $z=Ax+By+C$ alakban, és add meg a három együtthatót.`, a: '2,2,-2', alt: ['2x+2y-2', 'A=2, B=2, C=-2'], type: 'text', hint: R`$f_x=f_y=2x$, illetve $2y$; $f(1,1)=2$.`, sol: R`$z=2+2(x-1)+2(y-1)=2x+2y-2$.` }),
        MB.q({ level: 3, q: R`Mennyi az $f(x,y)=x^2y+y^3$ iránymenti deriváltja az $(1,2)$ pontban a $\mathbf u=\left(\frac35,\frac45\right)$ egységvektor irányában?`, a: '64/5', alt: ['12.8', '12,8'], type: 'expr', hint: R`$D_{\mathbf u}f=\nabla f\cdot\mathbf u$.`, sol: R`$\nabla f(1,2)=(4,13)$, így $D_{\mathbf u}f=4\cdot\frac35+13\cdot\frac45=\frac{12+52}{5}=\frac{64}{5}$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy az $f(x,y)=\dfrac{xy}{x^2+y^2}$ ($(x,y)\neq(0,0)$), $f(0,0)=0$ függvénynek létezik mindkét parciális deriváltja az origóban, mégsem folytonos ott. Bizonyítsd be mindkét állítást.`, type: 'proof', sol: R`$f(x,0)=0$ minden $x\neq0$-ra, ezért $f_x(0,0)=\lim_{h\to0}\frac{0-0}{h}=0$; ugyanígy $f_y(0,0)=0$. Viszont az $y=x$ út mentén $f(x,x)=\frac12\to\frac12\neq f(0,0)=0$, tehát a függvény nem folytonos az origóban. A parciális deriváltak létezése tehát nem elégséges a folytonossághoz.` }),
        MB.q({ level: 1, q: R`Folytonos-e az $f(x,y)=\frac{x^2y}{x^2+y^2}$ ($(x,y)\neq(0,0)$), $f(0,0)=0$ függvény az origóban?`, type: 'choice', choices: ['Igen', 'Nem'], a: '0', sol: R`Igen: a határérték $0=f(0,0)$, amit a $\le|y|$ becslés bizonyít.` })
      ],
      video: { title: 'Többváltozós függvények határértéke és parciális deriváltja', channel: 'Magyar matematika csatornák', kind: 'KERESÉS', search: 'többváltozós függvény határérték parciális derivált gradiens magyar előadás' }
    },
    {
      id: 'tobbvaltozos-szelsoseg', num: '10.2', title: 'Szélsőérték, Hesse-mátrix, Lagrange', minutes: 32,
      lead: 'A szélsőérték keresése két lépésből áll: előbb megkeressük a kritikus pontokat, ahol a gradiens nulla, aztán a másodrendű információval eldöntjük, hogy minimum, maximum vagy nyeregpont. Feltétel (görbe, felület) mellett a szabad gradiens helyett a gradiens és a feltétel gradiense közti párhuzamosság lesz a feltétel.',
      why: [
        R`Egyváltozós esetben a derivált előjele mondja meg, hogy nő vagy csökken, és a második derivált dönti el a szélsőérték típusát. Kétváltozós esetben a derivált helyett a gradiens áll: ha nem nulla, akkor abba az irányba mozdulva a függvény változik, tehát szélsőérték csak ott lehet, ahol $\nabla f=0$. Ez a szükséges feltétel, de nem elégséges — ezért kell a második lépés.`,
        'A másodrendű viselkedést a Hesse-mátrix írja le: ez a kvadratikus tag mátrixa a Taylor-közelítésben. Azt kell eldönteni, hogy ez a kvadratikus alak minden irányban pozitív (minimum), minden irányban negatív (maximum), vagy van pozitív és negatív irány is (nyeregpont). Két változóban ez éppen a $D=f_{xx}f_{yy}-f_{xy}^2$ determináns előjelén múlik.',
        R`Ha a szélsőértéket egy feltétel (például $x+y=10$) mellett keressük, a kritikus pontban már nem $\nabla f=0$, hiszen a feltétel mentén mozdulva a függvény nem változik, de a szabad gradiense igen. A feltétel gradiense viszont merőleges a megengedett mozgásirányra, ezért a két gradiensnek párhuzamosnak kell lennie: $\nabla f=\lambda\nabla g$. Ez a Lagrange-multiplikátor egész tartalma.`
      ],
      when: 'Optimalizálási feladatoknál: hol a legkisebb a hiba, hol a legnagyobb a hozam, milyen méretek mellett maximális a térfogat adott felszín mellett. A Hesse-teszt a függvényvizsgálat többváltozós megfelelője, a Lagrange-módszer pedig minden „adott feltétel mellett maximalizálj” típusú zh-feladat eszköze.',
      theory: [
        MB.def('Lokális szélsőérték és kritikus pont', R`Az $f$-nek lokális minimuma van $(a,b)$-ben, ha egy környezetében $f(x,y)\ge f(a,b)$; lokális maximuma, ha $f(x,y)\le f(a,b)$. Kritikus pont az, ahol $\nabla f=0$, vagy ahol valamelyik parciális derivált nem létezik.`),
        MB.thm('Szükséges feltétel', R`Ha $f$ differenciálható az $(a,b)$ belső pontban és ott lokális szélsőértéke van, akkor $\nabla f(a,b)=(0,0)$. Az állítás megfordítása nem igaz: a $(0,0)$ az $x^2-y^2$ függvénynek kritikus pontja, mégsem szélsőérték.`),
        MB.formula('Hesse-teszt', R`D=f_{xx}f_{yy}-f_{xy}^2,\qquad
\begin{aligned}
&D>0,\ f_{xx}>0 &&\Rightarrow \text{lokális minimum},\\
&D>0,\ f_{xx}<0 &&\Rightarrow \text{lokális maximum},\\
&D<0 &&\Rightarrow \text{nyeregpont},\\
&D=0 &&\Rightarrow \text{a teszt nem dönt.}
\end{aligned}`),
        MB.note('Miért a determináns?', R`A másodrendű Taylor-közelítés $f(a+h,b+k)\approx f(a,b)+\frac12(f_{xx}h^2+2f_{xy}hk+f_{yy}k^2)$. A zárójelben álló kvadratikus alak pontosan akkor pozitív minden $(h,k)\neq(0,0)$-ra, ha $f_{xx}>0$ és $f_{xx}f_{yy}-f_{xy}^2>0$; akkor negatív minden irányban, ha $f_{xx}<0$ és $D>0$. Ha $D<0$, a kvadratikus alak előjelet vált, azaz egyik irányban nő, másikban csökken a függvény.`),
        MB.formula('Lagrange-multiplikátor', R`\text{Feltétel: } g(x,y)=0.\qquad \nabla f=\lambda\nabla g,\quad g(x,y)=0.`),
        MB.warn('A Lagrange-módszer csak szükséges feltétel', R`A $\nabla f=\lambda\nabla g$ egyenletrendszer megoldásai között lehet minimum, maximum és „nem szélsőérték” is. A kapott pontokat külön kell minősíteni (a függvényértékek összehasonlításával, vagy a tartomány határán külön vizsgálódva). Kompakt tartományon a szélsőérték a belső kritikus pontban vagy a határon van, ezért a határt mindig ellenőrizni kell. Szükséges az is, hogy $\nabla g\neq0$ legyen a feltétel mentén.`),
        MB.list('Ajánlott menetrend', [
          R`Írd fel a gradienst, és oldd meg a $\nabla f=0$ rendszert.`,
          R`Számold ki a másodrendű deriváltakat, és minden kritikus pontban a $D$ determinánst.`,
          R`Feltételes feladatnál írd fel a $L=f-\lambda g$ Lagrangian-függvényt, és oldd meg a $\nabla L=0$ rendszert.`,
          R`Hasonlítsd össze a szóba jövő pontok függvényértékét, és ellenőrizd a tartomány határát.`
        ])
      ],
      examples: [
        MB.example({
          title: 'Minimum Hesse-teszttel',
          problem: R`Határozzuk meg az $f(x,y)=x^2+y^2-2x-4y$ függvény szélsőértékét.`,
          steps: [
            R`Gradiens: $\nabla f=(2x-2,\,2y-4)$. A $\nabla f=0$ rendszer megoldása $x=1$, $y=2$.`,
            R`Másodrendű deriváltak: $f_{xx}=2$, $f_{yy}=2$, $f_{xy}=0$, tehát $D=2\cdot2-0=4>0$.`,
            R`Mivel $D>0$ és $f_{xx}=2>0$, a pont lokális minimum.`,
            R`A minimum értéke: $f(1,2)=1+4-2-8=-5$.`,
            R`Teljes négyzetté alakítva ugyanez látszik: $f=(x-1)^2+(y-2)^2-5$, ami sosem kisebb $-5$-nél, tehát ez globális minimum is.`
          ],
          answer: R`Minimum az $(1,2)$ pontban, értéke $-5$`
        }),
        MB.example({
          title: 'Nyeregpont',
          problem: R`Vizsgáljuk az $f(x,y)=x^2-y^2$ függvényt az origóban.`,
          steps: [
            R`$\nabla f=(2x,-2y)$, ami csak az origóban nulla, tehát egyetlen kritikus pont van.`,
            R`$f_{xx}=2$, $f_{yy}=-2$, $f_{xy}=0$, ezért $D=2\cdot(-2)-0=-4<0$.`,
            R`$D<0$: a pont nyeregpont. Ez összevág a képpel: az $x$-tengely mentén $f=x^2$ nő, az $y$-tengely mentén $f=-y^2$ csökken.`,
            R`Az origóban $f=0$, de tetszőlegesen közel vannak pozitív ($x\neq0,y=0$) és negatív ($x=0,y\neq0$) értékek is.`
          ],
          answer: R`Nyeregpont az origóban`
        }),
        MB.example({
          title: 'Maximum adott összeg mellett',
          problem: R`Mekkora a legnagyobb értéke az $xy$ szorzatnak, ha $x+y=10$?`,
          steps: [
            R`A feltétel $g(x,y)=x+y-10=0$. A Lagrange-függvény: $L=xy-\lambda(x+y-10)$.`,
            R`$\partial_xL=y-\lambda=0$ és $\partial_yL=x-\lambda=0$, tehát $x=y=\lambda$.`,
            R`A feltételbe írva: $2\lambda=10$, azaz $\lambda=5$, tehát $x=y=5$.`,
            R`A szorzat értéke $25$. Mivel $xy\le\left(\frac{x+y}{2}\right)^2=25$ (számtani–mértani közép), ez valóban maximum.`
          ],
          answer: R`$25$, az $x=y=5$ pontban`
        })
      ],
      mistakes: [
        R`Azt hinni, hogy $\nabla f=0$ automatikusan szélsőérték. A nyeregpont is kritikus pont.`,
        R`A Hesse-tesztnél csak $f_{xx}$ előjelét nézni: a $D$ determináns is kell, különben a nyeregpontot összetévesztjük szélsőértékkel.`,
        R`Feltételes feladatnál a $\nabla f=0$-t használni a feltétel mellett; a helyes feltétel $\nabla f=\lambda\nabla g$.`,
        R`A feltételbe behelyettesíteni és a kapott egyváltozós függvény szélsőértékét keresni — ez működik ugyan, de a Lagrange-multiplikátor nélkül elveszik a rendszer struktúrája, és gyakran a határpontokat is elfelejtjük.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Hol van az $f(x,y)=x^2+y^2-2x-4y$ függvény kritikus pontja?`, a: '1,2', alt: ['(1,2)', 'x=1, y=2'], type: 'text', hint: R`Oldd meg a $2x-2=0$, $2y-4=0$ rendszert.`, sol: R`$x=1$, $y=2$.` }),
        MB.q({ level: 2, q: R`Mennyi a fenti függvény minimumának értéke?`, a: '-5', type: 'number', hint: R`Helyettesítsd be az $(1,2)$ pontot.`, sol: R`$f(1,2)=1+4-2-8=-5$.` }),
        MB.q({ level: 2, q: R`Mennyi a Hesse-determináns az $f(x,y)=x^2-y^2$ függvény origójában?`, a: '-4', type: 'number', hint: R`$D=f_{xx}f_{yy}-f_{xy}^2$.`, sol: R`$f_{xx}=2$, $f_{yy}=-2$, $f_{xy}=0$, tehát $D=-4$.` }),
        MB.q({ level: 2, q: R`Mekkora az $xy$ szorzat maximuma, ha $x+y=10$?`, a: '25', type: 'number', hint: R`Lagrange vagy számtani–mértani közép.`, sol: R`$x=y=5$, a szorzat $25$.` }),
        MB.q({ level: 3, q: R`Határozd meg az $f(x,y)=x^2+y^2$ függvény minimumát az $x+y=4$ feltétel mellett. Add meg a minimum értékét.`, a: '8', type: 'number', hint: R`$\nabla f=(2x,2y)$, $\nabla g=(1,1)$.`, sol: R`$2x=\lambda$, $2y=\lambda\Rightarrow x=y$; a feltételből $x=y=2$, így $f=4+4=8$.` }),
        MB.q({ level: 2, q: R`Melyik pontban van az $f(x,y)=x^2+y^2-4x+6y+1$ függvény minimuma?`, a: '2,-3', alt: ['(2,-3)', 'x=2, y=-3'], type: 'text', hint: R`$2x-4=0$, $2y+6=0$.`, sol: R`$x=2$, $y=-3$; a Hesse-teszt szerint $D=4>0$, $f_{xx}=2>0$, tehát minimum. A minimum értéke $-12$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy ha $f$ sima és a $g(x,y)=0$ sima görbén $f$-nek lokális szélsőértéke van, akkor a pontban $\nabla f$ párhuzamos $\nabla g$-vel.`, type: 'proof', sol: R`Paraméterezzük a görbét a szélsőérték körül: $r(t)=(x(t),y(t))$, ahol $r(0)$ a vizsgált pont és $g(r(t))=0$. Ekkor $t\mapsto f(r(t))$-nek $t=0$-ban szélsőértéke van, ezért $\frac{d}{dt}f(r(t))\big|_{0}=\nabla f\cdot r'(0)=0$. A feltételből deriválva $g(r(t))=0$-t: $\nabla g\cdot r'(0)=0$. Két nem nulla vektor merőleges ugyanarra az $r'(0)$ érintőirányra a síkban, ezért párhuzamosak: $\nabla f=\lambda\nabla g$ valamilyen $\lambda$-ra.` }),
        MB.q({ level: 1, q: R`Lehet-e szélsőérték olyan pontban, ahol $\nabla f\neq0$?`, type: 'choice', choices: ['Igen, ha a pont a tartomány határán van', 'Nem, soha', 'Igen, mindig ott van'], a: '0', sol: R`Igen: a belső pontokban $\nabla f=0$ szükséges, de a tartomány határán a gradiens nem nulla is lehet.` })
      ],
      video: { title: 'Kétváltozós szélsőérték és Hesse-mátrix', channel: 'Magyar matematika csatornák', kind: 'KERESÉS', search: 'kétváltozós függvény szélsőérték Hesse-mátrix Lagrange-multiplikátor' }
    },
    {
      id: 'tobbvaltozos-integral', num: '10.3', title: 'Kettős és hármas integrál', minutes: 32,
      lead: 'A többszörös integrál ugyanaz az ötlet, mint az egyváltozós: végtelen sok kis darab összege. A gyakorlati kérdés az, hogyan lehet a tartományt olyan koordinátákkal leírni, amelyekben a határok konstansok — és mennyivel változik meg a terület- vagy térfogatelem.',
      why: [
        R`Az egydimenziós integrál intervallumok hosszának összegeként indul. Síkban a darabok kis téglalapok, amelyek területe $\Delta x\,\Delta y$; a határértékben ebből lesz $dA=dx\,dy$. A Fubini-tétel azt mondja ki, hogy ha a tartomány téglalap, akkor elég egymás után integrálni: előbb $y$ szerint $x$ függvényeként, aztán $x$ szerint. Ez nem triviális, de igaz, és ez teszi számolhatóvá az integrált.`,
        'Általános tartománynál a belső integrál határai függhetnek a külső változótól: ha a tartományt függőlegesen „szeleteljük”, akkor $x$ rögzített mellett $y$ egy alsó és egy felső görbe között fut. A normáltartomány pontosan ezt jelenti, és a gyakorlatban minden feladat ilyen.',
        R`Kör alakú tartománynál a derékszögű koordináták négyzetgyökös határokat adnak, ami integrálhatatlanul csúnya. Polárkoordinátában viszont a kör $r\le R$, ami konstans. Az ár: a területelem nem $dr\,d\varphi$, hanem $r\,dr\,d\varphi$, mert a szögnövekedés a sugárral arányos ívhosszt ad. Ugyanez a Jacobi-determináns szerepe henger- és gömbszimmetriánál.`
      ],
      when: 'Terület, térfogat, tömeg, súlypont, tehetetlenségi nyomaték számításánál; valószínűségszámításban együttes sűrűségfüggvény integrálásánál; fizikában fluxus és munka kiszámításánál. Ha a tartomány kör, gömb, henger vagy kúp, szinte mindig érdemes koordinátát váltani.',
      theory: [
        MB.def('Kettős integrál', R`Az $f(x,y)$ függvény $T$ tartomány fölötti kettős integrálja a $\sum f(x_i,y_i)\Delta A_i$ összegek határértéke, ahogy a felosztás finomodik. Ha $f\ge0$, ez a felület alatti térfogat; ha $f\equiv1$, a tartomány területe.`),
        MB.thm('Fubini-tétel', R`Ha $f$ folytonos a $T=[a,b]\times[c,d]$ téglalapon, akkor
$$\iint_T f\,dA=\int_a^b\left(\int_c^d f(x,y)\,dy\right)dx=\int_c^d\left(\int_a^b f(x,y)\,dx\right)dy.$$`),
        MB.def('Normáltartomány', R`Egy $T$ tartomány $x$-normált, ha $T=\{(x,y):a\le x\le b,\ \alpha(x)\le y\le\beta(x)\}$. Ilyenkor
$$\iint_T f\,dA=\int_a^b\int_{\alpha(x)}^{\beta(x)}f(x,y)\,dy\,dx.$$
Az $y$-normált tartományt ugyanígy, a szerepek felcserélésével írjuk fel; a belső integrál határai a külső változótól függhetnek, a külsők konstansok.`),
        MB.formula('Polárkoordináta', R`x=r\cos\varphi,\quad y=r\sin\varphi,\quad dA=r\,dr\,d\varphi,\qquad r\ge0,\ 0\le\varphi\le2\pi.`),
        MB.formula('Henger- és gömbi koordináta', R`\begin{aligned}
\text{henger: } & x=r\cos\varphi,\ y=r\sin\varphi,\ z=z, & dV&=r\,dr\,d\varphi\,dz,\\
\text{gömb: } & x=\rho\sin\varphi\cos\vartheta,\ y=\rho\sin\varphi\sin\vartheta,\ z=\rho\cos\varphi, & dV&=\rho^2\sin\varphi\,d\rho\,d\varphi\,d\vartheta.
\end{aligned}`, R`A gömbnél $\varphi$ a polárszög a $z$-tengelytől ($0\le\varphi\le\pi$), $\vartheta$ az azimut ($0\le\vartheta\le2\pi$).`),
        MB.note('Honnan jön a Jacobi?', R`Polárkoordinátában egy kis $[r,r+\Delta r]\times[\varphi,\varphi+\Delta\varphi]$ téglalap képe egy körcikk, amelynek területe $\frac12((r+\Delta r)^2-r^2)\Delta\varphi\approx r\,\Delta r\,\Delta\varphi$. Ezért $dA=r\,dr\,d\varphi$. Általában a koordinátaváltásnál a terület- (térfogat-) elem a Jacobi-determináns abszolút értékével szorzódik: $dA=|\det J|\,du\,dv$.`),
        MB.warn('A leggyakoribb hibák', R`(1) A Jacobi tényező elhagyása: $\iint e^{-(x^2+y^2)}dx\,dy$ polárban $r$-rel szorzódik, különben rossz eredmény jön. (2) A határok felcserélése vagy a belső integrálban a külső változó elhagyása. (3) A szimmetria figyelmen kívül hagyása: páratlan függvény szimmetrikus tartományon nullát ad, ami sok munkát megspórol.`),
        MB.list('Melyik koordináta?', [
          R`Téglalap, háromszög, görbék közti tartomány: derékszögű.`,
          R`Kör, körgyűrű, körcikk: polár.`,
          R`Henger, kúp, forgástest: hengerkoordináta.`,
          R`Gömb, gömbhéj, kúp csúcsa: gömbi koordináta.`
        ])
      ],
      examples: [
        MB.example({
          title: 'Kettős integrál egységnégyzeten',
          problem: R`Számítsuk ki: $\displaystyle\iint_{[0,1]^2}(x^2+y)\,dA$.`,
          steps: [
            R`A Fubini-tétel szerint a sorrend tetszőleges:
$$\int_0^1\left(\int_0^1(x^2+y)\,dy\right)dx.$$`,
            R`Belső integrál ($x$ konstans): $\int_0^1(x^2+y)\,dy=\left[x^2y+\frac{y^2}{2}\right]_0^1=x^2+\frac12$.`,
            R`Külső integrál: $\int_0^1\left(x^2+\frac12\right)dx=\frac13+\frac12=\frac56$.`,
            R`Ellenőrzés a másik sorrenddel: $\int_0^1\left(\frac13+y\right)dy=\frac13+\frac12=\frac56$.`
          ],
          answer: R`$\dfrac56$`
        }),
        MB.example({
          title: 'Az egységkör területe polárban',
          problem: R`Számítsuk ki az $x^2+y^2\le1$ körlemez területét.`,
          steps: [
            R`A tartomány polárban $0\le r\le1$, $0\le\varphi\le2\pi$ — mindkét határ konstans.`,
            R`A terület: $\iint_T1\,dA=\int_0^{2\pi}\int_0^1 r\,dr\,d\varphi$.`,
            R`Belső: $\int_0^1r\,dr=\frac12$. Külső: $\int_0^{2\pi}\frac12\,d\varphi=\pi$.`,
            R`Az eredmény $\pi$, ami egyezik a geometriai képlettel. Ha a Jacobit elfelejtenénk, $2\pi$ jönne ki — látszik, hogy a tényező lényeges.`
          ],
          answer: R`$\pi$`
        }),
        MB.example({
          title: 'Gauss-integrál polárban',
          problem: R`Számítsuk ki: $\displaystyle\iint_{\mathbb R^2}e^{-(x^2+y^2)}\,dA$.`,
          steps: [
            R`Polárban $x^2+y^2=r^2$ és $dA=r\,dr\,d\varphi$, a tartomány $0\le r<\infty$, $0\le\varphi\le2\pi$.`,
            R`Az integrál szétválik: $\left(\int_0^{2\pi}d\varphi\right)\left(\int_0^\infty e^{-r^2}r\,dr\right)$.`,
            R`A sugár szerinti integrál: helyettesítés $u=r^2$, $du=2r\,dr$, így $\int_0^\infty e^{-r^2}r\,dr=\frac12\int_0^\infty e^{-u}du=\frac12$.`,
            R`Tehát az eredmény $2\pi\cdot\frac12=\pi$. Ebből az is következik, hogy $\int_{-\infty}^{\infty}e^{-x^2}dx=\sqrt\pi$.`
          ],
          answer: R`$\pi$`
        }),
        MB.example({
          title: 'A gömb térfogata',
          problem: R`Vezessük le az $R$ sugarú gömb térfogatát.`,
          steps: [
            R`Gömbi koordinátában a gömb: $0\le\rho\le R$, $0\le\varphi\le\pi$, $0\le\vartheta\le2\pi$.`,
            R`$V=\int_0^{2\pi}\int_0^{\pi}\int_0^R\rho^2\sin\varphi\,d\rho\,d\varphi\,d\vartheta$.`,
            R`A három integrál szorzatra bomlik: $\left(\int_0^{2\pi}d\vartheta\right)\left(\int_0^{\pi}\sin\varphi\,d\varphi\right)\left(\int_0^R\rho^2\,d\rho\right)$.`,
            R`Értékek: $2\pi$, $[-\cos\varphi]_0^\pi=2$, illetve $\frac{R^3}{3}$.`,
            R`Szorzat: $2\pi\cdot2\cdot\frac{R^3}{3}=\frac{4\pi R^3}{3}$.`
          ],
          answer: R`$V=\dfrac{4\pi R^3}{3}$`
        })
      ],
      mistakes: [
        R`A Jacobi-tényező ($r$, illetve $\rho^2\sin\varphi$) elhagyása koordinátaváltásnál.`,
        R`A belső integrál határaiba a külső változó behelyettesítésének elhagyása normáltartománynál.`,
        R`A gömbnél a két szög szerepének felcserélése: a $\sin\varphi$ tényező a $z$-tengelytől mért szöghöz tartozik.`,
        R`Szimmetrikus tartományon páratlan függvényt hosszadalmasan integrálni ahelyett, hogy nullát írnánk.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Mennyi $\displaystyle\iint_{[0,1]^2}(x+y)\,dA$?`, a: '1', type: 'number', hint: R`$\int_0^1x\,dx=\frac12$, és ugyanaz $y$-ra.`, sol: R`$\frac12+\frac12=1$.` }),
        MB.q({ level: 1, q: R`Mennyi az egységkörlemez területe?`, a: 'pi', alt: ['π', '3.14159'], type: 'expr', hint: R`Polárban $\int_0^{2\pi}\int_0^1 r\,dr\,d\varphi$.`, sol: R`$2\pi\cdot\frac12=\pi$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\iint_D x\,dA$, ahol $D=\{(x,y):0\le y\le x\le1\}$.`, a: '1/3', type: 'expr', hint: R`$\int_0^1\int_0^x x\,dy\,dx$.`, sol: R`$\int_0^1x\cdot x\,dx=\int_0^1x^2dx=\frac13$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\iint_D y\,dA$ ugyanezen a $D$ háromszögön.`, a: '1/6', type: 'expr', hint: R`$\int_0^1\int_0^x y\,dy\,dx$.`, sol: R`$\int_0^1\frac{x^2}{2}dx=\frac16$.` }),
        MB.q({ level: 2, q: R`Mi a gömbkoordinátás térfogatelem?`, type: 'choice', choices: [R`$\rho^2\sin\varphi\,d\rho\,d\varphi\,d\vartheta$`, R`$\rho\sin\varphi\,d\rho\,d\varphi\,d\vartheta$`, R`$\rho^2\,d\rho\,d\varphi\,d\vartheta$`], a: '0', sol: R`$dV=\rho^2\sin\varphi\,d\rho\,d\varphi\,d\vartheta$, a Jacobi-determináns abszolút értéke.` }),
        MB.q({ level: 3, q: R`Mennyi az $R=2$ sugarú gömb térfogata?`, a: '32*pi/3', alt: ['32π/3', '10.6667*pi'], type: 'expr', hint: R`$V=\frac{4\pi R^3}{3}$.`, sol: R`$\frac{4\pi\cdot8}{3}=\frac{32\pi}{3}$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy az egységkörlemez területe $\pi$, a polárkoordinátás területelem segítségével.`, type: 'proof', sol: R`A lemez polárban $0\le r\le1$, $0\le\varphi\le2\pi$. Egy kis körcikk területe $\frac12((r+\Delta r)^2-r^2)\Delta\varphi\approx r\,\Delta r\,\Delta\varphi$, ezért $dA=r\,dr\,d\varphi$. Így a terület $\int_0^{2\pi}\int_0^1r\,dr\,d\varphi=\int_0^{2\pi}\frac12\,d\varphi=\pi$.` }),
        MB.q({ level: 2, q: R`Mennyi $\displaystyle\iint_{x^2+y^2\le4}e^{-(x^2+y^2)}\,dA$?`, a: 'pi*(1-e^(-4))', alt: ['π(1-e^(-4))', 'pi-pi*e^(-4)'], type: 'expr', hint: R`Polárban $\int_0^{2\pi}\int_0^2 e^{-r^2}r\,dr\,d\varphi$.`, sol: R`$2\pi\cdot\left[-\frac12e^{-r^2}\right]_0^2=2\pi\cdot\frac{1-e^{-4}}{2}=\pi(1-e^{-4})$.` })
      ],
      video: { title: 'Kettős és hármas integrál, koordinátaváltás', channel: 'Magyar matematika csatornák', kind: 'KERESÉS', search: 'kettős integrál polárkoordináta hármas integrál gömbkoordináta magyar' }
    }
  ]
});
