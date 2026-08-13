LAPIIT STARTPAGE – V5.4 TEST CANDIDATE

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
