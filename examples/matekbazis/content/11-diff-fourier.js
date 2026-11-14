var R = String.raw;
MB.section({
  id: 'diff-fourier', num: '11', title: 'Differenciálegyenletek, rekurziók, Fourier', subtitle: 'Változás és periodikus jelenségek',
  examTag: 'Analízis 2',
  intro: 'A differenciálegyenlet nem új matematikai tárgy, hanem az analízis alkalmazása: adott a változás törvénye (a derivált), és keressük a függvényt. A lineáris rekurzió ugyanez diszkrét időben, a Fourier-sor pedig az az ötlet, hogy egy periodikus jelet szinuszok és koszinuszok összegére bontunk — vagyis a függvényt a trigonometrikus rendszer szerint koordinátázzuk.',
  chapters: [
    {
      id: 'diffegyenletek', num: '11.1', title: 'Elsőrendű egyenletek, izoklinák, lineáris rekurziók', minutes: 34,
      lead: 'Az elsőrendű egyenlet geometriailag egy iránymező: minden pontban megmondja, merre halad a megoldásgörbe. Két esetben van zárt képlet: ha szeparálható, illetve ha lineáris. A lineáris rekurzió ugyanez a gondolat diszkrét lépésekkel, ahol a karakterisztikus egyenlet veszi át a differenciálegyenlet szerepét.',
      why: [
        R`Az $y'=f(x,y)$ egyenlet nem azt mondja meg, hol van a függvény, hanem azt, hogy minden pontban milyen meredekséggel halad tovább. Ezért a megoldás nem egyetlen görbe, hanem görbék egy családja: minden kezdeti pontból egy. Az izoklinák (az $f(x,y)=c$ görbék) pontosan azok a helyek, ahol a megoldások meredeksége $c$; ezek felrajzolásával az egész megoldáscsalád viselkedése látható számolás nélkül is.`,
        R`A szeparábilis egyenletet azért tudjuk megoldani, mert a változók szétválnak: minden $y$ az egyik oldalra, minden $x$ a másikra kerül, majd integrálunk. A lineáris egyenletnél más a trükk: egy $e^{\int p}$ szorzóval a bal oldal pontosan egy szorzat deriváltjává válik, így már csak integrálni kell. Mindkét módszer ugyanazt teszi: az egyenletet olyan alakra hozza, amit már ismerünk.`,
        R`A rekurziónál a megoldást $n$-edik hatvány alakjában keressük, mert a $a_n=\lambda^n$ próbafüggvényt beírva a rekurzióba a $\lambda^n$ kiemelhető, és egy közönséges másodfokú egyenlet marad. Ezért lesz a megoldás a karakterisztikus gyökök hatványainak lineáris kombinációja — és ezért jelenik meg a Fibonacci-sorozatban az aranymetszés.`
      ],
      when: 'Fizikában (bomlás, hűlés, rezgés, populációdinamika), informatikában (futásidő-rekurziók, jelszűrés), pénzügyben (kamat, járadék). A zh-n az elsőrendű lineáris és a szeparábilis egyenlet szinte mindig szerepel, a rekurzió pedig leggyakrabban Fibonacci vagy másodrendű lineáris alakban.',
      theory: [
        MB.def('Differenciálegyenlet, megoldás, kezdeti érték', R`Az $y'=f(x,y)$ elsőrendű explicit egyenlet megoldása egy olyan differenciálható $y(x)$ függvény egy intervallumon, amelyre $y'(x)=f(x,y(x))$ minden pontban. Általános megoldáson a megoldások egyparaméteres családját értjük; a kezdeti feltétel $y(x_0)=y_0$ egyetlen görbét választ ki.`),
        MB.formula('Szeparábilis egyenlet', R`\frac{dy}{dx}=f(x)g(y)\ \Longrightarrow\ \int\frac{dy}{g(y)}=\int f(x)\,dx.`, 'A $g(y)=0$ helyeken konstans megoldások lehetnek, amelyeket az osztás elrejthet.'),
        MB.formula('Elsőrendű lineáris egyenlet', R`y'+p(x)y=q(x)\ \Longrightarrow\ y=e^{-\int p(x)dx}\left(\int q(x)e^{\int p(x)dx}dx+C\right).`, R`A szorzó $\mu(x)=e^{\int p\,dx}$, amivel $(\mu y)'=\mu q$ adódik.`),
        MB.def('Izoklina és iránymező', R`Az $y'=f(x,y)$ egyenlet izoklinája a $c$ meredekséghez az $f(x,y)=c$ görbe. A sík pontjaiba berajzolt kis szakaszok (iránymező) mentén a megoldásgörbék „simulnak” az izoklinákhoz. Például $y'=x+y$ esetén az izoklinák az $x+y=c$ egyenesek.`),
        MB.thm('Lineáris rekurzió karakterisztikus egyenlete', R`Ha $a_n=pa_{n-1}+qa_{n-2}$, akkor az $a_n=\lambda^n$ próbamegoldást beírva $\lambda^n=p\lambda^{n-1}+q\lambda^{n-2}$, azaz $\lambda^2=p\lambda+q$. Két különböző valós gyök esetén
$$a_n=A\lambda_1^n+B\lambda_2^n,$$
ahol $A,B$ a kezdeti értékekből határozható meg.`),
        MB.note('Kétszeres és komplex gyök', R`Ha $\lambda_1=\lambda_2=\lambda$, akkor $a_n=(A+Bn)\lambda^n$. Ha a gyökök komplexek, $\lambda=r(\cos\vartheta\pm i\sin\vartheta)$, akkor $a_n=r^n(C\cos n\vartheta+D\sin n\vartheta)$ — valós sorozatnál ez valós alak.`),
        MB.note('Fibonacci-sorozat', R`$F_n=F_{n-1}+F_{n-2}$, $F_0=0$, $F_1=1$. A karakterisztikus egyenlet $\lambda^2=\lambda+1$, gyökei $\varphi=\frac{1+\sqrt5}{2}$ és $\psi=\frac{1-\sqrt5}{2}$. Innen
$$F_n=\frac{\varphi^n-\psi^n}{\sqrt5},$$
ami egész $n$-re is egész számot ad — ez a Binet-formula.`),
        MB.warn('Amit el szoktak rontani', R`Szeparálásnál a $g(y)$-val osztás elvesztheti a $g(y)=0$ konstans megoldásokat. Az integrálásnál $\int\frac{dy}{y}=\ln|y|$, nem $\ln y$. A rekurzióhoz két kezdeti érték kell, különben $A,B$ nem határozható meg. Az általános megoldásban a konstans nem hagyható el.`),
        MB.list('Megoldási menetrend', [
          R`Szeparábilis: rendezd $g(y)dy=f(x)dx$ alakra, majd integrálj mindkét oldalon.`,
          R`Lineáris: számold ki $\mu=e^{\int p}$, szorozz át, majd integráld $(\mu y)'=\mu q$-t.`,
          R`Rekurzió: írd fel $\lambda^2-p\lambda-q=0$-t, oldd meg, majd a kezdeti értékekből $A,B$ (vagy $C,D$).`,
          R`Ellenőrzés: a kapott függvényt visszahelyettesítve az egyenletnek azonosságnak kell lennie.`
        ])
      ],
      examples: [
        MB.example({
          title: 'Exponenciális növekedés',
          problem: R`Oldjuk meg: $y'=ky$, ahol $k$ konstans.`,
          steps: [
            R`Szeparálható: $\dfrac{dy}{y}=k\,dx$ (az $y\equiv0$ konstans megoldás külön).`,
            R`Integrálva: $\ln|y|=kx+C$.`,
            R`Exponenciálra emelve: $|y|=e^{C}e^{kx}$, azaz $y=Ce^{kx}$ (a $C$ előjel is elnyelhető).`,
            R`Kezdeti feltétellel $y(0)=y_0$: $C=y_0$, tehát $y=y_0e^{kx}$. Ez a bomlás ($k<0$) és a növekedés ($k>0$) alaptörvénye.`
          ],
          answer: R`$y=Ce^{kx}$`
        }),
        MB.example({
          title: 'Szeparábilis egyenlet',
          problem: R`Oldjuk meg: $y'=xy$.`,
          steps: [
            R`$\dfrac{dy}{y}=x\,dx$; az $y\equiv0$ megoldás is megengedett.`,
            R`Integrálva: $\ln|y|=\dfrac{x^2}{2}+C$.`,
            R`Innen $|y|=e^C e^{x^2/2}$, tehát $y=Ce^{x^2/2}$.`,
            R`Ellenőrzés: $y'=Cxe^{x^2/2}=xy$. Ez a Gauss-függvény, amely az $e^{-x^2}$ integrálásánál bukkan fel.`
          ],
          answer: R`$y=Ce^{x^2/2}$`
        }),
        MB.example({
          title: 'Elsőrendű lineáris egyenlet',
          problem: R`Oldjuk meg: $y'+y=e^x$.`,
          steps: [
            R`Itt $p(x)=1$, $q(x)=e^x$, tehát $\mu=e^{\int1\,dx}=e^x$.`,
            R`Szorozva: $e^x y'+e^x y=e^{2x}$, azaz $(e^x y)'=e^{2x}$.`,
            R`Integrálva: $e^x y=\dfrac{e^{2x}}{2}+C$.`,
            R`Osztva $e^x$-szel: $y=\dfrac{e^x}{2}+Ce^{-x}$.`,
            R`Ellenőrzés: $y'+y=\left(\frac{e^x}{2}-Ce^{-x}\right)+\left(\frac{e^x}{2}+Ce^{-x}\right)=e^x$.`
          ],
          answer: R`$y=\dfrac{e^x}{2}+Ce^{-x}$`
        }),
        MB.example({
          title: 'Másodrendű lineáris rekurzió',
          problem: R`Oldjuk meg: $a_n=5a_{n-1}-6a_{n-2}$.`,
          steps: [
            R`A karakterisztikus egyenlet: $\lambda^2-5\lambda+6=0$, azaz $(\lambda-2)(\lambda-3)=0$.`,
            R`Két különböző gyök: $\lambda_1=2$, $\lambda_2=3$, ezért $a_n=A\cdot2^n+B\cdot3^n$.`,
            R`A kezdeti értékekből (például $a_0=0$, $a_1=1$): $A+B=0$ és $2A+3B=1$.`,
            R`Az elsőből $A=-B$, beírva $-2B+3B=1$, tehát $B=1$, $A=-1$.`,
            R`Így $a_n=3^n-2^n$. Ellenőrzés: $a_2=9-4=5$, amit a rekurzió is ad ($5\cdot1-6\cdot0=5$); $a_3=27-8=19=5\cdot5-6\cdot1$.`
          ],
          answer: R`$a_n=A\cdot2^n+B\cdot3^n$, a kezdeti értékekkel $a_n=3^n-2^n$`
        })
      ],
      mistakes: [
        R`Szeparálásnál $y$-nal osztani és elveszíteni az $y\equiv0$ megoldást.`,
        R`$\int\frac{dy}{y}=\ln y$ írása $\ln|y|$ helyett, majd negatív $y$ esetén értelmetlen eredmény.`,
        R`A lineáris egyenletnél a $\mu$ szorzó elhagyása vagy rossz előjellel való felírása.`,
        R`A rekurziónál a karakterisztikus egyenletet $\lambda^2=p\lambda+q$ helyett $p\lambda+q=0$-ként felírni.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Mi az $y'=3y$ egyenlet általános megoldása?`, a: 'y=C*e^(3x)', alt: ['C*e^(3x)', 'Ce^{3x}', 'y=Ce^(3x)'], type: 'text', hint: R`Szeparáld: $dy/y=3dx$.`, sol: R`$\ln|y|=3x+C$, tehát $y=Ce^{3x}$.` }),
        MB.q({ level: 1, q: R`Mely görbék az $y'=x+y$ egyenlet izoklinái?`, type: 'choice', choices: ['Az $x+y=c$ egyenesek', 'Az $xy=c$ hiperbolák', 'Az $y=cx$ egyenesek'], a: '0', sol: R`$y'=c$ pontosan akkor, ha $x+y=c$, tehát az izoklinák párhuzamos egyenesek.` }),
        MB.q({ level: 2, q: R`Mi az $y'+y=e^x$ egyenlet általános megoldása?`, a: 'e^x/2+C*e^(-x)', alt: ['y=e^x/2+Ce^(-x)', '0.5e^x+Ce^(-x)'], type: 'text', hint: R`$\mu=e^x$; $(\mu y)'=\mu q$.`, sol: R`$(e^xy)'=e^{2x}\Rightarrow e^xy=e^{2x}/2+C\Rightarrow y=e^x/2+Ce^{-x}$.` }),
        MB.q({ level: 2, q: R`Az $a_n=5a_{n-1}-6a_{n-2}$, $a_0=0$, $a_1=1$ sorozatnál mennyi $a_3$?`, a: '19', type: 'number', hint: R`Előbb $a_2=5a_1-6a_0$.`, sol: R`$a_2=5$, $a_3=5\cdot5-6\cdot1=19$. A zárt alak $3^n-2^n$: $27-8=19$.` }),
        MB.q({ level: 2, q: R`Mennyi a Fibonacci-sorozat 10. tagja ($F_0=0$, $F_1=1$)?`, a: '55', type: 'number', hint: R`Írd fel az első néhány tagot.`, sol: R`$0,1,1,2,3,5,8,13,21,34,55$, tehát $F_{10}=55$.` }),
        MB.q({ level: 2, q: R`Oldd meg: $y'=y^2$, $y(0)=1$. Melyik $x$-nél nem folytatható a megoldás?`, a: '1', type: 'number', hint: R`$dy/y^2=dx$, majd integrálj.`, sol: R`$-1/y=x+C$; $y(0)=1\Rightarrow C=-1$, tehát $y=1/(1-x)$, ami $x=1$-nél végtelenhez tart.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy ha $\lambda_1\neq\lambda_2$ a karakterisztikus egyenlet gyökei, akkor $a_n=A\lambda_1^n+B\lambda_2^n$ minden $A,B$-re megoldás, és minden megoldás ilyen alakú.`, type: 'proof', sol: R`Behelyettesítés: $A\lambda_1^n+B\lambda_2^n=p(A\lambda_1^{n-1}+B\lambda_2^{n-1})+q(A\lambda_1^{n-2}+B\lambda_2^{n-2})$ pontosan akkor teljesül, ha $\lambda_i^2=p\lambda_i+q$, ami a karakterisztikus egyenlet. A másik irány: adott $a_0,a_1$-hez az $A+B=a_0$, $A\lambda_1+B\lambda_2=a_1$ lineáris rendszer egyértelműen megoldható, mert a determináns $\lambda_2-\lambda_1\neq0$. Az így kapott sorozat kielégíti a rekurziót és a kezdeti feltételeket, és a rekurzió egyértelműen meghatározza a sorozatot, tehát ez az egyetlen megoldás.` }),
        MB.q({ level: 3, q: R`Mennyi az $a_n=2a_{n-1}-a_{n-2}$ rekurzió általános megoldása, ha a karakterisztikus egyenletnek kétszeres gyöke van?`, a: 'A+B*n', alt: ['A+Bn', '(A+Bn)', 'A+Bn*1^n'], type: 'text', hint: R`A karakterisztikus egyenlet $\lambda^2-2\lambda+1=(\lambda-1)^2=0$, tehát $\lambda=1$ kétszeres gyök.`, sol: R`Kétszeres gyöknél $a_n=(A+Bn)\lambda^n$; itt $\lambda=1$, így $a_n=A+Bn$.` })
      ],
      video: { title: 'Elsőrendű differenciálegyenletek és lineáris rekurziók', channel: 'Magyar matematika csatornák', kind: 'KERESÉS', search: 'elsőrendű differenciálegyenlet szeparábilis lineáris rekurzió karakterisztikus egyenlet' }
    },
    {
      id: 'fourier', num: '11.2', title: 'Fourier-sorok', minutes: 34,
      lead: 'A Fourier-sor azt állítja, hogy egy periodikus függvény előáll szinuszok és koszinuszok végtelen összegeként. Az együtthatókat integrállal kapjuk meg, mert a trigonometrikus függvények ortogonálisak — ugyanúgy, ahogy egy vektor koordinátáit skaláris szorzattal lehet kiemelni.',
      why: [
        R`A trigonometrikus rendszer ortogonális: $\int_{-\pi}^{\pi}\sin(mx)\sin(nx)dx=0$, ha $m\neq n$. Ez pontosan ugyanaz a tulajdonság, mint a merőleges bázisvektoroké: ha egy vektort bázisvektorok összegeként írunk fel, az együtthatót skaláris szorzattal kapjuk meg. Itt a skaláris szorzat szerepét az integrál játssza, ezért lesz $b_n=\frac1\pi\int f(x)\sin(nx)dx$.`,
        R`A sorozat konvergenciája nem automatikus, de Dirichlet tétele megnyugtató: szakaszonként sima függvénynél a Fourier-sor minden pontban a függvényértékhez tart, az ugráshelyeken pedig a két oldali határérték átlagához. Ezért lesz a $\pm1$ értékű négyszögjel sorozata az ugrásnál $0$-hoz, nem $1$-hez vagy $-1$-hez.`,
        'A gyakorlati ereje abban van, hogy a szinuszok a lineáris, eltolásinvariáns rendszerek sajátfüggvényei: egy szinusz bemenetre a rendszer szinuszt ad ki, csak amplitúdót és fázist változtat. Ezért lehet a jelet harmonikus összetevőire bontani, és mindegyikkel külön számolni — ez a jelfeldolgozás, a hővezetés és a kép tömörítésének alapja.'
      ],
      when: 'Periodikus jelek elemzésénél (hang, váltóáram, vivőjel), hővezetési és hullámegyenlet megoldásánál, parciális differenciálegyenletek szétválasztásánál. A zh-n jellemzően négyszögjel vagy $f(x)=x$ együtthatóinak kiszámítása, a konvergencia értékének megadása ugráshelyen, illetve a páros/páratlan egyszerűsítés a kérdés.',
      theory: [
        MB.def('Periodikus függvény és trigonometrikus rendszer', R`Az $f$ $2\pi$-periodikus, ha $f(x+2\pi)=f(x)$ minden $x$-re. A trigonometrikus rendszer elemei $1,\cos x,\sin x,\cos2x,\sin2x,\dots$; ezek ortogonálisak egymásra az $[-\pi,\pi]$ intervallumon vett integrál szerint.`),
        MB.thm('Ortogonalitás', R`$$ \begin{aligned}
\int_{-\pi}^{\pi}\cos(mx)\cos(nx)\,dx&=\begin{cases}0,&m\neq n,\\ \pi,&m=n\neq0,\end{cases}\\
\int_{-\pi}^{\pi}\sin(mx)\sin(nx)\,dx&=\begin{cases}0,&m\neq n,\\ \pi,&m=n\neq0,\end{cases}\\
\int_{-\pi}^{\pi}\cos(mx)\sin(nx)\,dx&=0.
\end{aligned} $$`, R`Az 1 konstansfüggvény integrálja $2\pi$, ezért kap az $a_0$ kettes osztót.`),
        MB.formula('Fourier-együtthatók és a sor', R`\begin{aligned}
a_0&=\frac1\pi\int_{-\pi}^{\pi}f(x)\,dx,\\
a_n&=\frac1\pi\int_{-\pi}^{\pi}f(x)\cos(nx)\,dx,\\
b_n&=\frac1\pi\int_{-\pi}^{\pi}f(x)\sin(nx)\,dx,\\
f(x)&\sim\frac{a_0}{2}+\sum_{n=1}^{\infty}\left(a_n\cos(nx)+b_n\sin(nx)\right).
\end{aligned}`),
        MB.note('Páros és páratlan egyszerűsítés', R`Ha $f$ páros ($f(-x)=f(x)$), akkor $f(x)\sin(nx)$ páratlan, ezért $b_n=0$: csak koszinuszok maradnak (koszinusz-sor). Ha $f$ páratlan, akkor $f(x)\cos(nx)$ és $f$ is páratlan, ezért $a_n=0$ és $a_0=0$: csak szinuszok maradnak. Ez a fél munka elvégzését jelenti, ezért érdemes az első lépésként a szimmetriát megvizsgálni.`),
        MB.thm('Dirichlet-tétel (konvergencia)', R`Ha $f$ $2\pi$-periodikus, szakaszonként folytonosan differenciálható, akkor a Fourier-sora minden pontban konvergál, éspedig
$$\frac{a_0}{2}+\sum_{n=1}^\infty\left(a_n\cos nx+b_n\sin nx\right)=\frac{f(x^+)+f(x^-)}{2}.$$
Folytonossági pontban ez $f(x)$; ugráshelyen a két oldali határérték átlaga.`),
        MB.formula('Általános periódus $2L$', R`a_n=\frac1L\int_{-L}^{L}f(x)\cos\frac{n\pi x}{L}dx,\qquad b_n=\frac1L\int_{-L}^{L}f(x)\sin\frac{n\pi x}{L}dx,\qquad f(x)\sim\frac{a_0}{2}+\sum_{n\ge1}\left(a_n\cos\frac{n\pi x}{L}+b_n\sin\frac{n\pi x}{L}\right).`),
        MB.formula('Parseval-azonosság', R`\frac1\pi\int_{-\pi}^{\pi}|f(x)|^2dx=\frac{a_0^2}{2}+\sum_{n=1}^{\infty}\left(a_n^2+b_n^2\right).`, 'Ez a „Pitagorasz-tétel” a függvények terében: a jel energiája az együtthatók négyzetösszege.'),
        MB.list('Hol találkozunk vele', [
          R`Jelfeldolgozás: a hangot frekvenciakomponensekre bontja.`,
          R`Hővezetés: a hőmérséklet kezdeti profilját szinuszokra bontva a diffúzió egyszerűen számolható.`,
          R`Elektrotechnika: nem szinuszos jel felharmonikusai.`,
          R`Képtömörítés: a Fourier- (illetve koszinusz-) transzformált együtthatóinak elhagyása.`
        ])
      ],
      examples: [
        MB.example({
          title: 'Négyszögjel Fourier-sora',
          problem: R`Legyen $f(x)=-1$ a $(-\pi,0)$ intervallumon és $f(x)=1$ a $(0,\pi)$ intervallumon, $2\pi$-periodikusan kiterjesztve. Határozzuk meg a Fourier-sorát.`,
          steps: [
            R`$f$ páratlan, ezért $a_0=0$ és minden $a_n=0$; csak $b_n$ marad.`,
            R`$b_n=\frac1\pi\int_{-\pi}^{\pi}f(x)\sin(nx)dx=\frac2\pi\int_0^{\pi}\sin(nx)dx$.`,
            R`$\int_0^\pi\sin(nx)dx=\left[-\frac{\cos(nx)}{n}\right]_0^\pi=\frac{1-\cos(n\pi)}{n}=\frac{1-(-1)^n}{n}$.`,
            R`Tehát $b_n=\frac{2(1-(-1)^n)}{n\pi}$: páros $n$-re $0$, páratlan $n$-re $\frac{4}{n\pi}$.`,
            R`A sor: $f(x)\sim\frac4\pi\left(\sin x+\frac{\sin3x}{3}+\frac{\sin5x}{5}+\cdots\right)$.`
          ],
          answer: R`$f(x)\sim\dfrac4\pi\displaystyle\sum_{k=0}^{\infty}\frac{\sin((2k+1)x)}{2k+1}$`
        }),
        MB.example({
          title: 'Az $f(x)=x$ sorfejtése',
          problem: R`Határozzuk meg az $f(x)=x$ függvény Fourier-sorát a $(-\pi,\pi)$ intervallumon.`,
          steps: [
            R`$f$ páratlan, ezért $a_0=0$ és $a_n=0$.`,
            R`$b_n=\frac1\pi\int_{-\pi}^{\pi}x\sin(nx)dx=\frac2\pi\int_0^{\pi}x\sin(nx)dx$.`,
            R`Parciális integrálás: $\int_0^\pi x\sin(nx)dx=\left[-\frac{x\cos(nx)}{n}\right]_0^\pi+\frac1n\int_0^\pi\cos(nx)dx=-\frac{\pi(-1)^n}{n}+0$.`,
            R`Így $b_n=\frac2\pi\cdot\frac{\pi(-1)^{n+1}}{n}=\frac{2(-1)^{n+1}}{n}$.`,
            R`A sor: $x\sim2\left(\sin x-\frac{\sin2x}{2}+\frac{\sin3x}{3}-\cdots\right)$ az $(-\pi,\pi)$ intervallumon.`
          ],
          answer: R`$x\sim2\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n+1}}{n}\sin(nx)$`
        }),
        MB.example({
          title: 'Konvergencia ugráshelyen és egy nevezetes összeg',
          problem: R`Mit ad a négyszögjel Fourier-sora az $x=0$ és az $x=\frac{\pi}{2}$ pontban?`,
          steps: [
            R`$x=0$ ugráshely: a bal oldali határérték $-1$, a jobb oldali $+1$, tehát a sor értéke $\frac{-1+1}{2}=0$. Ez összevág azzal, hogy minden tag $\sin0=0$.`,
            R`$x=\frac{\pi}{2}$ folytonossági pont, ahol $f=1$, ezért a sornak $1$-hez kell tartania.`,
            R`Behelyettesítve: $\frac4\pi\left(1-\frac13+\frac15-\frac17+\cdots\right)=1$.`,
            R`Átrendezve: $1-\frac13+\frac15-\cdots=\frac{\pi}{4}$, ami a Leibniz-sor. A Fourier-sor tehát numerikus összegek kiszámítására is használható.`
          ],
          answer: R`$x=0$-ban $0$, $x=\frac\pi2$-ben $1$; innen $\frac\pi4=1-\frac13+\frac15-\cdots$`
        })
      ],
      mistakes: [
        R`Az ugráshelyen a függvényértéket írni a sor határértékeként; helyesen a két oldali határérték átlaga.`,
        R`Az $a_0$ elé a $2$-es osztót elfelejteni: a sorban $a_0/2$ áll, nem $a_0$.`,
        R`Páratlan függvénynél koszinuszos tagokat is számolni — azok automatikusan nullák.`,
        R`A periódus $2L$ esetén a $\frac1L$ szorzót és a $\frac{n\pi x}{L}$ argumentumot elhagyni.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Mennyi az $f(x)=x$ függvény $a_0$ együtthatója a $(-\pi,\pi)$ intervallumon?`, a: '0', type: 'number', hint: R`Páratlan függvény integrálja szimmetrikus intervallumon.`, sol: R`$a_0=\frac1\pi\int_{-\pi}^{\pi}x\,dx=0$.` }),
        MB.q({ level: 2, q: R`Mennyi a fenti négyszögjel $b_1$ együtthatója?`, a: '4/pi', alt: ['4/π', '1.2732'], type: 'expr', hint: R`$b_1=\frac{2(1-\cos\pi)}{\pi}$.`, sol: R`$b_1=\frac{2(1-(-1))}{\pi}=\frac4\pi$.` }),
        MB.q({ level: 1, q: R`Egy páros függvény Fourier-sorában mely együtthatók nullák?`, type: 'choice', choices: ['Az $a_n$ együtthatók', 'A $b_n$ együtthatók', 'Egyik sem'], a: '1', sol: R`Páros $f$-nél $f(x)\sin(nx)$ páratlan, ezért $b_n=0$: csak koszinuszos tagok maradnak.` }),
        MB.q({ level: 2, q: R`Mennyi a négyszögjel Fourier-sorának értéke az $x=\frac{\pi}{2}$ pontban?`, a: '1', type: 'number', hint: R`Ott a függvény folytonos, értéke $1$.`, sol: R`Folytonossági pontban a sor a függvényértéket adja: $1$.` }),
        MB.q({ level: 2, q: R`Mennyi az $f(x)=x$ függvény $a_1$ együtthatója?`, a: '0', type: 'number', hint: R`Páratlan függvény.`, sol: R`$a_1=\frac1\pi\int_{-\pi}^{\pi}x\cos x\,dx=0$, mert a integrandus páratlan.` }),
        MB.q({ level: 2, q: R`Mennyi a négyszögjel Fourier-sorának értéke az $x=0$ ugráshelyen?`, a: '0', type: 'number', hint: R`A két oldali határérték átlaga.`, sol: R`$\frac{-1+1}{2}=0$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy $b_n=\frac1\pi\int_{-\pi}^{\pi}f(x)\sin(nx)dx$, felhasználva a trigonometrikus rendszer ortogonalitását.`, type: 'proof', sol: R`Írjuk fel a sort $f(x)=\frac{a_0}{2}+\sum_k(a_k\cos kx+b_k\sin kx)$ alakban, szorozzuk meg $\sin(nx)$-szel, és integráljunk tagonként $[-\pi,\pi]$-n. Az ortogonalitás miatt minden tag nulla, kivéve a $b_n\sin(nx)$ tagot, amelynek integrálja $b_n\pi$. Így $\int_{-\pi}^{\pi}f(x)\sin(nx)dx=b_n\pi$, amiből $b_n$ adódik.` }),
        MB.q({ level: 3, q: R`A négyszögjelre alkalmazva a Parseval-azonosságot, mennyi $\displaystyle\sum_{k=1}^{\infty}\frac{1}{(2k-1)^2}$?`, a: 'pi^2/8', alt: ['π²/8', 'pi^2/8', '1.2337'], type: 'expr', hint: R`$\frac1\pi\int f^2=2$, és $\sum b_n^2=\frac{16}{\pi^2}\sum_{\text{páratlan}}\frac1{n^2}$.`, sol: R`$\frac1\pi\int_{-\pi}^{\pi}f^2dx=\frac{2\pi}{\pi}=2$. Másrészt $\sum b_n^2=\frac{16}{\pi^2}\sum_{k\ge1}\frac{1}{(2k-1)^2}$. Innen $\sum\frac{1}{(2k-1)^2}=\frac{2\pi^2}{16}=\frac{\pi^2}{8}$.` })
      ],
      video: { id: 'spUNpyF58BY', title: 'But what is the Fourier Transform?', channel: '3Blue1Brown', kind: 'VIDEÓ' }
    }
  ]
});
