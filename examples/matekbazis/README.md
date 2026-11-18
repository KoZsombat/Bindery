# MatekBázis — az első félév alapjai

Felkészítő tanulókönyv a BME VIK mérnökinformatikus első félévének **alapjaihoz**: elmélet, videók, kidolgozott példák, ellenőrizhető feladatok, fejezettesztek és ZH/vizsga-szimulátor.

**Nem a teljes félév anyaga.** A cél, hogy az első hetek ne az alapok pótlásáról szóljanak. A 08–13. részek opcionális előretekintések; csak a magabiztos alap után érdemes elővenni őket.

**Nem kell hozzá HTML, programozás vagy telepítés.** Az egész egy mappa, benne egy `index.html`.

## Megnyitás — 3 lépés

1. Kattints duplán az **`index.html`** fájlra. Megnyílik a böngésződben.
2. Ha ez nem működik (ritka böngésző-beállítás), indítsd el a **`start.bat`**-ot Windows-on, a **`start.command`**-ot macOS-en, vagy a **`start.sh`**-t Linuxon. Ezek egy helyi szervert indítanak, és megnyitják az oldalt.
3. Ha a böngésző kérdezi, engedélyezd a helyi fájl megnyitását. Chrome, Edge vagy Firefox ajánlott.

> A videók kivételével minden helyben működik, internet nélkül is. A YouTube-videókhoz internet kell.

## Miből indulunk ki?

Feltételezem, hogy **középszintű érettségi** szinten tanultál matematikát, de sok mindent elfelejtettél. Az **1. rész** ezért ismétlés, nem nulláról kezdés: a „Miért?” blokkok a régi szabályokat elevenítik fel, a feladatok visszamérnek. Ha valami ismerős, ugorj a feladatokra; ha nem, olvasd el a magyarázatot.

## Tanulási útvonal

1. **Kötelező mag (01–07):** Alapok → Logika → Komplex számok → Sorozatok → Határérték → Deriválás → Integrálás.
2. **Előretekintés (08–13):** Sorok → Taylor → Többváltozós → Diff. egyenletek/Fourier; külön sávban Lineáris algebra és Diszkrét matematika.
3. Minden rész a korábbiakra épül. A fejezetoldalak tetején látszik az előfeltétel.

## Hogyan használd?

- **Bal oldali tartalomjegyzék**: 7 alaprész + 6 opcionális előretekintés, 34 fejezet. Kattints a fejezetre.
- **Egy fejezet felépítése**: Elmélet → Videó → Kidolgozott példák → Tipikus hibák → Gyakorló feladatok → Teszt.
- **Feladatok**: írd be az eredményt, majd „Ellenőrzés”. Hibánál sárga „még nem” visszajelzést kapsz, nem piros X-et; a „Segítség” és „Megoldás” gombok segítenek, ha elakadsz.
- **Fejezet teszt**: a fejezet végén 8 kérdés, 10 perc, pontszám és részletes kiértékelés.
- **Feladatbank**: 15 kategória, kategóriánként 50 generált feladat (10 könnyű / 10 közepes / 30 nehéz, arány 1 : 1 : 3). Az „Új feladatsor” gombbal új változatokat kapsz; az egyes feladatok mellett is van újragenerálás.
- **ZH / vizsga szimulátor**: ZH1, ZH2, vizsga és gyors gyakorlás, időlimittel és jegybecsléssel.
- **Mai terv**: a kezdőlapon a „Mai terv indítása” gomb 30 / 60 / 120 perces blokkot épít: esedékes ismétlés → következő fejezet tanulása → vegyes gyakorlás → a mai hibák újra. A lépések külön blokkok; a tanulás és az ismétlés nem keveredik. A „Rossz nap? 5 perc is számít.” a minimum nap, és beleszámít a sorozatba.
- **Napi percek és szokás**: a látható fülön töltött aktív időt méri, 5 hetes naptárrácsot mutat, és 30 perctől 60–120 perc felé emeli a napi célt javaslatként (elfogadható, átállítható, figyelmen kívül hagyható). Hiányzó nap nem hiba.
- **Szokáseszközök**: szándékmezőből napi `.ics` emlékeztető; 15 perc után „nézd meg a megoldást, majd egy hasonlót” tipp; téves válasznál „miért nem ment?” címke (fogalom / számolási hiba / félreolvasás) és mintaösszegzés; tempóterv a vizsga dátumából; visszatérő képernyő hosszú kihagyás után; heti összegzés másolása és helyi haladáskód export/import (összefésül, nem töröl).
- **Fogalomtár**: 12 központi fogalom hétköznapi és pontos meghatározással, fejezetlinkkel; a szövegben minden definiált fogalom aláhúzott, kattintásra/préselésre buborékban mutatja a hétköznapi jelentést, és a fogalomtár bejegyzésre visz. A fogalomtár és a tárgymutató kereshető, és a keresés is megtalálja.
- **Tanulás és ismétlés**: négy külön mód — **10 perces tanulás** (elmélet + példa + 2 feladat), **20 perces tanulás** (két fejezet + 4 feladat), **5 perces ismétlés** (3 ismert feladat) és **10 perces ismétlés** (6 ismert feladat). A tanulás csak a kiválasztott rész még nem ismert fejezeteiből kérdez; az ismétlés csak a már teljesített fejezetekből. Emellett **tudástérkép**, **felmérés** résszinten, vizsga-visszaszámláló és heti vállalás. A „Nyugodt mód” elrejti a streak-elemeket, ha azok inkább nyomást jelentenek.
- **Napi küldetés**: 5 vegyes feladat naponta, kb. öt perc. A sorozat a megoldott napokat számolja, heti egy fagyasztóval.
- **Hibafüzet**: minden hibás válasz visszatér 1, 3, 7, majd 21 nap múlva. Az esedékes ismétlések száma a bal oldalon látszik.
- **Vegyes menet**: 10 feladat témacímkék nélkül — a módszer felismerése a feladat.
- **Hibavadászat**: 22 feladat, mindegyikben három állítás és pontosan egy hamis.
- **Magyarázd el**: minden fejezet végén két-három mondatban elmondhatod a fő ötletet; a szöveg mentődik.
- **Haladás**: ZH-felkészültség részenként és heti riport (válaszok, pontosság, ismétlések, gyenge témák); a térkép a becsült tudást mutatja, nem a videónézés idejét. Ha még nincs adat, `—` látszik, nem 0%.
- **Képletgyűjtemény**: 94 képlet, kereshető.
- **Téma**: a jobb felső nap/hold gombbal világos és sötét mód között válthatsz; a választás mentődik.
- **Nyelv**: a jobb felső `EN` / `HU` gombbal válthatsz. Minden látható szöveg teljesen kétnyelvű: a felület, a fejezetcímek és -leírások, az elmélet, a kidolgozott példák, a hibák, a feladatok és megoldásaik, a generált feladatbank, a napi küldetés, a hibafüzet, a hibavadászat, a magyarázd el blokk, a képletgyűjtemény és a videótár is.
- **Keresés**: `Ctrl + K` (vagy `/`), majd gépelj.
- **Haladás**: a jobb felső sarokban látszik; a böngésző menti. Ha privát ablakot használsz, bezáráskor elvész.

## Mi van a mappában?

```
index.html            ← ezt nyisd meg
start.bat             ← Windows egykattintásos indító
start.command         ← macOS indító
start.sh              ← Linux indító
assets/               ← kinézet és működés (nem kell nyúlni hozzá)
content/              ← a tananyag fejezetei
resources/            ← jegyzetek, ZH-k, vizsgák PDF-ben
vendor/katex/         ← matematikai képletek megjelenítése
README.md             ← ez a fájl
```

## Ha valami nem működik

- **Üres az oldal**: nyisd meg a `start.bat`-tal (helyi szerver), ne közvetlenül a fájlt.
- **Nincsenek képletek**: ellenőrizd, hogy a `vendor/katex/` mappa megvan.
- **Nem indul a videó**: a videók internetet igényelnek; kattints a „Több videó” linkre.
- **Eltűnt a haladás**: ne privát/inkognitó ablakban használd.
- **Nyomtatás**: a böngésző nyomtatás (Ctrl+P) a fejezetet tiszta fekete-fehéren adja.

## Tartalom és források

A tananyag a BME VIK mérnökinformatikus első évének anyagára épül: Fritz–Kónya–Pataki–Tasnádi *Matematika 1*, az Analízis 1–2 jegyzetek, a 2025–2026-os zárthelyik és vizsgák, valamint a saját felkészítő jegyzeteid. A `resources/` mappában az eredeti PDF-ek is megtalálhatók.

Ez tanulást segítő összefoglaló, nem hivatalos tanszéki jegyzet. A számonkérés szintjét mindig az aktuális követelményrendszer és a tanszéki anyagok adják.

---

**Ez egy már elkészült projekt.** A Bindery katalógusában példaként szerepel; a szerkesztő és az új könyvek generálása a repository `apps/server` és `apps/client` mappáiban található.
