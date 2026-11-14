var R = String.raw;
MB.section({
  id: 'diszkret', num: '13', title: 'Diszkrét matematika', subtitle: 'Számelmélet, kombinatorika, gráfok',
  examTag: 'Diszkrét',
  intro: 'A diszkrét matematika a „megszámlálható” világ matematikája: egész számok maradékai, leszámlálási feladatok és hálózatok. A tárgy nehézsége nem a képletekben van, hanem abban, hogy a feladat szövegéből fel kell ismerni, melyik eszköz használható: oszthatóság, kongruencia, binomiális együttható vagy gráfelméleti tétel. Ez a rész a vizsgán leggyakrabban előforduló eszközöket és azok indoklását adja.',
  chapters: [
    {
      id: 'szamelmelet', num: '13.1', title: 'Oszthatóság, kongruenciák, kombinatorika', minutes: 35,
      lead: 'A maradékos osztás az egész számok világának „koordinátarendszere”. A kongruencia nem más, mint a maradékokkal való számolás; a kombinatorika pedig a leszámlálás tudománya, ahol a sorrend és az ismétlés kérdése dönt.',
      why: [
        'Az oszthatóság és a maradékos osztás azért alapvető, mert minden egész számot egyértelműen fel lehet írni $a=qb+r$ alakban, ahol $0\le r<b$. Ez a felírás teszi lehetővé az Euklideszi algoritmust: a közös osztók halmaza nem változik, ha $a$-t helyettesítjük a maradékával. Ezért az algoritmus nem trükk, hanem a maradékos osztás ismételt alkalmazása, amely véges sok lépésben eljut a legnagyobb közös osztóhoz.',
        'A kongruencia $a\equiv b\pmod m$ annyit tesz, hogy $a$ és $b$ ugyanazt a maradékot adja $m$-mel osztva, azaz $m\mid(a-b)$. Ezért a kongruenciákkal úgy lehet számolni, mint az egyenlőségekkel: összeadhatunk, szorozhatunk, hatványozhatunk. A kivétel az osztás: csak olyan számmal lehet osztani, amely relatív prím a modulushoz. A kis Fermat-tétel éppen azt mondja ki, hogy prím modulus esetén a nem nulla maradékok csoportot alkotnak, ezért $a^{p-1}\equiv1$. Ez teszi lehetővé a nagy kitevős hatványok maradékának gyors kiszámítását.',
        'A kombinatorikában a három kérdés: számít-e a sorrend, lehet-e ismételni, és az összes elemet felhasználjuk-e. A permutáció, variáció és kombináció képletei ugyanebből a szorzási szabályból jönnek; a binomiális együttható pedig azt számolja, hányféleképpen választhatunk ki $k$ elemet $n$-ből. A binomiális tétel, a skatulyaelv és a logikai szita mind leszámlálási eszköz, amelyek a vizsgafeladatokban visszatérő minták.'
      ],
      when: 'Oszthatósági és maradékos feladatoknál (gcd, lcm, lineáris kongruencia, nagy hatvány maradéka) az Euklideszi algoritmus és a kis Fermat-tétel a leggyorsabb út. Kombinatorikai feladatoknál először mindig azt kell eldönteni, hogy számít-e a sorrend és megengedett-e az ismétlés; ezután a képlet már mechanikus. A skatulyaelv és a szita akkor kell, amikor a feladat „biztosan van olyan…” vagy „hány olyan van, amely…” formában fogalmaz.',
      theory: [
        MB.def('Oszthatóság és maradékos osztás', R`Azt mondjuk, hogy $a\mid b$ ($a$ osztója $b$-nek), ha van olyan $c$ egész, amelyre $b=ac$. Minden $a$ egész és $b>0$ egész esetén egyértelműen létezik olyan $q$ és $r$, amelyre
$$a=qb+r,\qquad 0\le r<b.$$
Itt $q$ a hányados, $r$ a maradék. Az $a$ és $b$ legnagyobb közös osztója $\gcd(a,b)$, a legkisebb közös többszörös $\operatorname{lcm}(a,b)$; érvényes, hogy $\gcd(a,b)\cdot\operatorname{lcm}(a,b)=|ab|$.`),
        MB.thm('Euklideszi algoritmus', R`Az $a$ és $b$ legnagyobb közös osztója nem változik, ha a nagyobbat a maradékával helyettesítjük:
$$\gcd(a,b)=\gcd(b,\ a\bmod b).$$
Ismételve a maradékok szigorúan csökkennek, ezért az eljárás véget ér; az utolsó nem nulla maradék a $\gcd$.`),
        MB.note('Kiterjesztett Euklidész, moduláris inverz', R`Az algoritmus visszafelé haladva előállítja a Bézout-együtthatókat:
$$ax+by=\gcd(a,b).$$
Ha $\gcd(a,m)=1$, akkor az $ax\equiv1\pmod m$ kongruencia megoldása $x\equiv a^{-1}\pmod m$, amit a $ax+my=1$ Bézout-előállításból olvasunk le.`),
        MB.formula('Kongruenciák műveletei', R`a\equiv b\pmod m \iff m\mid(a-b).`, 'Ha $a\equiv b$ és $c\equiv d\pmod m$, akkor $a+c\equiv b+d$ és $ac\equiv bd\pmod m$. Hatványozás is megengedett. Osztani csak akkor szabad, ha a számláló és a modulus relatív prímek.'),
        MB.thm('Kis Fermat-tétel', R`Ha $p$ prím és $p\nmid a$, akkor
$$a^{p-1}\equiv1\pmod p.$$
Általánosabban, Euler tételével: ha $\gcd(a,m)=1$, akkor $a^{\varphi(m)}\equiv1\pmod m$, ahol $\varphi(m)$ az $m$-hez relatív prímek száma $1$ és $m$ között.`),
        MB.formula('Kombinatorika alapképletei', R`\begin{aligned}
P_n&=n! &&\text{(permutáció)}\\
V_n^k&=\frac{n!}{(n-k)!} &&\text{(ismétlés nélküli variáció)}\\
C_n^k&=\binom nk=\frac{n!}{k!\,(n-k)!} &&\text{(kombináció)}\\
V_n^{k,\text{ism}}&=n^k &&\text{(ismétléses variáció)}
\end{aligned}`, R`Kombinációnál a sorrend nem számít; variációnál számít. Ismétléses kombináció: $\binom{n+k-1}{k}$.`),
        MB.thm('Binomiális tétel', R`$$(a+b)^n=\sum_{k=0}^n\binom nk a^{n-k}b^k.$$
A binomiális együtthatókra érvényes a Pascal-azonosság: $\binom nk=\binom{n-1}{k-1}+\binom{n-1}{k}$.`),
        MB.note('Skatulyaelv és logikai szita', R`Skatulyaelv: ha $n$ tárgyat $m<n$ skatulyába rakunk, valamelyik skatulyában legalább két tárgy lesz. Logikai szita két halmazra:
$$|A\cup B|=|A|+|B|-|A\cap B|,$$
háromra: $|A\cup B\cup C|=|A|+|B|+|C|-|A\cap B|-|A\cap C|-|B\cap C|+|A\cap B\cap C|$.`),
        MB.warn('Az osztás csapdája kongruenciánál', R`A $2x\equiv2\pmod4$ kongruenciából nem következik $x\equiv1\pmod4$: a megoldások $x\equiv1$ és $x\equiv3\pmod4$. Oszthatunk, ha a közös tényező relatív prím a modulushoz; itt $\gcd(2,4)=2\neq1$, ezért a modulus is osztódik: $x\equiv1\pmod2$.`)
      ],
      examples: [
        MB.example({
          title: 'Legnagyobb közös osztó Euklidésszel',
          problem: R`Számítsuk ki $\gcd(84,30)$ értékét.`,
          steps: [
            R`$84=2\cdot30+24$.`,
            R`$30=1\cdot24+6$.`,
            R`$24=4\cdot6+0$ — a maradék nulla, az eljárás véget ér.`,
            R`Az utolsó nem nulla maradék a $6$, tehát $\gcd(84,30)=6$.`
          ],
          answer: R`$\gcd(84,30)=6$`
        }),
        MB.example({
          title: 'Moduláris inverz',
          problem: R`Határozzuk meg a $7$ inverzét modulo $26$.`,
          steps: [
            R`Euklidész: $26=3\cdot7+5$; $7=1\cdot5+2$; $5=2\cdot2+1$.`,
            R`Visszafelé: $1=5-2\cdot2=5-2(7-5)=3\cdot5-2\cdot7$.`,
            R`Majd $5=26-3\cdot7$, ezért $1=3(26-3\cdot7)-2\cdot7=3\cdot26-11\cdot7$.`,
            R`Tehát $-11\cdot7\equiv1\pmod{26}$, azaz $7^{-1}\equiv-11\equiv15\pmod{26}$.`,
            R`Ellenőrzés: $7\cdot15=105=4\cdot26+1$.`
          ],
          answer: R`$7^{-1}\equiv15\pmod{26}$`
        }),
        MB.example({
          title: 'Nagy hatvány maradéka',
          problem: R`Mennyi $3^{100}$ maradéka modulo $7$?`,
          steps: [
            R`A $7$ prím és $7\nmid3$, ezért a kis Fermat-tétel: $3^{6}\equiv1\pmod7$.`,
            R`A kitevőt maradékosan osztjuk $6$-tal: $100=16\cdot6+4$.`,
            R`Így $3^{100}=(3^6)^{16}\cdot3^4\equiv1^{16}\cdot3^4=81\pmod7$.`,
            R`$81=11\cdot7+4$, tehát $3^{100}\equiv4\pmod7$.`
          ],
          answer: R`$3^{100}\equiv4\pmod7$`
        }),
        MB.example({
          title: 'Kombináció kiszámítása',
          problem: R`Hányféleképpen választhatunk ki $7$ ember közül $3$-at?`,
          steps: [
            R`A sorrend nem számít, ismétlés nincs, ezért kombináció: $\binom73$.`,
            R`$\binom73=\dfrac{7!}{3!\,4!}$.`,
            R`Egyszerűsítve: $\dfrac{7\cdot6\cdot5}{3\cdot2\cdot1}=35$.`
          ],
          answer: R`$\binom73=35$`
        })
      ],
      mistakes: [
        R`A kongruenciánál tetszőleges számmal osztunk; csak a modulushoz relatív prím tényezővel szabad.`,
        R`A kis Fermat-tételt nem prím modulusra is használjuk; ott csak az Euler-tétel érvényes, $\varphi(m)$ kitevővel.`,
        R`Kombináció és variáció felcserélése: ha a kiválasztás sorrendje számít, variáció kell.`,
        R`A logikai szitánál a metszetet kivonjuk, de a hármas metszetet nem adjuk vissza (három halmaz esetén).`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Mennyi $\gcd(252,105)$?`, a: '21', type: 'number', hint: R`$252=2\cdot105+42$, majd folytasd.`, sol: R`$252=2\cdot105+42$; $105=2\cdot42+21$; $42=2\cdot21+0$, tehát $\gcd=21$.` }),
        MB.q({ level: 1, q: R`Mennyi a $7$ inverze modulo $26$?`, a: '15', type: 'number', hint: R`Keresd azt az $x$-et, amelyre $7x\equiv1\pmod{26}$.`, sol: R`$7\cdot15=105=4\cdot26+1$, tehát $7^{-1}\equiv15\pmod{26}$.` }),
        MB.q({ level: 2, q: R`Mennyi $2^{100}$ maradéka modulo $13$?`, a: '3', type: 'number', hint: R`$13$ prím, ezért $2^{12}\equiv1\pmod{13}$; $100=8\cdot12+4$.`, sol: R`$2^{100}\equiv2^4=16\equiv3\pmod{13}$.` }),
        MB.q({ level: 1, q: R`Mennyi $\binom{10}{3}$?`, a: '120', type: 'number', hint: R`$\frac{10\cdot9\cdot8}{3\cdot2\cdot1}$.`, sol: R`$\frac{720}{6}=120$.` }),
        MB.q({ level: 2, q: R`Hányféleképpen ülhet le $5$ ember egy padra?`, a: '120', type: 'number', hint: R`Permutáció: $5!$.`, sol: R`$5!=120$.` }),
        MB.q({ level: 2, q: R`Hány olyan $100$-nál nem nagyobb pozitív egész van, amely nem osztható sem $2$-vel, sem $3$-mal?`, a: '33', type: 'number', hint: R`Logikai szita: $100-|A\cup B|$, ahol $A$ a párosak, $B$ a $3$-mal oszthatók halmaza.`, sol: R`$|A|=50$, $|B|=33$, $|A\cap B|=16$ (a $6$-tal oszthatók). $|A\cup B|=50+33-16=67$, így a válasz $100-67=33$.` }),
        MB.q({ level: 3, q: R`Oldd meg: $3x\equiv5\pmod7$. Add meg a legkisebb nemnegatív megoldást!`, a: '4', type: 'number', hint: R`A $3$ inverze modulo $7$ az $5$.`, sol: R`$3^{-1}\equiv5$, ezért $x\equiv5\cdot5=25\equiv4\pmod7$. Ellenőrzés: $3\cdot4=12=7+5$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy bármely $n+1$ darab, az $\{1,2,\dots,2n\}$ halmazból választott különböző egész szám között van két relatív prím.`, type: 'proof', hint: R`Rendezd a számokat, és használd a skatulyaelvet: a $2n$ számból alkotott $n$ pár $(1,2),(3,4),\dots$.`, sol: R`Osszuk a $2n$ számot $n$ párba: $\{1,2\},\{3,4\},\dots,\{2n-1,2n\}$. A skatulyaelv szerint az $n+1$ kiválasztott szám közül kettő ugyanabba a párba esik, tehát két egymást követő egész. Két egymást követő egész relatív prím, mert bármely közös osztó osztja a különbségüket, az $1$-et.` })
      ],
      video: { title: 'Számelmélet és kombinatorika alapok', channel: 'Magyar matematika csatornák', kind: 'KERESÉS', search: 'oszthatóság kongruencia Euklideszi algoritmus kombinatorika magyarázat' }
    },
    {
      id: 'grafok', num: '13.2', title: 'Gráfok', minutes: 30,
      lead: 'A gráf pontok és élek halmaza — vagyis bármilyen hálózat absztrakciója. A fokszám, az összefüggőség és a kör mentén minden gráfelméleti tétel visszavezethető néhány elemi leszámlálásra.',
      why: [
        'A gráf azért hasznos modell, mert a kapcsolatok szerkezetét őrzi meg, a geometriát nem. Egy útkereső, egy közösségi háló vagy egy kapcsolási rajz ugyanazzal a fogalommal írható le: csúcsok és élek. A fokszám azt méri, hány él fut be egy csúcsba; a kézfogás-tétel szerint a fokszámok összege $2|E|$, mert minden él két végpontjánál eggyel növeli a fokszámot. Ebből azonnal következik, hogy a fokszámok összege páros, tehát a páratlan fokú csúcsok száma is páros. Ez a tétel önmagában sok „létezik-e ilyen gráf” feladatot megold.',
        R`Az összefüggőség azt jelenti, hogy bármely két csúcs között vezet út. A fa a legegyszerűbb összefüggő gráf: nincs benne kör, ezért pontosan annyi éle van, ahány csúcs mínusz egy. Ha egy összefüggő gráfban kör van, akkor az él elhagyható anélkül, hogy szétesne — ezért a fák a minimális összefüggő gráfok. A teljes gráfban minden csúcs minden másikkal össze van kötve, ezért $n$ csúcson $\binom n2$ éle van.`,
        'Az Euler-kör az a zárt séta, amely minden élen pontosan egyszer megy át. A feltétel egyszerű és teljes: a gráf összefüggő, és minden fokszám páros. Páratlan fokú csúcs esetén nem lehet „bemenni és kijönni” ugyanannyiszor, ezért a kör megszakad. A páros gráfoknál a kulcs a páratlan kör: egy páros gráf élei két rész között futnak, ezért kör csak páros hosszú lehet; megfordítva, ha nincs páratlan kör, a gráf színezhető két színnel.'
      ],
      when: 'Gráfmodellt használunk minden hálózati feladatnál: legrövidebb út, összefüggőség, kördetektálás, ütemezés. A ZH-n a kézfogás-tétel, a fák élszáma, a teljes gráf élszáma és az Euler-kör kritériuma a leggyakoribb kérdés; a bizonyításokban a fokszámok összegzése és az indukció a két fő eszköz.',
      theory: [
        MB.def('Egyszerű gráf, fokszám', R`Az egyszerű gráf $G=(V,E)$, ahol $V$ a csúcsok (pontok) halmaza, $E$ pedig kételemű részhalmazok halmaza: az élek. Egyszerű azt jelenti, hogy nincs hurokél és nincs két él ugyanazon csúcspár között. A $v$ csúcs fokszáma $d(v)$: a $v$-ből induló élek száma.`),
        MB.thm('Kézfogás-tétel', R`Minden gráfra
$$\sum_{v\in V}d(v)=2|E|.$$
Következmény: a fokszámok összege páros, ezért a páratlan fokú csúcsok száma mindig páros.`),
        MB.def('Út, kör, összefüggőség', R`Az út csúcsok és élek olyan sorozata, amelyben egymást követő csúcsokat él köt össze, és csúcs nem ismétlődik. A kör olyan út, amely ugyanabba a csúcsba tér vissza. A gráf összefüggő, ha bármely két csúcs között vezet út. Egy csúcs izolált, ha fokszáma nulla.`),
        MB.thm('Fák', R`A fa összefüggő, körmentes gráf. Minden $n$ csúcsú fára
$$|E|=n-1.$$
Megfordítva: ha egy gráf összefüggő és $|E|=n-1$, akkor fa; ha körmentes és $|E|=n-1$, akkor összefüggő. Minden legalább két csúcsú fának van legalább két elsőfokú csúcsa (levele).`),
        MB.def('Teljes gráf, páros gráf', R`A $K_n$ teljes gráfban minden csúcspár össze van kötve, ezért $|E|=\binom n2=\frac{n(n-1)}2$. A gráf páros, ha csúcsai két osztályba ($A$ és $B$) sorolhatók úgy, hogy minden él $A$ és $B$ között fut. A teljes páros gráf $K_{m,n}$ élszáma $m\cdot n$.`),
        MB.thm('Euler-kör és Euler-út', R`Egy összefüggő gráfban pontosan akkor van Euler-kör (minden élen pontosan egyszer végighaladó zárt séta), ha minden csúcs fokszáma páros. Euler-út (nem zárt, minden élen pontosan egyszer) pontosan akkor van, ha legfeljebb két csúcs fokszáma páratlan.`),
        MB.note('Páros gráfok jellemzése', R`Egy gráf pontosan akkor páros, ha nincs benne páratlan hosszúságú kör. Ezért a $C_5$ (ötszög) nem páros, a $C_4$, $C_6$ viszont igen. A jellemzésből az is következik, hogy a páros gráf csúcsai két színnel színezhetők úgy, hogy szomszédos csúcsok különböző színűek.`),
        MB.warn('Euler és Hamilton összekeverése', R`Az Euler-kör éleken megy végig egyszer, a Hamilton-kör csúcsokon. Az Euler-kör feltétele egyszerű és teljes (páros fokszámok); a Hamilton-kör létezésére nincs ilyen egyszerű szükséges és elégséges feltétel. Az összefüggőség mindkettőnél szükséges, izolált csúcs mellett nem létezhet.`)
      ],
      examples: [
        MB.example({
          title: 'Páratlan fokszámösszeg — létezik-e ilyen gráf?',
          problem: R`Létezik-e olyan egyszerű gráf, amelynek $5$ csúcsa van, és minden csúcs fokszáma $3$?`,
          steps: [
            R`A fokszámok összege ebben az esetben $5\cdot3=15$, ami páratlan.`,
            R`A kézfogás-tétel szerint az összegnek $2|E|$-vel kell egyenlőnek lennie, tehát párosnak kell lennie.`,
            R`Ellentmondás: $15$ nem lehet $2|E|$.`,
            R`Tehát ilyen gráf nem létezik. (Ugyanez az „ötször hármas” fokszámsorozat grafikus voltának kérdése.)`
          ],
          answer: R`Nem létezik, mert a fokszámok összege $15$, ami páratlan`
        }),
        MB.example({
          title: 'Fa élszáma',
          problem: R`Hány éle van egy $n$ csúcsú fának, és miért?`,
          steps: [
            R`Indukcióval: $n=1$-re nulla él van, és $n-1=0$.`,
            R`Minden legalább két csúcsú fának van levele. A levelet és a hozzá tartozó élt eltávolítva egy $n-1$ csúcsú fa marad.`,
            R`Az indukciós feltevés szerint ennek $n-2$ éle van.`,
            R`Visszatéve az elhagyott élt: $|E|=(n-2)+1=n-1$.`
          ],
          answer: R`$|E|=n-1$`
        }),
        MB.example({
          title: 'Euler-kör $K_5$ és $K_4$ esetén',
          problem: R`Melyiknek van Euler-köre: $K_5$-nek vagy $K_4$-nek?`,
          steps: [
            R`$K_5$-ben minden csúcs fokszáma $4$ (minden másik csúccsal össze van kötve), ez páros.`,
            R`A $K_5$ összefüggő, ezért minden feltétel teljesül: van Euler-köre.`,
            R`$K_4$-ben minden csúcs fokszáma $3$, ami páratlan.`,
            R`Négy páratlan fokú csúcs van, ezért Euler-kör nincs; Euler-út sem lehet (legfeljebb kettő páratlan fokú lehetne). A $K_4$ élei két Euler-útra bonthatók.`
          ],
          answer: R`$K_5$-nek van Euler-köre, $K_4$-nek nincs (mind a négy foka páratlan)`
        }),
        MB.example({
          title: 'Páros gráf és páratlan kör',
          problem: R`Páros-e a $C_5$ ötszög? És a $C_6$ hatszög?`,
          steps: [
            R`A $C_5$ egy $5$ hosszú kör, ami páratlan.`,
            R`Páros gráfban minden kör hossza páros, mert a kör felváltva halad a két osztály között, és csak páros sok lépés után térhet vissza ugyanabba az osztályba.`,
            R`Ezért a $C_5$ nem páros.`,
            R`A $C_6$ hatszög felosztható a páros és páratlan sorszámú csúcsokra, élei csak a két osztály között futnak, tehát páros.`
          ],
          answer: R`$C_5$ nem páros, mert páratlan kör; $C_6$ páros`
        })
      ],
      mistakes: [
        R`A fokszámok összegét $|E|$-nek vesszük; helyesen $2|E|$.`,
        R`A fákra az $|E|=n$ képletet használjuk $n-1$ helyett.`,
        R`Euler-kört akkor is keresünk, amikor a gráf nem összefüggő — az összefüggőség szükséges feltétel.`,
        R`Azt hisszük, hogy minden körmentes gráf fa; a fa ezen felül összefüggő is kell legyen.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Hány éle van a $K_6$ teljes gráfnak?`, a: '15', type: 'number', hint: R`$\binom62$.`, sol: R`$6\cdot5/2=15$.` }),
        MB.q({ level: 1, q: R`Hány éle van egy $10$ csúcsú fának?`, a: '9', type: 'number', hint: R`$n-1$.`, sol: R`$|E|=10-1=9$.` }),
        MB.q({ level: 1, q: R`Egy gráfnak $8$ éle van. Mennyi a fokszámok összege?`, a: '16', type: 'number', hint: R`Kézfogás-tétel.`, sol: R`$\sum d(v)=2|E|=16$.` }),
        MB.q({ level: 2, q: R`Melyiknek van Euler-köre?`, type: 'choice', choices: ['$K_5$', '$K_4$', 'Egyiknek sem'], a: '0', sol: R`$K_5$-ben minden fokszám $4$ (páros), ezért van Euler-kör; $K_4$-ben minden fokszám $3$ (páratlan), ezért nincs.` }),
        MB.q({ level: 2, q: R`Páros gráf-e a $C_6$ hatszög?`, type: 'choice', choices: ['Igen', 'Nem'], a: '0', sol: R`Igen: a csúcsok páros/páratlan sorszám szerint két osztályba sorolhatók, és minden él a két osztály között fut.` }),
        MB.q({ level: 2, q: R`Hány éle van a $K_{3,4}$ teljes páros gráfnak?`, a: '12', type: 'number', hint: R`$m\cdot n$.`, sol: R`$3\cdot4=12$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy ha egy gráfban pontosan két páratlan fokú csúcs van, akkor bármely Euler-út ebből a két csúcsból indul ki és érkezik meg.`, type: 'proof', hint: R`Az úton minden belső csúcsba ugyanannyiszor lépünk be, mint ahányszor kilépünk.`, sol: R`Egy Euler-út minden élen pontosan egyszer halad át. Minden belső csúcsnál a bemenő és kimenő élek párokba állíthatók, ezért a belső csúcsok fokszáma páros. Az út két végpontjában viszont páratlan a fokszám (a kezdőben eggyel több kilépő, a záróban eggyel több belépő él). Mivel csak két páratlan fokú csúcs van, ezeknek kell lenniük a végpontoknak.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy minden legalább két csúcsú fának van legalább két elsőfokú csúcsa.`, type: 'proof', hint: R`Indulj el egy csúcsból a leghosszabb úton; a végén nem lehet tovább menni.`, sol: R`Vegyük a fa leghosszabb egyszerű útját, $P$-t, amelynek végpontjai $u$ és $v$. Ha $u$-nak lenne $P$-n kívüli szomszédja, az út meghosszabbítható lenne; ha $u$-nak $P$-n belüli második szomszédja lenne, az kör lenne. Tehát $u$ fokszáma $1$. Ugyanez igaz $v$-re, így legalább két levél van.` }),
        MB.q({ level: 2, q: R`Hány éle van egy olyan gráfnak, amely $6$ csúcsú és minden csúcsa $2$ fokú?`, a: '6', type: 'number', hint: R`Előbb fokszámösszeg, majd $|E|$.`, sol: R`$\sum d(v)=12$, ezért $|E|=12/2=6$.` })
      ],
      video: { title: 'Gráfelmélet alapok', channel: 'Magyar matematika csatornák', kind: 'KERESÉS', search: 'gráfelmélet fokszám kézfogás tétel Euler kör fa magyarázat' }
    }
  ]
});
