var R = String.raw;
MB.section({
  id: 'linearis', num: '12', title: 'Lineáris algebra', subtitle: 'Vektorok, mátrixok, lineáris leképezések',
  examTag: 'Lineáris algebra',
  intro: 'A lineáris algebra a mérnöki matematika nyelve: a grafika, a jelfeldolgozás, a numerikus módszerek és a gépi tanulás mind vektorokkal és mátrixokkal számol. A tárgy valójában két kérdésre ad választ: hogyan lehet egy vektort más vektorokból előállítani (bázis, dimenzió), és mit tesz egy lineáris leképezés a térrel (mátrix, sajátérték). A vizsgán nem a számolás sebessége, hanem a fogalmak pontos használata dönt.',
  chapters: [
    {
      id: 'vektorok', num: '12.1', title: 'Vektorok, függetlenség, bázis', minutes: 30,
      lead: 'A vektor nem nyíl és nem számlista, hanem a vektortér eleme. A számolás ugyanaz, de a fogalmak (függetlenség, generálás, dimenzió) csak akkor működnek, ha tisztában vagy vele, mit jelentenek.',
      why: [
        'Az $\\mathbb R^n$ elemeit koordinátákként írjuk fel, mert ez teszi lehetővé a számolást: összeadás és skalárral szorzás tagonként megy. Geometriailag viszont ugyanez a vektor egy irány és hosszúság. A két nézet nem verseng, hanem kiegészíti egymást: a koordinátás számolás adja az eredményt, a geometriai kép adja az ellenőrzést. Ha egy vektort „nem lehet felírni” a többiből, az azt jelenti, hogy a koordinátarendszerben van egy irány, amit a megadott vektorok nem fednek le.',
        'Lineáris kombináció, generált altér, függetlenség, bázis, dimenzió: mind ugyanannak a kérdésnek a részei, hogy egy vektorhalmaz mennyi „szabadságot” ad. A függetlenség azt jelenti, hogy a vektorok között nincs fölösleges; a generálás azt, hogy nincs hiányzó irány. A bázis pontosan az az eset, amikor egyszerre nincs fölösleges és nincs hiányzó — ezért van minden $n$ dimenziós térben pontosan $n$ elemű bázis.',
        'A skaláris és vektoriális szorzat két különböző módon ad geometriai információt. A skaláris szorzat a szöget és a vetületet méri, a vektoriális szorzat a merőlegest és a területet. Mindkettő ugyanabból a koordinátás műveletből származik, ezért a képlet és a jelentés együtt tanulandó.'
      ],
      when: 'Minden későbbi fejezet előtt: a mátrixok oszlopai vektorok, a lineáris egyenletrendszer megoldása altér, a determináns pedig éppen a függetlenséget méri. A skaláris szorzat kell a merőlegességhez, a normához, a vetítéshez és a legkisebb négyzetek módszeréhez; a vektoriális szorzat a felületi normális és a forgatónyomaték kiszámításához.',
      theory: [
        MB.def('Az $\\mathbb R^n$ vektortér', R`Az $\mathbb R^n$ az $n$ valós számból álló rendezett szám-$n$-esek halmaza. Összeadás és skalárral szorzás tagonként:
$$(a_1,\dots,a_n)+(b_1,\dots,b_n)=(a_1+b_1,\dots,a_n+b_n),\qquad \lambda(a_1,\dots,a_n)=(\lambda a_1,\dots,\lambda a_n).$$
A nulla vektor $\mathbf 0=(0,\dots,0)$, a $-\mathbf v$ pedig a $(-1)\mathbf v$ vektor.`),
        MB.def('Lineáris kombináció, generált altér', R`A $\mathbf v_1,\dots,\mathbf v_k$ vektorok lineáris kombinációja $\lambda_1\mathbf v_1+\dots+\lambda_k\mathbf v_k$, ahol $\lambda_i\in\mathbb R$. Az összes ilyen kombináció halmaza a generált altér:
$$\operatorname{span}(\mathbf v_1,\dots,\mathbf v_k)=\{\lambda_1\mathbf v_1+\dots+\lambda_k\mathbf v_k:\lambda_i\in\mathbb R\}.$$`),
        MB.def('Lineáris függetlenség', R`A $\mathbf v_1,\dots,\mathbf v_k$ vektorok lineárisan függetlenek, ha
$$\lambda_1\mathbf v_1+\dots+\lambda_k\mathbf v_k=\mathbf 0 \quad\Longrightarrow\quad \lambda_1=\dots=\lambda_k=0.$$
Ellenkező esetben összefüggők: van olyan nem triviális együtthatósor, amely nullát ad, azaz valamelyik vektor a többi kombinációja.`),
        MB.def('Bázis és dimenzió', R`A $\mathbf b_1,\dots,\mathbf b_n$ vektorok bázisát alkotják a $V$ térnek, ha lineárisan függetlenek és generálják $V$-t. Ekkor minden $\mathbf v\in V$ egyértelműen írható fel $\mathbf v=\lambda_1\mathbf b_1+\dots+\lambda_n\mathbf b_n$ alakban; a $\lambda_i$ számok a $\mathbf v$ koordinátái ebben a bázisban. A bázis elemszáma a dimenzió, jele $\dim V$. Minden bázis ugyanannyi elemből áll.`),
        MB.formula('Skaláris szorzat, norma, szög', R`\mathbf u\cdot\mathbf v=u_1v_1+\dots+u_nv_n,\qquad \|\mathbf u\|=\sqrt{\mathbf u\cdot\mathbf u},\qquad \cos\theta=\frac{\mathbf u\cdot\mathbf v}{\|\mathbf u\|\,\|\mathbf v\|}.`, 'Két vektor merőleges pontosan akkor, ha $\mathbf u\cdot\mathbf v=0$. A skaláris szorzat bilineáris és szimmetrikus.'),
        MB.formula('Vektoriális szorzat', R`\mathbf u\times\mathbf v=(u_2v_3-u_3v_2,\; u_3v_1-u_1v_3,\; u_1v_2-u_2v_1).`, 'Csak $\mathbb R^3$-ban értelmezett. Tulajdonságai: $\mathbf u\times\mathbf v\perp\mathbf u,\mathbf v$; $\|\mathbf u\times\mathbf v\|$ a közbezárt paralelogramma területe; antiszimmetrikus: $\mathbf v\times\mathbf u=-(\mathbf u\times\mathbf v)$.'),
        MB.note('Miért pont $n$ darab bázisvektor?', R`Ha $k<n$ vektor generálja a teret, akkor van olyan irány, amit nem fednek le; ha $k>n$ vektor független lenne, az azt jelentené, hogy az $n$-dimenziós térben $n$-nél több független irány van, ami lehetetlen. Ezért a bázis elemszáma mindig $n$, és minden $n$ darab független vektor automatikusan bázis.`),
        MB.warn('A leggyakoribb félreértések', R`A függetlenség nem azt jelenti, hogy a vektorok „nem párhuzamosak”: három vektor is lehet páronként nem párhuzamos, mégis összefüggő (egy síkban vannak). A $\mathbf 0$ vektor egyedül mindig összefüggő rendszert alkot, mert $1\cdot\mathbf 0=\mathbf 0$. A generálás és a függetlenség külön-külön nem bázis: $n$ darab generáló vektor lehet összefüggő, $n$ darab független viszont mindig bázis.`)
      ],
      examples: [
        MB.example({
          title: 'Skaláris szorzat és szög',
          problem: R`Számítsuk ki a $\mathbf u=(1,2,3)$ és $\mathbf v=(4,5,6)$ vektorok skaláris szorzatát, majd a közbezárt szög koszinuszát.`,
          steps: [
            R`Skaláris szorzat: $\mathbf u\cdot\mathbf v=1\cdot4+2\cdot5+3\cdot6=4+10+18=32$.`,
            R`Normák: $\|\mathbf u\|=\sqrt{1+4+9}=\sqrt{14}$, $\|\mathbf v\|=\sqrt{16+25+36}=\sqrt{77}$.`,
            R`A szög: $\cos\theta=\dfrac{32}{\sqrt{14}\sqrt{77}}=\dfrac{32}{\sqrt{1078}}\approx0{,}975$.`,
            R`Mivel $32>0$, a szög hegyesszög; $\theta\approx12{,}9^\circ$.`
          ],
          answer: R`$\mathbf u\cdot\mathbf v=32$, $\cos\theta=\dfrac{32}{\sqrt{1078}}\approx0{,}975$`
        }),
        MB.example({
          title: 'Vektoriális szorzat',
          problem: R`Számítsuk ki az $\mathbf u=(1,2,3)$ és $\mathbf v=(4,5,6)$ vektorok vektoriális szorzatát.`,
          steps: [
            R`Első koordináta: $u_2v_3-u_3v_2=2\cdot6-3\cdot5=12-15=-3$.`,
            R`Második: $u_3v_1-u_1v_3=3\cdot4-1\cdot6=12-6=6$.`,
            R`Harmadik: $u_1v_2-u_2v_1=1\cdot5-2\cdot4=5-8=-3$.`,
            R`Ellenőrzés merőlegességre: $(-3,6,-3)\cdot(1,2,3)=-3+12-9=0$, és $(-3,6,-3)\cdot(4,5,6)=-12+30-18=0$.`
          ],
          answer: R`$\mathbf u\times\mathbf v=(-3,6,-3)$`
        }),
        MB.example({
          title: 'Függetlenség vizsgálata',
          problem: R`Lineárisan független-e az $(1,2)$ és a $(3,6)$ vektor?`,
          steps: [
            R`Írjuk fel a $\lambda(1,2)+\mu(3,6)=(0,0)$ egyenletet koordinátánként.`,
            R`$\lambda+3\mu=0$ és $2\lambda+6\mu=0$.`,
            R`A második egyenlet az első kétszerese, tehát csak egy független feltétel van: $\lambda=-3\mu$.`,
            R`Például $\mu=1$, $\lambda=-3$ nem triviális megoldás, mert $-3(1,2)+(3,6)=(0,0)$. A vektorok összefüggők: $(3,6)=3\cdot(1,2)$ (párhuzamosak).`
          ],
          answer: R`Összefüggők, mert $(3,6)=3\cdot(1,2)$`
        }),
        MB.example({
          title: 'Bázis-e a három vektor?',
          problem: R`Bázist alkot-e az $\mathbb R^3$-ban az $(1,0,0)$, $(1,1,0)$, $(1,1,1)$ vektorhármas?`,
          steps: [
            R`Három vektor van háromdimenziós térben, ezért elég a függetlenséget ellenőrizni.`,
            R`A $\lambda_1(1,0,0)+\lambda_2(1,1,0)+\lambda_3(1,1,1)=(0,0,0)$ egyenletből koordinátánként: harmadik: $\lambda_3=0$; második: $\lambda_2+\lambda_3=0$, tehát $\lambda_2=0$; első: $\lambda_1+\lambda_2+\lambda_3=0$, tehát $\lambda_1=0$.`,
            R`Csak a triviális megoldás van, tehát függetlenek.`,
            R`Így bázis; a mátrixuk determinánsa is $1\neq0$, ami ugyanezt mutatja.`
          ],
          answer: R`Igen, bázis (a determináns $1$, a vektorok függetlenek)`
        })
      ],
      mistakes: [
        R`A függetlenséget páronkénti „nem párhuzamossággal” ellenőrizzük; valójában a $\lambda_1\mathbf v_1+\dots+\lambda_k\mathbf v_k=\mathbf 0$ egyenletet kell megoldani.`,
        R`Azt hisszük, hogy bármely $n$ vektor bázis $\mathbb R^n$-ben; ehhez a függetlenség is kell.`,
        R`A $\mathbf 0$ vektort beleértjük egy függetlennek hitt rendszerbe — azonnal összefüggő lesz.`,
        R`A vektoriális szorzatot $\mathbb R^2$-ben vagy $\mathbb R^4$-ben is használjuk; csak $\mathbb R^3$-ban értelmezett.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Mennyi $(1,2,3)\cdot(4,5,6)$?`, a: '32', type: 'number', hint: R`Koordinátánként szorozz és adj össze.`, sol: R`$4+10+18=32$.` }),
        MB.q({ level: 1, q: R`Mennyi a $(3,4)$ vektor hossza?`, a: '5', type: 'number', hint: R`$\|\mathbf u\|=\sqrt{u_1^2+u_2^2}$.`, sol: R`$\sqrt{9+16}=\sqrt{25}=5$.` }),
        MB.q({ level: 2, q: R`Add meg az $(1,2,3)$ és $(4,5,6)$ vektorok vektoriális szorzatát.`, a: '(-3,6,-3)', alt: ['-3,6,-3', '(-3, 6, -3)', '(-3;6;-3)'], type: 'text', hint: R`A képlet: $(u_2v_3-u_3v_2,\ u_3v_1-u_1v_3,\ u_1v_2-u_2v_1)$.`, sol: R`$(12-15,\ 12-6,\ 5-8)=(-3,6,-3)$.` }),
        MB.q({ level: 2, q: R`Lineárisan független-e az $(1,2)$ és a $(3,6)$ vektor?`, type: 'choice', choices: ['Igen, függetlenek', 'Nem, összefüggők'], a: '1', sol: R`Nem: $(3,6)=3\cdot(1,2)$, ezért $-3(1,2)+1(3,6)=(0,0)$ nem triviális előállítás.` }),
        MB.q({ level: 2, q: R`Mely $c$ értékre lesznek az $(1,2,3)$, $(0,1,1)$, $(1,c,1)$ vektorok lineárisan összefüggők?`, a: '0', type: 'number', hint: R`A determináns $1\cdot(1-c)-2(0-1)+3(0-1)=-c$.`, sol: R`$\det=-c$, ezért $c=0$ esetén a determináns nulla, azaz a vektorok összefüggők.` }),
        MB.q({ level: 3, q: R`Mekkora szöget zár be az $(1,0)$ és az $(1,1)$ vektor? Add meg radiánban.`, a: 'pi/4', alt: ['π/4', '45 fok', '0.785398'], type: 'expr', hint: R`$\cos\theta=\frac{1}{1\cdot\sqrt2}$.`, sol: R`$\cos\theta=1/\sqrt2$, tehát $\theta=\pi/4$.` }),
        MB.q({ level: 2, q: R`Hány dimenziós a $\operatorname{span}((1,0,0),(0,1,0),(2,0,0))$ altér?`, a: '2', type: 'number', hint: R`A harmadik vektor az első kétszerese.`, sol: R`Két független vektor generálja, a harmadik fölösleges, ezért a dimenzió $2$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be: ha $\mathbf u\perp\mathbf v$, akkor $\|\mathbf u+\mathbf v\|^2=\|\mathbf u\|^2+\|\mathbf v\|^2$.`, type: 'proof', hint: R`Írd fel a normanégyzetet skaláris szorzattal.`, sol: R`$\|\mathbf u+\mathbf v\|^2=(\mathbf u+\mathbf v)\cdot(\mathbf u+\mathbf v)=\|\mathbf u\|^2+2(\mathbf u\cdot\mathbf v)+\|\mathbf v\|^2$, és $\mathbf u\perp\mathbf v$ miatt $\mathbf u\cdot\mathbf v=0$.` })
      ],
      video: { list: 'PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab', title: 'Essence of linear algebra', channel: '3Blue1Brown', kind: 'LEJÁTSZÁSI LISTA' }
    },
    {
      id: 'matrixok', num: '12.2', title: 'Mátrixok, determináns, inverz, Gauss', minutes: 35,
      lead: 'A mátrix nem számtáblázat, hanem lineáris leképezés: oszlopai megmondják, hova kerülnek a bázisvektorok. Ebből az egyetlen nézetből a szorzás, a determináns és az inverz is értelmezhető.',
      why: [
        'Az $A\mathbf x$ szorzatot úgy kell olvasni, hogy az $A$ oszlopait a koordinátákkal kombináljuk: $A\mathbf x=x_1\mathbf a_1+\dots+x_k\mathbf a_k$. Ezért a mátrixszorzás nem önkényes „sor-szor-oszlop” szabály, hanem két leképezés egymás után való alkalmazása. Ez magyarázza, miért nem kommutatív: két leképezés sorrendje számít. Ezért is teljesül, hogy $A(\mathbf x+\mathbf y)=A\mathbf x+A\mathbf y$ — ez a linearitás definíciója.',
        'A determináns a leképezés térfogat-torzítási tényezője: $|\det A|$ a parallelepipedon térfogatszorzója, az előjel a tájolást jelzi. Ha $\det A=0$, akkor a leképezés „összenyom” egy dimenziót, azaz a képe nem teljes dimenziós, és nem invertálható. Ezért van, hogy $\det A\neq0$ pontosan akkor, ha $A$ invertálható, és hogy a homogén rendszernek pontosan ekkor van csak triviális megoldása. A determináns nem mágikus képlet, hanem a függetlenség mérőszáma.',
        'A Gauss-elimináció három elemi sorelyettesítésből áll, és ezek mindegyike megőrzi az egyenletrendszer megoldáshalmazát, illetve a determinánst (egy harmadik, sorcserével előjelet váltva). Ezért lehet a rendszert lépcsőssé alakítani, és onnan visszahelyettesítéssel megoldani. A lépcsős alak sorainak száma a rang: ennyi független feltétel van, a többi sor fölösleges. Ebből a képből a három eset (egy megoldás, végtelen sok, nincs megoldás) azonnal látszik.'
      ],
      when: 'Lineáris egyenletrendszerek megoldásánál mindig Gauss-eliminációt használunk, mert gyorsabb és stabilabb, mint a Cramer-szabály. Determinánsra főleg akkor van szükség, ha az invertálhatóságot, a sajátértékeket vagy a vektoriális szorzatot/területet számoljuk. Mátrixszorzás kell a leképezések kompozíciójához, a gráfelmélet szomszédsági mátrixához, a numerikus módszerek iterációihoz.',
      theory: [
        MB.def('Mátrix és szorzás', R`Az $m\times n$-es mátrix $m$ sorból és $n$ oszlopból áll. Az $AB$ szorzat csak akkor értelmezett, ha $A$ oszlopszáma megegyezik $B$ sorszámával; ekkor $(AB)_{ij}=\sum_k a_{ik}b_{kj}$. Nem kommutatív: $AB\neq BA$ általában.`),
        MB.formula('Mátrix mint leképezés', R`A\mathbf x=x_1\mathbf a_1+\dots+x_n\mathbf a_n \quad\text{és}\quad (AB)\mathbf x=A(B\mathbf x).`, 'A mátrix oszlopai a bázisvektorok képei. A szorzás a leképezések kompozíciója, balról jobbra haladva.'),
        MB.formula('Transzponált', R`(A^T)_{ij}=A_{ji},\qquad (AB)^T=B^TA^T,\qquad (A^T)^{-1}=(A^{-1})^T.`, 'A transzponálás megfordítja a szorzat tényezőinek sorrendjét.'),
        MB.formula('Determináns', R`\det\begin{pmatrix}a&b\\c&d\end{pmatrix}=ad-bc,\qquad \det(AB)=\det A\det B,\qquad \det(A^{-1})=\frac1{\det A}.`, 'A $2\times2$-es esetben a képlet közvetlen. $3\times3$-ra a kifejtési tétel: egy sor (vagy oszlop) elemeit a hozzá tartozó előjeles aldeterminánsokkal szorozzuk.'),
        MB.note('Sarrus-szabály', R`Háromszor három esetén a három „főátlós” szorzat összegéből kivonjuk a három „mellékátlós” szorzat összegét:
$$\det\begin{pmatrix}a&b&c\\d&e&f\\g&h&i\end{pmatrix}=aei+bfg+cdh-ceg-bdi-afh.$$
Négy vagy több dimenzióban ez a minta nem működik, ott kifejtés vagy sorátalakítás kell.`),
        MB.formula('Inverz $2\times2$', R`\begin{pmatrix}a&b\\c&d\end{pmatrix}^{-1}=\frac{1}{ad-bc}\begin{pmatrix}d&-b\\-c&a\end{pmatrix},`, 'Csak akkor létezik, ha $ad-bc\neq0$. Ellenőrzés: $AA^{-1}=I$.'),
        MB.note('Gauss-elimináció és megoldás-esetek', R`A kibővített mátrixon végzett elemi sorátalakítások: sorcsere; egy sor szorzása nullától különböző konstanssal; egy sorhoz egy másik számszorosának hozzáadása. A lépcsős alakból:
$$\text{rang}=\text{vezető elemek száma}.$$
Ha a rang kisebb, mint az ismeretlenek száma ÉS a rendszer konzisztens, végtelen sok megoldás van; ha a kibővített mátrix rangja nagyobb, nincs megoldás.`),
        MB.warn('Hol hibázik a legtöbb hallgató', R`A Cramer-szabály csak akkor használható, ha a determináns nem nulla — különben nullával osztunk. A determináns kiszámításakor a kifejtésnél az előjel-váltakozás ($+,-,+$) kimarad. Sorátalakításnál a determináns megváltozhat, ezért ha determinánst számolunk, jegyezzük fel a változásokat; a megoldáshalmaz szempontjából viszont a sorátalakítások biztonságosak.`)
      ],
      examples: [
        MB.example({
          title: 'Mátrixszorzás',
          problem: R`Számítsuk ki $AB$-t, ahol $A=\begin{pmatrix}1&2\\3&4\end{pmatrix}$, $B=\begin{pmatrix}0&1\\1&0\end{pmatrix}$.`,
          steps: [
            R`Első sor, első oszlop: $1\cdot0+2\cdot1=2$.`,
            R`Első sor, második oszlop: $1\cdot1+2\cdot0=1$.`,
            R`Második sor, első oszlop: $3\cdot0+4\cdot1=4$.`,
            R`Második sor, második oszlop: $3\cdot1+4\cdot0=3$.`,
            R`Tehát $AB=\begin{pmatrix}2&1\\4&3\end{pmatrix}$. Ellenőrzés: $B$ az oszlopokat felcseréli, és valóban $AB$ éppen $A$ oszlopainak felcserélése.`
          ],
          answer: R`$AB=\begin{pmatrix}2&1\\4&3\end{pmatrix}$`
        }),
        MB.example({
          title: 'Háromszor hármas determináns',
          problem: R`Számítsuk ki $\det\begin{pmatrix}1&2&3\\4&5&6\\7&8&10\end{pmatrix}$ értékét.`,
          steps: [
            R`Első sor szerinti kifejtés, előjelek $+,-,+$:`,
            R`$1\cdot\det\begin{pmatrix}5&6\\8&10\end{pmatrix}-2\cdot\det\begin{pmatrix}4&6\\7&10\end{pmatrix}+3\cdot\det\begin{pmatrix}4&5\\7&8\end{pmatrix}$.`,
            R`A három aldetermináns: $50-48=2$; $40-42=-2$; $32-35=-3$.`,
            R`Behelyettesítve: $1\cdot2-2\cdot(-2)+3\cdot(-3)=2+4-9=-3$.`
          ],
          answer: R`$-3$`
        }),
        MB.example({
          title: 'Inverz kiszámítása',
          problem: R`Határozzuk meg az $A=\begin{pmatrix}2&5\\1&3\end{pmatrix}$ mátrix inverzét.`,
          steps: [
            R`Determináns: $\det A=2\cdot3-5\cdot1=6-5=1$.`,
            R`Az inverz képlete: $\frac{1}{\det A}\begin{pmatrix}d&-b\\-c&a\end{pmatrix}$.`,
            R`Behelyettesítve: $A^{-1}=\frac11\begin{pmatrix}3&-5\\-1&2\end{pmatrix}=\begin{pmatrix}3&-5\\-1&2\end{pmatrix}$.`,
            R`Ellenőrzés: $A A^{-1}=\begin{pmatrix}2\cdot3+5\cdot(-1)&2\cdot(-5)+5\cdot2\\1\cdot3+3\cdot(-1)&1\cdot(-5)+3\cdot2\end{pmatrix}=\begin{pmatrix}1&0\\0&1\end{pmatrix}$.`
          ],
          answer: R`$A^{-1}=\begin{pmatrix}3&-5\\-1&2\end{pmatrix}$`
        }),
        MB.example({
          title: 'Háromismeretlenes rendszer',
          problem: R`Oldjuk meg: $x+y+z=6$, $2x+y-z=1$, $x+2y+3z=14$.`,
          steps: [
            R`A második sorból kivonjuk az első kétszeresét: $-y-3z=-11$.`,
            R`A harmadik sorból kivonjuk az elsőt: $y+2z=8$.`,
            R`A két új egyenletet összeadva $-z=-3$, tehát $z=3$.`,
            R`Visszahelyettesítés: $y=8-2\cdot3=2$.`,
            R`Az első egyenletből $x=6-2-3=1$. Ellenőrzés a másodikkal: $2+2-3=1$.`
          ],
          answer: R`$(x,y,z)=(1,2,3)$`
        })
      ],
      mistakes: [
        R`Mátrixszorzásnál a sorrend felcserélése: $AB\neq BA$; a transzponálásnál pedig $(AB)^T=B^TA^T$, nem $A^TB^T$.`,
        R`Determináns kifejtésénél az előjelváltás ($+,-,+$) elhagyása.`,
        R`Az inverz képletében az előjelek rossz elhelyezése: a $\begin{pmatrix}d&-b\\-c&a\end{pmatrix}$ mátrixban a két átló nem cserélődik.`,
        R`Ha $\det A=0$, még mindig inverzt próbálunk számolni; helyesen: ekkor nincs inverz, a mátrix szinguláris.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Számítsd ki: $\begin{pmatrix}1&2\\3&4\end{pmatrix}\begin{pmatrix}2&0\\0&3\end{pmatrix}$. Add meg a $(2,1)$ elemet!`, a: '6', type: 'number', hint: R`Második sor, első oszlop: $3\cdot2+4\cdot0$.`, sol: R`$3\cdot2+4\cdot0=6$. A teljes szorzat $\begin{pmatrix}2&6\\6&12\end{pmatrix}$.` }),
        MB.q({ level: 1, q: R`Mennyi $\det\begin{pmatrix}1&2\\3&4\end{pmatrix}$?`, a: '-2', type: 'number', hint: R`$ad-bc$.`, sol: R`$1\cdot4-2\cdot3=4-6=-2$.` }),
        MB.q({ level: 2, q: R`Mennyi $\det\begin{pmatrix}1&2&3\\4&5&6\\7&8&10\end{pmatrix}$?`, a: '-3', type: 'number', hint: R`Kifejtés az első sor szerint: $+,-,+$.`, sol: R`$1(50-48)-2(40-42)+3(32-35)=2+4-9=-3$.` }),
        MB.q({ level: 2, q: R`Az $A=\begin{pmatrix}2&5\\1&3\end{pmatrix}$ mátrix inverzének mi a bal felső eleme?`, a: '3', type: 'number', hint: R`$\det A=1$, és az inverz $\begin{pmatrix}d&-b\\-c&a\end{pmatrix}$.`, sol: R`$A^{-1}=\begin{pmatrix}3&-5\\-1&2\end{pmatrix}$, tehát a bal felső elem $3$.` }),
        MB.q({ level: 2, q: R`Oldd meg: $x+y+z=6$, $2x+y-z=1$, $x+2y+3z=14$. Mennyi $z$?`, a: '3', type: 'number', hint: R`Vonjuk ki az első sor kétszeresét a másodikból.`, sol: R`A megoldás $(1,2,3)$, tehát $z=3$.` }),
        MB.q({ level: 2, q: R`Mennyi a $\begin{pmatrix}1&2&3\\2&4&6\\1&1&1\end{pmatrix}$ mátrix rangja?`, a: '2', type: 'number', hint: R`A második sor az első kétszerese.`, sol: R`Egy sor fölösleges, a maradó két sor független, ezért a rang $2$.` }),
        MB.q({ level: 2, q: R`Mely $k$ értékre szinguláris a $\begin{pmatrix}1&2\\2&k\end{pmatrix}$ mátrix?`, a: '4', type: 'number', hint: R`$\det A=k-4$.`, sol: R`$k-4=0$, tehát $k=4$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy ha $A$ és $B$ invertálható, akkor $AB$ is invertálható, és $(AB)^{-1}=B^{-1}A^{-1}$.`, type: 'proof', hint: R`Szorozd össze $AB$-t a $B^{-1}A^{-1}$ mátrixszal mindkét oldalról.`, sol: R`$(AB)(B^{-1}A^{-1})=A(BB^{-1})A^{-1}=AA^{-1}=I$, és ugyanígy $(B^{-1}A^{-1})(AB)=I$. A kétoldali inverz egyértelmű, ezért $(AB)^{-1}=B^{-1}A^{-1}$.` })
      ],
      video: { list: 'PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab', title: 'Essence of linear algebra', channel: '3Blue1Brown', kind: 'LEJÁTSZÁSI LISTA' }
    },
    {
      id: 'sajatertek', num: '12.3', title: 'Sajátérték, sajátvektor, diagonalizálás', minutes: 32,
      lead: 'A sajátvektor az az irány, amelyet a leképezés nem forgat el, csak nyújt. A sajátérték a nyújtás mértéke. Ha elég ilyen irány van, a mátrix báziscserével átlóssá tehető.',
      why: [
        'Egy $A$ mátrix hatása általában minden vektort elforgat és nyújt. Vannak azonban kitüntetett irányok, amelyeknél csak a hossz változik: ezek a sajátvektorok. A $A\mathbf v=\lambda\mathbf v$ egyenlet ezt fejezi ki. Ha ilyen irányban nézzük a rendszert, a leképezés egyetlen számmal való szorzás lesz, ami sokkal egyszerűbb: ezért hasznos a sajátfelbontás a differenciálegyenleteknél, a rezgésanalízisnél és a numerikus módszereknél (például a PageRank vagy a PCA esetében).',
        'A karakterisztikus polinom a $\det(A-\lambda I)=0$ feltételből jön: pontosan akkor van nem triviális megoldás, ha a mátrix szinguláris. Ezért a sajátértékek a determináns gyökei. Két gyors ellenőrzés mindig rendelkezésre áll: a sajátértékek összege a nyom, szorzata a determináns. Ezek nem trükkök, hanem a karakterisztikus polinom együtthatóinak jelentése (Viète).',
        'A diagonalizálás annyit tesz, hogy a bázist a sajátvektorokra cseréljük. Ebben a bázisban a leképezés mátrixa átlós, ezért $A^k=P D^k P^{-1}$ egyszerűen számolható. Ez a lehetőség azonban nem mindig adott: kell $n$ darab független sajátvektor. Ha kevesebb van (például egy Jordan-blokk esetén), a mátrix nem diagonalizálható, de a sajátértékek akkor is léteznek.'
      ],
      when: 'Sajátérték-számítás kell lineáris rekurziók és differenciálegyenlet-rendszerek megoldásához, stabilitásvizsgálathoz (amikor a megoldás viselkedését a $|\lambda|$ dönti el), a gráfok spektrális vizsgálatához és a gépi tanulás dimenziócsökkentéséhez. A ZH-n jellemzően 2×2-es vagy 3×3-as mátrix sajátértékeit és sajátvektorait, illetve a diagonalizálhatóság kérdését kérik.',
      theory: [
        MB.def('Sajátérték és sajátvektor', R`Legyen $A$ $n\times n$-es valós mátrix. A $\lambda$ szám az $A$ sajátértéke, ha van olyan $\mathbf v\neq\mathbf 0$ vektor, amelyre
$$A\mathbf v=\lambda\mathbf v.$$
Az ilyen $\mathbf v$-ket a $\lambda$-hoz tartozó sajátvektoroknak nevezzük. A $\lambda$-hoz tartozó sajátaltér $E_\lambda=\ker(A-\lambda I)$, amely mindig tartalmazza a nulla vektort, de a sajátvektor definíció szerint nem az.`),
        MB.formula('Karakterisztikus polinom', R`\det(A-\lambda I)=0.`, 'A bal oldal $\lambda$-ban $n$-edfokú polinom. Gyökei a sajátértékek, multiplicitással együtt.'),
        MB.note('Sajátaltér kiszámítása', R`A $\lambda$ behelyettesítése után oldjuk meg a $(A-\lambda I)\mathbf v=\mathbf 0$ homogén rendszert. Mivel $\det(A-\lambda I)=0$, van nem triviális megoldás: a megoldásvektorok alteret alkotnak, ennek egy bázisa adja a sajátvektorokat.`),
        MB.formula('Diagonalizálás', R`A=PDP^{-1},\qquad D=\operatorname{diag}(\lambda_1,\dots,\lambda_n),`, 'A $P$ oszlopai a sajátvektorok. Ez pontosan akkor lehetséges, ha van $n$ darab lineárisan független sajátvektor (például ha minden sajátérték különböző, vagy ha minden sajátaltér dimenziója megegyezik a multiplicitással).'),
        MB.formula('Nyom és determináns ellenőrzés', R`\sum_{i=1}^n \lambda_i=\operatorname{tr}A,\qquad \prod_{i=1}^n \lambda_i=\det A.`, 'Ha a kapott sajátértékek összege vagy szorzata nem egyezik, hibát vétettünk a karakterisztikus polinomban vagy a gyökökben.'),
        MB.warn('Nem minden mátrix diagonalizálható', R`A $\begin{pmatrix}1&1\\0&1\end{pmatrix}$ mátrixnak csak egy sajátértéke van ($\lambda=1$), és a sajátaltere egydimenziós: nincs két független sajátvektor, ezért nem diagonalizálható. Az ilyen mátrixhoz Jordan-alak tartozik. A sajátértékek létezése tehát nem garantálja a diagonalizálhatóságot.`),
        MB.note('Valós mátrix, komplex sajátérték', R`A $\begin{pmatrix}0&-1\\1&0\end{pmatrix}$ mátrix karakterisztikus polinomja $\lambda^2+1$, ezért sajátértékei $\pm i$. Valós mátrixnak is lehetnek komplex sajátértékei; ezek konjugált párokban jönnek, és valós értelemben a mátrix nem diagonalizálható (forgatást ír le).`)
      ],
      examples: [
        MB.example({
          title: 'Sajátértékek szimmetrikus mátrixra',
          problem: R`Határozzuk meg az $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$ mátrix sajátértékeit és sajátvektorait.`,
          steps: [
            R`Karakterisztikus polinom: $\det(A-\lambda I)=\det\begin{pmatrix}2-\lambda&1\\1&2-\lambda\end{pmatrix}=(2-\lambda)^2-1$.`,
            R`Nullahelyek: $(2-\lambda)^2=1$, azaz $2-\lambda=\pm1$, tehát $\lambda_1=1$, $\lambda_2=3$.`,
            R`Ellenőrzés: $\lambda_1+\lambda_2=4=\operatorname{tr}A$, $\lambda_1\lambda_2=3=\det A$.`,
            R`$\lambda=1$: $(A-I)\mathbf v=0$ ad $\begin{pmatrix}1&1\\1&1\end{pmatrix}\begin{pmatrix}v_1\\v_2\end{pmatrix}=0$, azaz $v_1+v_2=0$: $\mathbf v=(1,-1)$.`,
            R`$\lambda=3$: $\begin{pmatrix}-1&1\\1&-1\end{pmatrix}\mathbf v=0$ ad $v_1=v_2$: $\mathbf v=(1,1)$.`
          ],
          answer: R`$\lambda_1=1$: $\mathbf v=(1,-1)$; $\lambda_2=3$: $\mathbf v=(1,1)$`
        }),
        MB.example({
          title: 'Sajátértékek kiszámítása',
          problem: R`Határozzuk meg az $A=\begin{pmatrix}4&1\\2&3\end{pmatrix}$ mátrix sajátértékeit és sajátvektorait.`,
          steps: [
            R`$\det(A-\lambda I)=(4-\lambda)(3-\lambda)-2=\lambda^2-7\lambda+10$.`,
            R`$\lambda^2-7\lambda+10=(\lambda-5)(\lambda-2)$, tehát $\lambda_1=5$, $\lambda_2=2$.`,
            R`Ellenőrzés: $5+2=7=\operatorname{tr}A$; $5\cdot2=10=\det A=12-2$.`,
            R`$\lambda=5$: $\begin{pmatrix}-1&1\\2&-2\end{pmatrix}\mathbf v=0$ ad $-v_1+v_2=0$, tehát $\mathbf v=(1,1)$.`,
            R`$\lambda=2$: $\begin{pmatrix}2&1\\2&1\end{pmatrix}\mathbf v=0$ ad $2v_1+v_2=0$, tehát $\mathbf v=(1,-2)$.`
          ],
          answer: R`$\lambda=5$: $(1,1)$; $\lambda=2$: $(1,-2)$`
        }),
        MB.example({
          title: 'Diagonalizálás',
          problem: R`Diagonalizáljuk az $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$ mátrixot.`,
          steps: [
            R`A sajátértékek $1$ és $3$, a sajátvektorok $(1,-1)$ és $(1,1)$ — ezek függetlenek, mert nem egymás skalárszorosai.`,
            R`A $P$ mátrix oszlopai a sajátvektorok: $P=\begin{pmatrix}1&1\\-1&1\end{pmatrix}$.`,
            R`$\det P=2$, ezért $P^{-1}=\frac12\begin{pmatrix}1&-1\\1&1\end{pmatrix}$.`,
            R`Ekkor $P^{-1}AP=\begin{pmatrix}1&0\\0&3\end{pmatrix}=D$, amit a $AP=PD$ egyenlőséggel lehet ellenőrizni.`
          ],
          answer: R`$A=PDP^{-1}$ a $P=\begin{pmatrix}1&1\\-1&1\end{pmatrix}$, $D=\begin{pmatrix}1&0\\0&3\end{pmatrix}$ választással`
        })
      ],
      mistakes: [
        R`A karakterisztikus polinomot $\det(\lambda I-A)$ helyett hibás előjellel írjuk fel; a gyökök ugyanazok, de a képletben a $(-1)^n$ tényező elhagyása zavart okoz.`,
        R`A sajátvektornál a nullvektort adjuk meg megoldásként — a sajátvektor definíció szerint nem nulla.`,
        R`Azt hisszük, hogy minden mátrix diagonalizálható; ehhez $n$ független sajátvektor kell.`,
        R`A nyom/determináns ellenőrzést kihagyjuk, pedig egyetlen számolással kiszűri a hibás sajátértékeket.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Mennyi a $\begin{pmatrix}2&1\\1&2\end{pmatrix}$ mátrix sajátértékeinek összege?`, a: '4', type: 'number', hint: R`Az összeg a nyom.`, sol: R`$\operatorname{tr}A=2+2=4$; a sajátértékek $1$ és $3$.` }),
        MB.q({ level: 2, q: R`Mennyi a $\begin{pmatrix}4&1\\2&3\end{pmatrix}$ mátrix nagyobbik sajátértéke?`, a: '5', type: 'number', hint: R`$\lambda^2-7\lambda+10=0$.`, sol: R`$(\lambda-5)(\lambda-2)=0$, a nagyobbik $5$.` }),
        MB.q({ level: 2, q: R`Add meg a $\begin{pmatrix}4&1\\2&3\end{pmatrix}$ mátrix $\lambda=5$-höz tartozó sajátvektorát.`, a: '(1,1)', alt: ['1,1', '(1;1)', 't(1,1)'], type: 'text', hint: R`Oldd meg a $(A-5I)\mathbf v=0$ rendszert.`, sol: R`$\begin{pmatrix}-1&1\\2&-2\end{pmatrix}\mathbf v=0\Rightarrow v_1=v_2$, tehát $(1,1)$ (bármely nem nulla skalárszoros).` }),
        MB.q({ level: 1, q: R`Mennyi a $\begin{pmatrix}1&1\\0&2\end{pmatrix}$ mátrix sajátértékeinek szorzata?`, a: '2', type: 'number', hint: R`Háromszögmátrixnál a sajátértékek az átlóelemei.`, sol: R`$\lambda=1,2$, a szorzat $2$ (egyezik a determinánssal).` }),
        MB.q({ level: 2, q: R`Diagonalizálható-e a $\begin{pmatrix}1&1\\0&1\end{pmatrix}$ mátrix?`, type: 'choice', choices: ['Igen', 'Nem'], a: '1', sol: R`Nem: egyetlen sajátérték van ($\lambda=1$), és a sajátaltér egydimenziós, tehát nincs két független sajátvektor.` }),
        MB.q({ level: 2, q: R`Mennyi a $\begin{pmatrix}1&0&0\\2&3&0\\4&5&6\end{pmatrix}$ mátrix determinánsa?`, a: '18', type: 'number', hint: R`Háromszögmátrix determinánsa az átló szorzata.`, sol: R`$\det=1\cdot3\cdot6=18$, a sajátértékek $1,3,6$, szorzatuk $18$.` }),
        MB.q({ level: 3, q: R`Bizonyítsd be, hogy háromszögmátrix sajátértékei pontosan az átlóelemei.`, type: 'proof', hint: R`Írd fel a $\det(A-\lambda I)$ determinánst háromszög alakban.`, sol: R`Ha $A$ felső háromszögmátrix, akkor $A-\lambda I$ is az, átlóelemei $a_{ii}-\lambda$. Háromszögmátrix determinánsa az átló szorzata, ezért $\det(A-\lambda I)=\prod_i(a_{ii}-\lambda)$, aminek gyökei $\lambda=a_{ii}$.` }),
        MB.q({ level: 3, q: R`A $\begin{pmatrix}2&0\\0&3\end{pmatrix}$ mátrixra mennyi $A^{10}$ nyoma?`, a: '60073', type: 'number', hint: R`Átlós mátrix hatványozása elemenként történik.`, sol: R`$A^{10}=\operatorname{diag}(2^{10},3^{10})$, ezért a nyom $2^{10}+3^{10}=1024+59049=60073$.` })
      ],
      video: { title: 'Sajátérték, sajátvektor, diagonalizálás', channel: 'Magyar matematika csatornák', kind: 'KERESÉS', search: 'sajátérték sajátvektor diagonalizálás lineáris algebra magyarázat' }
    }
  ]
});
