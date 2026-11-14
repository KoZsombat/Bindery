var R = String.raw;
MB.section({
  id: 'sorok', num: '08', title: 'Numerikus sorok', subtitle: 'Végtelen összegek',
  examTag: 'Analízis 2',
  intro: 'A végtelen sok szám összeadása elsőre értelmetlennek tűnik: nincs végeredmény, amit leírhatnánk. A sorok elmélete mégis működik, mert nem egyszerre adunk össze végtelen sok tagot, hanem a részletösszegek sorozatának határértékét vesszük. Ebből a definícióból azonnal következik, hogy a konvergencia nem automatikus: a tagok nullához tartása szükséges, de nem elégséges feltétel. A fejezet célja, hogy minden feladatnál tudjad: melyik kritériumot kell használni, és mit bizonyít az, amit kaptál.',
  chapters: [
    {
      id: 'sorok-alap', num: '8.1', title: 'Sorok, részletösszeg, geometriai sor', minutes: 30,
      lead: 'Egy sor nem összeg, hanem sorozat: a részletösszegek sorozata. A sor akkor konvergens, ha ez a sorozat konvergens — és az összeg ennek a határértéke.',
      why: [
        R`Végtelen sok tagot nem tudunk „egyszerre” összeadni, ezért fokozatosan adunk hozzá: $s_1=a_1$, $s_2=a_1+a_2$, $s_3=a_1+a_2+a_3$, és így tovább. A $\sum a_n$ sor konvergens, ha az $(s_n)$ részletösszeg-sorozat konvergens, és ekkor a sor összege $\lim s_n$. Ez a definíció magyarázza, miért lehet egy sor összege véges, miközben végtelen sok pozitív tagot adunk össze: a hozzáadott tagok egyre kisebbek, és a részletösszegek egy határértékhez tartanak.`,
        R`A geometriai sor a minta, amelyre minden más összehasonlítás épül. Ha $|q|<1$, akkor a $q^n$ tagok gyorsan nullához tartanak, és a részletösszeg képlete $\frac{1-q^{n+1}}{1-q}$, amelynek határértéke $\frac{1}{1-q}$. Ha $|q|\ge1$, a tagok nem tartanak nullához (vagy éppen nőnek), ezért a sor divergál. Ebből a két esetből származik a kritériumok nagy része is.`,
      ],
      when: 'Minden sorozat-/sor-feladat alapja. A vizsgán a leggyakoribb kérdés: konvergens-e a sor, és ha igen, mennyi az összege? Sorösszeg kiszámítására csak kevés esetben van zárt képlet: geometriai sor, teleszkopikus sor, és néhány nevezetes sor. A többi esetben a kritériumok csak a konvergenciát döntik el, az összeget nem adják meg.',
      theory: [
        MB.def('Végtelen sor, részletösszeg', R`Legyen $(a_n)$ valós sorozat. A $\sum_{n=1}^{\infty}a_n$ sor $n$-edik részletösszege $s_n=a_1+a_2+\cdots+a_n$. A sor konvergens, ha az $(s_n)$ sorozat konvergens; ekkor összege $S=\lim_{n\to\infty}s_n$. Ha a határérték nem létezik (vagy végtelen), a sor divergens.`),
        MB.formula('Geometriai sor', R`\sum_{n=0}^{\infty}q^n=\frac{1}{1-q}\quad (|q|<1),\qquad s_n=\frac{1-q^{n+1}}{1-q}.`, R`Általános első taggal: $\sum_{n=0}^\infty aq^n=\frac{a}{1-q}$. Ha $|q|\ge1$, a sor divergens.`),
        MB.thm('A konvergencia szükséges feltétele', R`\sum_{n=1}^{\infty}a_n\ \text{konvergens}\ \Longrightarrow\ a_n\to0.`, 'Ez csak szükséges, nem elégséges: a harmonikus sor tagjai nullához tartanak, a sor mégis divergens. Kontrapozícióként nagyon hasznos: ha $a_n\not\to0$, a sor biztosan divergens.'),
        MB.note('Miért divergál a harmonikus sor?', R`Csoportosítsuk a tagokat: $1+\frac12+\left(\frac13+\frac14\right)+\left(\frac15+\cdots+\frac18\right)+\cdots$. Minden zárójeles blokkban $2^k$ tag van, és mindegyik legalább $\frac{1}{2^{k+1}}$, ezért a blokk összege legalább $\frac12$. Végtelen sok ilyen blokk van, tehát a részletösszegek nem korlátosak: $s_{2^k}\ge 1+\frac{k}{2}\to\infty$.`),
        MB.thm('A $p$-sor', R`\sum_{n=1}^{\infty}\frac{1}{n^p}\ \text{konvergens}\iff p>1.`, 'A $p=1$ eset a harmonikus sor, amely divergens. A $p=2$ esetben az összeg $\frac{\pi^2}{6}$, de ezt a kritérium nem adja meg.'),
        MB.note('Teleszkopikus sor', R`Ha a tag felírható $a_n=b_n-b_{n+1}$ alakban, akkor $s_n=b_1-b_{n+1}$, tehát a sor összege $b_1-\lim b_{n+1}$. Például $\frac{1}{n(n+1)}=\frac1n-\frac1{n+1}$, ezért $\sum_{n=1}^\infty\frac{1}{n(n+1)}=1$.`),
        MB.formula('Műveletek konvergens sorokkal', R`\sum(a_n\pm b_n)=\sum a_n\pm\sum b_n,\qquad \sum c\,a_n=c\sum a_n.`, 'Csak akkor érvényes, ha mindkét sor konvergens. Két divergens sor különbsége lehet konvergens, ezért divergenciára ilyen módon nem következtetünk.'),
        MB.warn('Tipikus hibák', R`A $\sum$ jelet nem szabad úgy kezelni, mint egy közönséges összeget: a tagok átrendezése végtelen sorban nem mindig megengedett. Az sem elég a konvergenciához, hogy $a_n\to0$ — ezt a harmonikus sor cáfolja. Végül: $\sum(a_n+b_n)$ felbontása csak akkor használható, ha a két sor külön-külön konvergens.`)
      ],
      examples: [
        MB.example({
          title: 'Geometriai sor összege',
          problem: R`Számítsuk ki: $\displaystyle\sum_{n=1}^{\infty}\frac{1}{2^n}$.`,
          steps: [
            R`Ez geometriai sor, ahol $a_1=\frac12$ és $q=\frac12$.`,
            R`Mivel $|q|=\frac12<1$, a sor konvergens.`,
            R`Az összeg: $S=\frac{a_1}{1-q}=\frac{1/2}{1-1/2}=1$.`,
            R`Ellenőrzés részletösszeggel: $s_n=1-\frac{1}{2^n}\to1$.`
          ],
          answer: R`$1$`
        }),
        MB.example({
          title: 'Teleszkopikus sor',
          problem: R`Számítsuk ki: $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n(n+1)}$.`,
          steps: [
            R`Parciális törtekre bontunk: $\frac{1}{n(n+1)}=\frac1n-\frac1{n+1}$.`,
            R`A részletösszeg: $s_n=\left(1-\frac12\right)+\left(\frac12-\frac13\right)+\cdots+\left(\frac1n-\frac1{n+1}\right)$.`,
            R`Minden belső tag kiesik: $s_n=1-\frac{1}{n+1}$.`,
            R`Határérték: $\lim s_n=1$, tehát a sor összege 1.`
          ],
          answer: R`$1$`
        }),
        MB.example({
          title: 'A harmonikus sor divergenciája',
          problem: R`Mutassuk meg, hogy $\displaystyle\sum_{n=1}^{\infty}\frac1n$ divergens, bár a tagok nullához tartanak.`,
          steps: [
            R`A tagokra $a_n=\frac1n\to0$, tehát a szükséges feltétel teljesül — ez még nem dönt.`,
            R`Csoportosítsuk a tagokat $1$, $\frac12$, $\frac13+\frac14$, $\frac15+\cdots+\frac18$, stb. szerint.`,
            R`A $k$-adik blokkban $2^k$ tag van, mindegyik legalább $\frac{1}{2^{k+1}}$, ezért a blokk összege legalább $\frac12$.`,
            R`Így $s_{2^k}\ge1+\frac{k}{2}$, ami minden korlátot meghalad, tehát a részletösszegek nem korlátosak: a sor divergens.`
          ],
          answer: R`Divergens`
        }),
        MB.example({
          title: '$p$-sor összehasonlítása',
          problem: R`Konvergens-e $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^2}$?`,
          steps: [
            R`Ez $p=2$ paraméterű $p$-sor.`,
            R`A $p$-sor kritériuma szerint $p>1$ esetén konvergens.`,
            R`Közvetlenül is látható: $\frac{1}{n^2}\le\frac{1}{n(n-1)}$ minden $n\ge2$-re, és $\sum\frac{1}{n(n-1)}$ teleszkopikus, tehát konvergens.`,
            R`A majoráns kritérium miatt az eredeti sor is konvergens.`
          ],
          answer: R`Konvergens`
        })
      ],
      mistakes: [
        R`Azt gondolni, hogy $a_n\to0$ már elég a konvergenciához (a harmonikus sor ellenpélda).`,
        R`A geometriai sor képletét $|q|\ge1$ esetén is használni.`,
        R`A részletösszeget összekeverni a sor összegével: $s_n$ véges, a sor összege a határérték.`,
        R`Két sor különbségét tagonként felbontani úgy, hogy az egyik (vagy mindkettő) divergens.`
      ],
      exercises: [
        MB.q({ level: 1, q: R`Számítsd ki: $\displaystyle\sum_{n=0}^{\infty}\left(\frac13\right)^n$.`, a: '3/2', alt: ['1.5'], type: 'expr', hint: R`$a=1$, $q=\frac13$: $\frac{a}{1-q}$.`, sol: R`$\frac{1}{1-1/3}=\frac{3}{2}$.` }),
        MB.q({ level: 1, q: R`Számítsd ki: $\displaystyle\sum_{n=1}^{\infty}\frac{1}{4^n}$.`, a: '1/3', type: 'number', hint: R`Első tag $\frac14$, hányados $\frac14$.`, sol: R`$\frac{1/4}{1-1/4}=\frac{1/4}{3/4}=\frac13$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\sum_{n=1}^{\infty}\frac{5}{2^n}$.`, a: '5', type: 'number', hint: R`Emeld ki az 5-öt, és használd a $\sum\frac{1}{2^n}=1$ eredményt.`, sol: R`$5\cdot\sum_{n=1}^\infty\frac{1}{2^n}=5\cdot1=5$.` }),
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n(n+1)}$.`, a: '1', type: 'number', hint: R`$\frac{1}{n(n+1)}=\frac1n-\frac1{n+1}$, teleszkopikus.`, sol: R`$s_n=1-\frac{1}{n+1}\to1$.` }),
        MB.q({ level: 2, q: R`Konvergens vagy divergens: $\displaystyle\sum_{n=1}^{\infty}\frac1n$?`, type: 'choice', choices: ['Konvergens', 'Divergens'], a: '1', sol: R`A harmonikus sor divergens: a tagok nullához tartanak, de a részletösszegek nem korlátosak.` }),
        MB.q({ level: 2, q: R`Konvergens vagy divergens: $\displaystyle\sum_{n=1}^{\infty}\frac{n}{n+1}$?`, type: 'choice', choices: ['Konvergens', 'Divergens'], a: '1', sol: R`$a_n=\frac{n}{n+1}\to1\neq0$, tehát a szükséges feltétel sérül: a sor divergens.` }),
        MB.q({ level: 1, q: R`Konvergens vagy divergens: $\displaystyle\sum_{n=1}^{\infty}2^n$?`, type: 'choice', choices: ['Konvergens', 'Divergens'], a: '1', sol: R`Geometriai sor $q=2>1$ hányadossal, a tagok nem tartanak nullához: divergens.` }),
        MB.q({ level: 3, type: 'proof', q: R`Bizonyítsd be, hogy a harmonikus sor divergens.`, hint: R`Csoportosíts $2^k$ tagot tartalmazó blokkokba, és becsüld alulról minden blokkot.`, sol: R`Tekintsük a blokkokat: $1$, $\frac12$, $\frac13+\frac14$, $\frac15+\cdots+\frac18$, általában a $k$-adik blokk a $\frac{1}{2^k+1},\dots,\frac{1}{2^{k+1}}$ tagokból áll. Ebben $2^k$ tag van, és mindegyik legalább $\frac{1}{2^{k+1}}$, ezért a blokk összege legalább $2^k\cdot\frac{1}{2^{k+1}}=\frac12$. Az első $k$ blokk után a részletösszeg legalább $1+\frac{k}{2}$, ami $k\to\infty$ esetén végtelenhez tart. Tehát a részletösszegek nem korlátosak, a sor divergens.` })
      ],
      video: { list: 'PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr', title: 'Essence of calculus', channel: '3Blue1Brown', kind: 'LEJÁTSZÁSI LISTA' }
    },
    {
      id: 'sorok-kriteriumok', num: '8.2', title: 'Majoráns, minoráns, hányados, gyök', minutes: 34,
      lead: 'A kritériumok nem kiszámítják az összeget, hanem eldöntik, hogy létezik-e. Ezért mindig azt kell megnézni, milyen alakú a tag: faktoriális, $n$-edik hatvány, vagy racionális tört.',
      why: [
        'Az összehasonlító kritériumok mögött egyetlen gondolat van: ha egy nemnegatív tagú sort felülről tudunk becsülni egy konvergens sorral (majoráns), akkor a részletösszegei korlátosak, tehát konvergálnak. Megfordítva: ha alulról becsüljük egy divergens sorral, akkor a részletösszegek nem korlátosak, tehát divergál. Ehhez mindig egy ismert referenciasorra van szükség: leggyakrabban a geometriai sorra vagy a $p$-sorra.',
        'A hányados- és gyökkritérium ugyanezt a geometriai sorral való összehasonlítást végzi el automatikusan. Ha a szomszédos tagok aránya (vagy a tag $n$-edik gyöke) határértékben $q<1$, akkor a sor „kvázi geometriai” módon viselkedik, ezért konvergens. Ha $q>1$, a tagok nem tartanak nullához, ezért divergens. A $q=1$ esetben a teszt semmit nem mond, mert ekkor a sor éppen a $p$-sorok határán van — ilyenkor másik kritérium kell.'
      ],
      when: 'Faktoriális vagy $n$-edik hatvány az integrandusban: hányados- vagy gyökkritérium. Racionális tört $n$-ben: határértékes összehasonlítás $p$-sorral. Vegyes, bonyolult tag: majoráns becslés egyszerűbb sorral. Ha a sor előjelt vált, először az abszolút konvergenciát érdemes vizsgálni — ha az teljesül, kész vagyunk.',
      theory: [
        MB.thm('Majoráns és minoráns kritérium', R`Ha $0\le a_n\le b_n$ minden $n$-re és $\sum b_n$ konvergens, akkor $\sum a_n$ is konvergens. Ha $0\le b_n\le a_n$ és $\sum b_n$ divergens, akkor $\sum a_n$ is divergens.`),
        MB.thm('Határértékes összehasonlítás', R`Ha $a_n,b_n>0$ és $\dfrac{a_n}{b_n}\to c$ valamely $0<c<\infty$ konstanshoz, akkor $\sum a_n$ és $\sum b_n$ egyszerre konvergens vagy divergens.`, 'Ha $c=0$: $\sum b_n$ konvergenciája maga után vonja $\sum a_n$ konvergenciáját. Ha $c=\infty$: $\sum b_n$ divergenciája vonja maga után $\sum a_n$ divergenciáját.'),
        MB.thm('Hányadoskritérium', R`Legyen $a_n>0$ és $\lim_{n\to\infty}\dfrac{a_{n+1}}{a_n}=q.$ Ha $q<1$, a sor konvergens; ha $q>1$ (vagy $q=\infty$), a sor divergens; ha $q=1$, a kritérium nem dönt.`),
        MB.thm('Gyökkritérium', R`Legyen $a_n\ge0$ és $\lim_{n\to\infty}\sqrt[n]{a_n}=q.$ Ekkor $q<1$ esetén a sor konvergens, $q>1$ esetén divergens, $q=1$ esetén nem dönt.`),
        MB.thm('Abszolút konvergencia', R`\sum|a_n|\ \text{konvergens}\ \Longrightarrow\ \sum a_n\ \text{konvergens},`),
        MB.note('Melyik kritériumot válasszuk?', R`Faktoriális a tagban: hányadoskritérium, mert a faktoriálisok aránya egyszerűsödik. $n$-edik hatvány (pl. $\left(\frac{n}{2n+1}\right)^n$): gyökkritérium. Racionális tört $n$-ben: határértékes összehasonlítás $p$-sorral, a nevező legmagasabb fokszáma dönt. Vegyes szorzat (pl. $\frac{n^2}{2^n}$): hányadoskritérium, mert a kitevős tényező dominál.`),
        MB.warn('A $q=1$ csapda', R`A $q=1$ eset nem azt jelenti, hogy a sor konvergens vagy divergens — azt jelenti, hogy ez a kritérium nem alkalmazható. Például $\sum\frac1n$ és $\sum\frac{1}{n^2}$ esetében a hányadoskritérium határértéke egyaránt 1, mégis az első divergens, a második konvergens. Ilyenkor $p$-sorral való összehasonlítás vagy integrálkritérium kell.`),
        MB.list('Referenciasorok', [
          R`Geometriai: $\sum q^n$ konvergens, ha $|q|<1$.`,
          R`$p$-sor: $\sum\frac{1}{n^p}$ konvergens, ha $p>1$.`,
          R`$\sum\frac{1}{n(\ln n)^p}$ konvergens, ha $p>1$ (integrálkritériummal).`,
          R`$\sum\frac{1}{n!}$ konvergens (hányadoskritérium: $q=0$).`
        ])
      ],
      examples: [
        MB.example({
          title: 'Hányadoskritérium faktoriális nélkül is',
          problem: R`Konvergens-e $\displaystyle\sum_{n=1}^{\infty}\frac{n}{2^n}$?`,
          steps: [
            R`A tag $a_n=\frac{n}{2^n}>0$; a hányadost számoljuk: $\frac{a_{n+1}}{a_n}=\frac{(n+1)/2^{n+1}}{n/2^n}$.`,
            R`Egyszerűsítve: $\frac{n+1}{n}\cdot\frac{2^n}{2^{n+1}}=\frac{n+1}{2n}$.`,
            R`Határérték: $\frac{n+1}{2n}\to\frac12<1$.`,
            R`A hányadoskritérium szerint a sor konvergens. (Az összeg egyébként 2.)`
          ],
          answer: R`Konvergens`
        }),
        MB.example({
          title: 'Majoráns becslés',
          problem: R`Konvergens-e $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^2+1}$?`,
          steps: [
            R`Minden $n$-re $n^2+1>n^2$, ezért $\frac{1}{n^2+1}<\frac{1}{n^2}$.`,
            R`A $\sum\frac{1}{n^2}$ $p=2>1$ miatt konvergens.`,
            R`A majoráns kritérium szerint tehát $\sum\frac{1}{n^2+1}$ is konvergens.`,
            R`Az összeget nem ismerjük zárt alakban; a kritérium csak a konvergenciát adja.`
          ],
          answer: R`Konvergens`
        }),
        MB.example({
          title: 'Geometriai sor hányadoskritériummal',
          problem: R`Konvergens-e $\displaystyle\sum_{n=1}^{\infty}\left(\frac23\right)^n$, és mennyi az összege?`,
          steps: [
            R`Geometriai sor, $q=\frac23$, első tag $a_1=\frac23$.`,
            R`$|q|<1$, tehát konvergens.`,
            R`Összeg: $S=\frac{a_1}{1-q}=\frac{2/3}{1/3}=2$.`,
            R`Hányadoskritériummal is: $\frac{a_{n+1}}{a_n}=\frac23<1$, ugyanaz az eredmény.`
          ],
          answer: R`Konvergens, összege $2$`
        })
      ],
      mistakes: [
        R`A $q=1$ esetből konvergenciára (vagy divergenciára) következtetni.`,
        R`A hányadoskritériumot váltakozó előjelű sorra minden előkészítés nélkül alkalmazni — abszolútértéket kell venni.`,
        R`A majoráns becslésnél rossz irányba becsülni: felülről kell becsülni egy konvergens sorral.`,
        R`A $\sum\frac{1}{n^2+1}$-et $\sum\frac{1}{n^2}$ helyett $\sum\frac1n$-nel összehasonlítani, és ebből divergenciára jutni.`
      ],
      exercises: [
        MB.q({ level: 2, q: R`Számítsd ki: $\displaystyle\sum_{n=1}^{\infty}\frac{n}{2^n}$.`, a: '2', type: 'number', hint: R`$\sum nq^n=\frac{q}{(1-q)^2}$ $|q|<1$ esetén, itt $q=\frac12$.`, sol: R`$\frac{1/2}{(1/2)^2}=2$. Ellenőrzés: $s_n=2-\frac{n+2}{2^n}\to2$.` }),
        MB.q({ level: 2, q: R`Konvergens vagy divergens: $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^2+1}$?`, type: 'choice', choices: ['Konvergens', 'Divergens'], a: '0', sol: R`$\frac{1}{n^2+1}<\frac{1}{n^2}$, és $\sum\frac{1}{n^2}$ konvergens ($p=2$), tehát majoráns kritériummal konvergens.` }),
        MB.q({ level: 2, q: R`Konvergens vagy divergens: $\displaystyle\sum_{n=1}^{\infty}\frac{n}{n^2+1}$?`, type: 'choice', choices: ['Konvergens', 'Divergens'], a: '1', sol: R`$\frac{n}{n^2+1}\sim\frac1n$: a hányados határértéke 1, tehát a harmonikus sorral azonos természetű, azaz divergens.` }),
        MB.q({ level: 2, q: R`A $\displaystyle\sum_{n=1}^{\infty}\frac{2^n}{n!}$ sornál mit ad a hányadoskritérium határértéke ($q$)?`, a: '0', type: 'number', hint: R`$\frac{a_{n+1}}{a_n}=\frac{2}{n+1}$.`, sol: R`$\frac{2^{n+1}/(n+1)!}{2^n/n!}=\frac{2}{n+1}\to0<1$, tehát konvergens (összege $e^2-1$).` }),
        MB.q({ level: 3, q: R`Konvergens vagy divergens: $\displaystyle\sum_{n=1}^{\infty}\frac{n!}{n^n}$?`, type: 'choice', choices: ['Konvergens', 'Divergens'], a: '0', sol: R`$\frac{a_{n+1}}{a_n}=\frac{(n+1)!}{(n+1)^{n+1}}\cdot\frac{n^n}{n!}=\left(\frac{n}{n+1}\right)^n\to\frac1e<1$, tehát konvergens.` }),
        MB.q({ level: 3, q: R`Mit ad a gyökkritérium a $\displaystyle\sum_{n=1}^{\infty}\left(\frac{n}{2n+1}\right)^n$ sornál? Add meg a határértéket.`, a: '1/2', alt: ['0.5'], type: 'expr', hint: R`$\sqrt[n]{a_n}=\frac{n}{2n+1}$.`, sol: R`A gyök pontosan $\frac{n}{2n+1}\to\frac12<1$, tehát a sor konvergens.` }),
        MB.q({ level: 1, q: R`Konvergens vagy divergens: $\displaystyle\sum_{n=1}^{\infty}\frac{1}{\sqrt n}$?`, type: 'choice', choices: ['Konvergens', 'Divergens'], a: '1', sol: R`$p$-sor $p=\frac12<1$, tehát divergens.` }),
        MB.q({ level: 3, type: 'proof', q: R`Bizonyítsd be, hogy ha $\sum|a_n|$ konvergens, akkor $\sum a_n$ is konvergens.`, hint: R`Használd a Cauchy-kritériumot, és a háromszög-egyenlőtlenséget a részletösszegek különbségére.`, sol: R`Legyen $(s_n)$ a $\sum a_n$, $(S_n)$ a $\sum|a_n|$ részletösszeg-sorozata. Mivel $\sum|a_n|$ konvergens, $(S_n)$ Cauchy-sorozat: minden $\varepsilon>0$-hoz van $N$, hogy $m>n>N$ esetén $S_m-S_n=\sum_{k=n+1}^{m}|a_k|<\varepsilon$. Ekkor a háromszög-egyenlőtlenséggel $|s_m-s_n|=\left|\sum_{k=n+1}^{m}a_k\right|\le\sum_{k=n+1}^{m}|a_k|<\varepsilon$, tehát $(s_n)$ is Cauchy-sorozat. Valós sorozat pontosan akkor konvergens, ha Cauchy, ezért $\sum a_n$ konvergens.` })
      ],
      video: { list: 'PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr', title: 'Essence of calculus', channel: '3Blue1Brown', kind: 'LEJÁTSZÁSI LISTA' }
    },
    {
      id: 'sorok-leibniz', num: '8.3', title: 'Leibniz-sorok, abszolút és feltételes konvergencia', minutes: 28,
      lead: 'Ha a tagok előjele váltakozik és a nagyságuk monoton csökken nullához, a sor konvergens — és a hiba, amit egy részletösszegnél elkövetünk, egyszerűen a következő tag.',
      why: [
        'A váltakozó előjelű soroknál a részletösszegek két sorozata (páros és páratlan indexű) egymás felé közelít, mint egy összecsukódó olló. Ha a tagok nagysága monoton csökken és nullához tart, akkor a páros részletösszegek nőnek, a páratlanok csökkennek, és a két sorozat ugyanahhoz a határértékhez tart. Ez a Leibniz-kritérium tartalma. Fontos, hogy a monotonitás is kell: a tagok nullához tartása önmagában nem elég.',
        'Az abszolút konvergencia erősebb tulajdonság, mint a puszta konvergencia. Ha a tagok abszolútértékéből képzett sor is konvergens, akkor a sor minden átrendezés mellett ugyanahhoz az összeghez tart — ezért lehet vele „normálisan” számolni. Feltételes konvergencia esetén ez nem igaz: Riemann tétele szerint a tagok átrendezésével tetszőleges összeget (vagy divergenciát) el lehet érni. Ezért kell mindig megkülönböztetni a kettőt.'
      ],
      when: R`Váltakozó előjelű soroknál mindig először az abszolút konvergenciát vizsgáljuk. Ha az teljesül, kész. Ha nem, jön a Leibniz-kritérium. A hibabecslés ($|s-s_n|\le c_{n+1}$) akkor hasznos, ha a sor összegét közelíteni akarjuk, például $\ln 2$ vagy $\pi/4$ kiszámításánál. A vizsgán gyakran kérdés a „feltételesen vagy abszolút konvergens” megkülönböztetés.`,
      theory: [
        MB.def('Váltakozó előjelű sor', R`Váltakozó előjelű sornak nevezzük a $\sum_{n=1}^{\infty}(-1)^n c_n$ vagy $\sum_{n=1}^{\infty}(-1)^{n+1}c_n$ alakú sort, ahol $c_n>0$ minden $n$-re. A $c_n$ a tag nagysága, az előjelet a $(-1)^n$ tényező adja.`),
        MB.thm('Leibniz-kritérium', R`Ha $c_n>0$, a $(c_n)$ sorozat monoton csökkenő ($c_{n+1}\le c_n$) és $c_n\to0$, akkor a $\sum(-1)^n c_n$ sor konvergens.`, 'Mindhárom feltétel kell: pozitivitás, monotonitás, nullához tartás.'),
        MB.thm('Hibabecslés', R`A Leibniz-sor $S$ összegére és $s_n$ részletösszegére
|S-s_n|\le c_{n+1},`),
        MB.def('Abszolút és feltételes konvergencia', R`A $\sum a_n$ sor abszolút konvergens, ha $\sum|a_n|$ konvergens. Feltételesen konvergens, ha $\sum a_n$ konvergens, de $\sum|a_n|$ divergens. Abszolút konvergens sor minden átrendezése ugyanahhoz az összeghez tart; feltételesen konvergensnél ez nem igaz.`),
        MB.note('Miért veszélyes a feltételes konvergencia?', R`A $\sum(-1)^{n+1}\frac1n$ sor feltételesen konvergens. Riemann átrendezési tétele szerint a tagok sorrendjét megváltoztatva tetszőleges valós számot kaphatunk összegként — sőt divergens sor is előállítható. Ezért a végtelen sorokat nem szabad „véges összegként” kezelni: a zárójelezés és az átrendezés csak abszolút konvergens esetben megengedett.`),
        MB.formula('Nevezetes feltételesen konvergens sor', R`\sum_{n=1}^{\infty}\frac{(-1)^{n+1}}{n}=1-\frac12+\frac13-\cdots=\ln 2.`, 'Ennek abszolútértékes párja a harmonikus sor, amely divergens — ezért feltételes.'),
        MB.warn('A Leibniz feltételei nem teljesülnek automatikusan', R`A $\sum(-1)^n\frac{n}{n+1}$ sornál $c_n=\frac{n}{n+1}\to1\neq0$, tehát a sor már a szükséges feltételen elbukik: divergens. A monotonitást is ellenőrizni kell: $c_n=\frac{1}{\ln n}$ esetén $n\ge2$-től csökken, de $n=1$-nél nem értelmezett — ilyenkor a sort $n=2$-től vizsgáljuk, mert véges sok tag elhagyása nem változtat a konvergencián.`),
        MB.list('Ellenőrzési sorrend', [
          R`Először: $a_n\to0$? Ha nem, divergens.`,
          R`Abszolút konvergens? Ha igen, kész (erősebb állítás).`,
          R`Ha nem: Leibniz feltételei (pozitivitás, monotonitás, nullához tartás) teljesülnek-e?`,
          R`Hibabecslés: a hiba legfeljebb a következő tag nagysága.`
        ])
      ],
      examples: [
        MB.example({
          title: 'Feltételesen konvergens sor',
          problem: R`Vizsgáljuk a $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^n}{\sqrt n}$ sort.`,
          steps: [
            R`A tag nagysága $c_n=\frac{1}{\sqrt n}>0$, és $c_n$ monoton csökken, mert $\sqrt n$ nő.`,
            R`$c_n\to0$, tehát a Leibniz-kritérium feltételei teljesülnek: a sor konvergens.`,
            R`Abszolút konvergenciához $\sum\frac{1}{\sqrt n}$-et nézzük: ez $p=\frac12<1$, tehát divergens.`,
            R`A sor tehát feltételesen konvergens.`
          ],
          answer: R`Feltételesen konvergens`
        }),
        MB.example({
          title: 'A váltakozó harmonikus sor',
          problem: R`Konvergens-e $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n+1}}{n}$, és mennyi az összege?`,
          steps: [
            R`$c_n=\frac1n>0$, monoton csökken, és $c_n\to0$: Leibniz szerint konvergens.`,
            R`Abszolútértékben a harmonikus sort kapjuk, amely divergens.`,
            R`Tehát feltételesen konvergens, és az összeg a nevezetes eredmény szerint $\ln 2$.`,
            R`Ellenőrzés: $s_{1000}\approx0{,}6926$, közel $\ln 2\approx0{,}6931$.`
          ],
          answer: R`Feltételesen konvergens, összege $\ln 2$`
        }),
        MB.example({
          title: 'Hiba becslése 99 tag után',
          problem: R`A $\sum(-1)^{n+1}\frac1n$ sor összegét a $s_{99}$ részletösszeggel közelítjük. Mekkora a hiba legfeljebb?`,
          steps: [
            R`A Leibniz-féle hibabecslés: $|S-s_{99}|\le c_{100}$.`,
            R`$c_{100}=\frac{1}{100}=0{,}01$.`,
            R`Tehát a hiba legfeljebb $0{,}01$.`,
            R`Valójában sokkal kisebb, mert a becslés csak felső korlát: $\ln2-s_{99}\approx0{,}005$.`
          ],
          answer: R`$|S-s_{99}|\le0{,}01$`
        })
      ],
      mistakes: [
        R`A Leibniz-kritériumot monotonitás nélkül alkalmazni: a nullához tartás önmagában nem elég.`,
        R`A konvergenciát összekeverni az abszolút konvergenciával: $\sum\frac{(-1)^n}{\sqrt n}$ konvergens, de nem abszolút konvergens.`,
        R`Feltételesen konvergens sornál a tagokat átrendezni vagy tetszőlegesen zárójelezni.`,
        R`A hibabecslést $c_n$-nel felírni $c_{n+1}$ helyett: az $n$ tagú részletösszeg hibája a következő tag által korlátozott.`
      ],
      exercises: [
        MB.q({ level: 2, q: R`Milyen típusú konvergenciája van a $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^n}{\sqrt n}$ sornak?`, type: 'choice', choices: ['Abszolút konvergens', 'Feltételesen konvergens', 'Divergens'], a: '1', sol: R`Leibniz szerint konvergens, de $\sum\frac{1}{\sqrt n}$ $p=\frac12<1$ miatt divergens, tehát feltételes.` }),
        MB.q({ level: 2, q: R`Mennyi a $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n+1}}{n}$ sor összege?`, a: 'ln(2)', alt: ['ln2', 'log(2)', '0.6931'], type: 'expr', hint: R`A váltakozó harmonikus sor nevezetes összege.`, sol: R`Az összeg $\ln 2\approx0{,}6931$.` }),
        MB.q({ level: 2, q: R`A $\sum(-1)^{n+1}/n$ sor összegét $s_{99}$-cel közelítjük. Add meg a hibabecslés felső korlátját.`, a: '0.01', alt: ['1/100'], type: 'number', hint: R`$|S-s_n|\le c_{n+1}$.`, sol: R`$c_{100}=\frac{1}{100}=0{,}01$.` }),
        MB.q({ level: 2, q: R`Konvergens vagy divergens: $\displaystyle\sum_{n=1}^{\infty}(-1)^n\frac{n}{n+1}$?`, type: 'choice', choices: ['Konvergens', 'Divergens'], a: '1', sol: R`$c_n=\frac{n}{n+1}\to1\neq0$, tehát a tagok nem tartanak nullához: divergens.` }),
        MB.q({ level: 1, q: R`Abszolút konvergens-e a $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^n}{n^2}$ sor?`, type: 'choice', choices: ['Igen', 'Nem'], a: '0', sol: R`$\sum\frac{1}{n^2}$ $p=2>1$ miatt konvergens, tehát a sor abszolút konvergens.` }),
        MB.q({ level: 3, q: R`A $\sum(-1)^{n+1}/n^2$ sor összegét $s_9$-cel közelítjük. Add meg a hibabecslés felső korlátját.`, a: '0.01', alt: ['1/100'], type: 'number', hint: R`$c_{10}=\frac{1}{10^2}$.`, sol: R`$|S-s_9|\le c_{10}=\frac{1}{100}=0{,}01$.` }),
        MB.q({ level: 3, q: R`Konvergens vagy divergens: $\displaystyle\sum_{n=2}^{\infty}\frac{(-1)^n}{\ln n}$?`, type: 'choice', choices: ['Konvergens', 'Divergens'], a: '0', sol: R`$c_n=\frac{1}{\ln n}$ $n\ge2$-től monoton csökken és nullához tart, tehát Leibniz szerint konvergens (abszolútértékben divergens, mert $\frac{1}{\ln n}\ge\frac1n$ elég nagy $n$-re).` }),
        MB.q({ level: 3, type: 'proof', q: R`Bizonyítsd be a Leibniz-féle hibabecslést: ha $c_n\searrow0$, akkor $|S-s_n|\le c_{n+1}$.`, hint: R`Írd fel a maradékot $S-s_n=(-1)^{n+1}\left(c_{n+1}-c_{n+2}+c_{n+3}-\cdots\right)$ alakban, és használd a zárójeles kifejezés monotonitását.`, sol: R`A maradék $R_n=S-s_n=(-1)^{n+1}\left(c_{n+1}-c_{n+2}+c_{n+3}-\cdots\right)$. A zárójelben álló váltakozó sor összege a Leibniz-kritérium szerint nemnegatív és legfeljebb az első tag: $0\le c_{n+1}-c_{n+2}+c_{n+3}-\cdots\le c_{n+1}$. Ez azért igaz, mert a zárójel értéke a páros és páratlan részletösszegek között van, és ezek a $c_{n+1}$ és $c_{n+1}-c_{n+2}$ értékek közé esnek. Így $|R_n|\le c_{n+1}$.` })
      ],
      video: { list: 'PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr', title: 'Essence of calculus', channel: '3Blue1Brown', kind: 'LEJÁTSZÁSI LISTA' }
    }
  ]
});
