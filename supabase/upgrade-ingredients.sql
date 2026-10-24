-- Mise à jour d'un projet créé avec une version précédente de schema.sql :
-- autorise les lignes « ingredient » (le référentiel d'ingrédients partagé).
-- À exécuter une fois, AVANT de déployer la version de l'app qui les utilise :
-- Supabase › SQL Editor › New query › coller › Run.

alter table public.entries drop constraint entries_kind_check;

alter table public.entries add constraint entries_kind_check
  check (kind in ('recipe', 'hidden', 'slot', 'checked', 'removed', 'item', 'ingredient'));
