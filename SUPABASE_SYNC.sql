-- Lapiit Startpage V6.2 – one-row cloud sync
-- Futtasd egyszer a Supabase SQL Editorban.
-- A korábbi 5 snapshotból felhasználónként csak a legfrissebbet tartja meg.

delete from public.startpage_backups
where id in (
  select id
  from (
    select
      id,
      row_number() over (
        partition by user_id
        order by created_at desc, id desc
      ) as rn
    from public.startpage_backups
  ) x
  where rn > 1
);

create unique index if not exists startpage_backups_user_id_unique
on public.startpage_backups (user_id);

grant select, insert, update, delete
on table public.startpage_backups
to authenticated;

drop policy if exists "Users can update own state" on public.startpage_backups;

create policy "Users can update own state"
on public.startpage_backups
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
