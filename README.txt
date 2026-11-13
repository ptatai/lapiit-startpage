LAPIIT STARTPAGE – V6.4 SAFE SYNC

- localStorage: minden módosítás azonnal
- Supabase: 1 közös felhőállapot
- revision-alapú ütközésvédelem
- régi böngésző nem írhat felül frissebb felhőállapotot
- felső felhőikon: ☁✓ / ☁↻ / ☁!
- Focus / Work / Vio böngészőnként opcionális

Egyszer futtasd le a SUPABASE_SAFE_SYNC.sql fájlt a Supabase SQL Editorban.

Példa:
A gép rev 17 -> módosítás -> felhő rev 18.
B gép rev 17 -> feltöltés blokkolva.
B gépen ☁↻ -> lehúzza rev 18-at -> utána biztonságosan szerkeszthető.
