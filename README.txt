LAPIIT STARTPAGE – V6.1

V6.1 fő változása: a korábbi CSS-es / generikus háttereket öt valódi, statikus,
egységesen kiválasztott háttérkép váltja.

HÁTTEREK
1. Lila–zöld aurora – hegyek, tó, lila és zöld sarki fény; ez az alapértelmezett.
2. Ködös hegyek – hajnali, ködös hegyvidék.
3. Csillagos éj – mélykék/lila éjszakai hegyvidék.
4. Sötét absztrakt – letisztult teal/kék hullámok.
5. Hajnali táj – világosabb, meleg napfelkeltés hegyvidék.
6. Saját kép – továbbra is helyileg feltölthető JPG / PNG / WebP.

A hátterek WEBP formátumban vannak a /backgrounds mappában, ezért GitHub Pages-en
lényegesen ésszerűbb a méretük, mint a generált PNG-ké.

MEGMARADT
- saját háttér feltöltése
- háttér sötétítése
- enyhe blur
- Home / Focus / Work
- Vio opcionális, eszközönként elrejthető
- widget S/M/L méretezés
- deviza 7 / 30 / 90 nap / 1 év
- Agenda
- névnap
- Supabase és helyi mentés

TELEPÍTÉS
A V6.1 teljes mappatartalmát töltsd fel a GitHub Pages repository gyökerébe.
Fontos: a backgrounds mappát is töltsd fel az öt .webp fájllal.

A meglévő V6 / V5 helyi adatok megtartására készült; a háttérbeállítás kulcsai
nem változtak.

--- Korábbi V6 megjegyzések ---
LAPIIT STARTPAGE - V6

FŐ VÁLTOZÁSOK
- Home / Focus / Work munkaterek; húzással átrendezhetők.
- A kezdő munkatér eszközönként külön állítható.
- A Vio alapból rejtett ezen az eszkozon; a beallitasokbol visszakapcsolhato.
- Az eszkozspecifikus munkater-sorrend, widgetmeret, Vio-lathatosag es hatter nem kerul a Supabase mentesbe.
- Nevnap megjelenites a datum alatt; napi egyszeri lekeres es helyi cache a nevinfo.hu API-rol.
- Minden fo widget S / M / L meret kozott leptetheto a kartya jobb felso reszen.
- Devizakartyak huzassal rendezhetok, kulon eltavolithatok, es bekerult az 1 eves grafikon.
- Uj Agenda widget: jegyzet/esemeny opcionalis datummal, Ma / Kozelgo / Osszes nezettel.
- Gyorslinkek valtozatlanul megmaradtak.
- Hatter: nincs animacio. 5 statikus preset (Aurora, Kodos hegyek, Csillagos eg, Sotet absztrakt, Hajnali taj) + sajat JPG/PNG/WebP.
- Sajat hatter max. 2,5 MB, kizarolag helyi tarhelyen marad.
- Hatter sotetites es enyhe blur allithato.
- V5 adatok automatikusan migralodnak a V6 allapotba.

TELEPITES GITHUB PAGESRE
A repository gyokereben csereld le: index.html, styles.css, app.js, icon.svg, README.txt.
A V6 tovabbra sem hasznal service workert vagy manifestet.

NÉVNAP
A kliens a https://www.nevinfo.hu/api/v1/ma vegpontot hasznalja. Ha a szolgaltatas nem erheto el, a dashboard ettol meg mukodik, csak "Névnap: —" jelenik meg.

