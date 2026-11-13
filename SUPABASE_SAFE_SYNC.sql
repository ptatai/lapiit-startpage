-- V6.4 safe sync migration
alter table public.startpage_backups
add column if not exists revision bigint not null default 0;

update public.startpage_backups set revision = 1 where revision = 0;

create unique index if not exists startpage_backups_user_id_unique
on public.startpage_backups (user_id);

grant select, insert, update on table public.startpage_backups to authenticated;
revoke all on table public.startpage_backups from anon;

alter table public.startpage_backups enable row level security;

drop policy if exists "Users can read own backups" on public.startpage_backups;
drop policy if exists "Users can insert own backups" on public.startpage_backups;
drop policy if exists "Users can delete own backups" on public.startpage_backups;
drop policy if exists "Users can update own state" on public.startpage_backups;
drop policy if exists "Users can read own state" on public.startpage_backups;
drop policy if exists "Users can insert own state" on public.startpage_backups;

create policy "Users can read own state"
on public.startpage_backups for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own state"
on public.startpage_backups for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own state"
on public.startpage_backups for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
