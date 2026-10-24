-- Mealer PWA — schéma Supabase, pour un projet NEUF.
-- À exécuter une seule fois : Supabase › SQL Editor › New query › coller › Run.
--
-- Modèle : un seul espace partagé. Chaque compte créé par l'administrateur
-- (Authentication › Users › Add user, inscriptions fermées) voit et modifie les mêmes données.
-- Aucune autre personne ne peut lire ou écrire quoi que ce soit, clé publique ou non.
--
-- Toutes les données sont des lignes clé/valeur dans `entries` (une recette, un créneau du
-- planning, un article coché…). Rien n'est jamais supprimé physiquement : une suppression
-- passe `deleted` à true, et chaque ancienne valeur est gardée dans `entries_history`.

create table public.entries (
  kind text not null constraint entries_kind_check
    check (kind in ('recipe', 'hidden', 'slot', 'checked', 'removed', 'item', 'ingredient')),
  key text not null check (char_length(key) between 1 and 200),
  -- Limite de taille : empêche de remplir la base avec une seule valeur énorme.
  value jsonb check (pg_column_size(value) <= 50000),
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  primary key (kind, key)
);

-- Date et auteur de chaque écriture, posés par la base (impossible à falsifier depuis l'app).
create function public.stamp_entry() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end $$;

create trigger entries_stamp before insert or update on public.entries
for each row execute function public.stamp_entry();

-- ── Accès : comptes permanents uniquement ──
-- Les connexions anonymes sont désactivées sur le projet ; la règle les refuse quand même,
-- au cas où elles seraient réactivées un jour.

create function public.is_member() returns boolean
language sql stable as $$
  select auth.uid() is not null and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
$$;

alter table public.entries enable row level security;

revoke all on public.entries from anon;
grant select, insert, update on public.entries to authenticated;

create policy "members read" on public.entries
  for select to authenticated using (public.is_member());

create policy "members add" on public.entries
  for insert to authenticated with check (public.is_member());

create policy "members update" on public.entries
  for update to authenticated using (public.is_member()) with check (public.is_member());

-- Pas de règle « delete » : aucune suppression définitive possible depuis l'app ou l'API.

-- ── Historique : chaque ancienne valeur est conservée ──
-- Invisible depuis l'app ; consultable dans Table Editor.

create table public.entries_history (
  id bigint generated always as identity primary key,
  kind text not null,
  key text not null,
  value jsonb,
  deleted boolean not null,
  changed_at timestamptz not null default now(),
  changed_by uuid
);

alter table public.entries_history enable row level security;
revoke all on public.entries_history from anon, authenticated;

create function public.keep_entry_history() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.entries_history (kind, key, value, deleted, changed_by)
  values (old.kind, old.key, old.value, old.deleted, auth.uid());
  return new;
end $$;

create trigger entries_history after update on public.entries
for each row
when (old.value is distinct from new.value or old.deleted is distinct from new.deleted)
execute function public.keep_entry_history();

-- ── Temps réel : les autres appareils reçoivent les changements en direct ──
-- (les mêmes règles d'accès s'appliquent aux abonnements)

alter publication supabase_realtime add table public.entries;
