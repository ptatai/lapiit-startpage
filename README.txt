LAPIIT STARTPAGE – V5.5 POLISH / TEST CANDIDATE

CÉL
Ez a verzió feature freeze előtti rendrakás. Új nagy funkció nincs benne:
a V5 funkcióit egyszerűbb, stabilabb és reszponzívabb alapra tettük.

MEGMARADT
- 4 profil: Általános / Tanulás / Munka / Vio
- profilonként külön gyorslinkek, teendők és widgetek
- időjárás és előrejelzés
- 1–3 deviza, 7/30/90 napos grafikon és kalkulátor
- keresőmotorok és keresési prefixek
- stopper / Pomodoro
- 5 választható animált háttér
- Vio videótár, szülői PIN és állítható napi YouTube-idő
- localStorage mentés
- JSON export/import
- opcionális Supabase felhőmentés

V5.3 CLEANUP
- A PWA és service worker kikerült.
  Nincs több külön cache-verziózás; normál oldalfrissítéskor az új GitHub Pages verzió töltődik.
- Az oldal az első V5.3 megnyitáskor megpróbálja törölni a régi startpage service workert és cache-t.
- A UI témák egyszerűsödtek: Dark és Light.
  Régi Forest/Aurora/Warm választás automatikusan Darkra áll át.
- A Light téma kontrasztja egységesítve lett.
- A dashboard flex-alapú adaptív elrendezést kapott.
  Ha widgeteket kapcsolsz ki, a megmaradó kártyák automatikusan kitöltik a sort.
- A devizák és gyorslinkek belső gridje is automatikusan igazodik a darabszámhoz.
  1 deviza = teljes szélesség, 2 deviza = 2 egyforma oszlop, 3 deviza = 3 egyforma oszlop, ha van hely.
- A helyi visszaállítási pillanatképek száma 5.
- A Supabase-ben az utolsó 5 felhős snapshot marad meg.
- A meglévő V5 helyi adatok és Supabase-beállítások kompatibilisek maradnak.

GITHUB PAGES FRISSÍTÉS
A repository gyökerében cseréld le:
- index.html
- styles.css
- app.js
- icon.svg
- README.txt

A korábbi verzióból ezt a két fájlt már törölheted a GitHub repositoryból:
- sw.js
- manifest.webmanifest

Ezután commit. A Pages automatikusan újrapublikál.

SUPABASE
A meglévő Supabase projektedet és SQL tábládat nem kell újra létrehozni.
A V5.3 ugyanazt a startpage_backups táblát használja.

TESZTIDŐSZAK
V5.3 után 1–2 hét feature freeze:
- új funkciót nem adunk hozzá;
- csak valódi használat közben előjövő hibákat vagy kényelmetlenségeket jegyzünk;
- a teszt végén ezekből döntjük el a következő verzió tartalmát.


V5.4 – DEVIZA ELRENDEZÉS
- A deviza widget külön méretezhető: Automatikus / Kicsi / Közepes / Teljes szélesség.
- Automatikus módban:
  - 1 deviza: kis widget, az időjárás mellé rendezhető.
  - 2 deviza: közepes widget, széles képernyőn az időjárás mellé is kerülhet.
  - 3 deviza: teljes szélességű devizablokk.
- A devizák számának módosításakor a méret azonnal újraszámolódik.
- Kisebb ablaknál a widget automatikusan teljes szélességre törik, így nem szorul össze.
- Ez legyen az 1–2 hetes tesztverzió; új funkciót ezután nem teszünk bele a teszt végéig.


V5.5 POLISH
- A Vio jóváhagyott YouTube-videói valódi YouTube-borítóképpel jelennek meg.
- Egy videókártyára kattintva ugyanaz a beágyazott YouTube-lejátszó vált át az új videóra.
- A lejátszót nem építi újra minden váltásnál; ha már létezik, loadVideoById váltást használ.
- Az aktív videó kártyája kiemelést kap.
- A napi Vio-idő továbbra is csak a tényleges PLAYING állapot alatt fogy.
- A felső óra/dátum, profilfülek, kereső és ikongombok háttéradaptív üvegpalettát kaptak.
- Mountains / Aurora / Stars / Rain / Waves külön finom színezetet kap.
- Light témánál a tartalmi kártyák világosak maradnak, de a háttéren lebegő felső UI sötét,
  kontrasztos üvegfelületet használ.
- A meglévő helyi adatok és Supabase-mentések kompatibilisek.

TESZT
Ez legyen az 1–2 hetes tesztverzió. A teszt alatt új funkció helyett csak a használat közben
előjövő hibákat és kényelmetlenségeket érdemes gyűjteni.
