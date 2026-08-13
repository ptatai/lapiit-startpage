LAPIIT STARTPAGE V5

FŐ ÚJDONSÁGOK
- 4 profil: Általános / Tanulás / Munka / Vio.
- A három normál profil külön teendőket, gyorslinkeket, widget-láthatóságot és widget-sorrendet tárol.
- A V4 helyi beállításait első induláskor az Általános profilba migrálja.
- Reszponzívabb dashboard: 1/2/3 deviza és változó linkmennyiség automatikusan kitölti a helyet.
- Teendők és gyorslinkek húzással rendezhetők.
- Teendők szerkeszthetők.
- Keresési prefixek: g, ddg, yt, gh, w.
- Kompakt és normál widgetméret.
- Javított Light téma külön kontrasztpalettával.

VIO
- Jóváhagyott YouTube-videók és jóváhagyott weboldalak.
- Szülő által megadható napi videólimit.
- A számláló a YouTube IFrame Player PLAYING állapota alatt fogy; pause-nál megáll.
- A felhasznált idő frissítés után is megmarad, napváltáskor automatikusan új keret indul.
- +5 perc mára és mai idő nullázása szülői opció.
- Szülői PIN nincs hardcode-olva: véletlen salt + SHA-256 hash tárolódik.
- A limit végén alvó kiskutya jelenik meg.
FONTOS: ez csak a Vio felületbe ágyazott videóidőt korlátozza. A külön megnyitott youtube.com oldalt nem tudja blokkolni.

HELYI MENTÉS
- Minden változás localStorage-ba mentődik.
- Legfeljebb 10 helyi pillanatkép.
- JSON export/import.
- „Utolsó helyi mentés” visszaállítás.

OPCIONÁLIS SUPABASE FELHŐMENTÉS
A GitHub repositoryban nincs Supabase jelszó vagy service_role kulcs. A Project URL-t, publishable/anon kulcsot és felhasználói adatokat a Beállításokban adod meg.

Supabase SQL Editorban futtasd:

create table if not exists public.startpage_backups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  device_id text,
  state jsonb not null
);

alter table public.startpage_backups enable row level security;

grant select, insert, delete on table public.startpage_backups to authenticated;

create policy "Users can read own backups"
on public.startpage_backups
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own backups"
on public.startpage_backups
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can delete own backups"
on public.startpage_backups
for delete
to authenticated
using ((select auth.uid()) = user_id);

Ezután:
1. Supabase projektből másold ki a Project URL-t.
2. Másold ki a publishable key-t vagy legacy anon key-t. SERVICE_ROLE KULCSOT NE HASZNÁLJ A BÖNGÉSZŐBEN.
3. Startpage → Beállítások → Automatikus felhőmentés.
4. Add meg az URL-t, kulcsot, e-mailt és jelszót.
5. Regisztráció; ha e-mail megerősítés aktív, erősítsd meg, majd lépj be.
6. Belépés után a változások automatikusan snapshotként mentődnek.
7. A V5 legfeljebb 20 felhő snapshotot tart meg.

GITHUB PAGES FRISSÍTÉS
A repository gyökerében cseréld le ezeket:
- index.html
- styles.css
- app.js
- manifest.webmanifest
- sw.js
- icon.svg
- README.txt

Commit után a Pages újraépül. Ha régi verzió látszik: Ctrl+Shift+R.
