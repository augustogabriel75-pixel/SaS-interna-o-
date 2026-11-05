-- ════════════════════════════════════════════════════════════════════
--  VetClin Internação — estrutura do banco (Supabase)
--  Como usar: Supabase → SQL Editor → New query → cole TODO este arquivo → Run.
--  Pode ser executado mais de uma vez sem problema.
-- ════════════════════════════════════════════════════════════════════

-- ───────── Tabelas
create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nome text not null,
  papel text not null default 'auxiliar' check (papel in ('admin', 'veterinario', 'auxiliar')),
  funcao text not null default 'auxiliar',
  crmv text,
  especialidade text,
  telefone text,
  ativo boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists public.config (
  id int primary key default 1 check (id = 1),
  dados jsonb not null,
  versao int not null default 1,
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid
);

create table if not exists public.pacientes (
  id text primary key,
  dados jsonb not null,
  status text not null default 'internado',
  versao int not null default 1,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid
);
create index if not exists pacientes_status_idx on public.pacientes (status, atualizado_em desc);

create table if not exists public.atividades (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  usuario_id uuid,
  usuario_nome text,
  acao text not null,
  paciente_id text,
  paciente_nome text
);
create index if not exists atividades_data_idx on public.atividades (criado_em desc);

-- ───────── Funções auxiliares
create or replace function public.meu_papel() returns text
language sql stable security definer set search_path = public as $$
  select papel from public.perfis where id = auth.uid() and ativo
$$;

create or replace function public.usuario_ativo() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfis where id = auth.uid() and ativo)
$$;

-- Usada na tela de login (antes de entrar) para saber se é o primeiro acesso
create or replace function public.existe_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfis where papel = 'admin' and ativo)
$$;
grant execute on function public.existe_admin() to anon, authenticated;

-- Cria o perfil de cada nova conta. A PRIMEIRA conta vira administradora;
-- as demais nascem inativas até o administrador liberar.
create or replace function public.ao_criar_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  primeiro boolean;
begin
  select not exists (select 1 from public.perfis) into primeiro;
  insert into public.perfis (id, email, nome, papel, funcao, ativo)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'nome', ''), split_part(new.email, '@', 1)),
    case when primeiro then 'admin' else 'auxiliar' end,
    case when primeiro then 'veterinario' else 'auxiliar' end,
    primeiro
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users
  for each row execute function public.ao_criar_usuario();

-- Regras de gravação de pacientes (valem mesmo fora do aplicativo)
create or replace function public.pacientes_antes_gravar() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  p text := public.meu_papel();
  livres text[] := array['aplicacoes', 'registros', 'evolucoes', 'peso'];
begin
  if p is null then
    raise exception 'Usuário sem acesso liberado' using errcode = '42501';
  end if;
  if tg_op = 'INSERT' and p = 'auxiliar' then
    raise exception 'Auxiliar não pode internar pacientes' using errcode = '42501';
  end if;
  if tg_op = 'UPDATE' then
    if p = 'auxiliar' and (old.dados - livres) is distinct from (new.dados - livres) then
      raise exception 'Auxiliar só pode checar medicações e registrar monitoramento e anotações' using errcode = '42501';
    end if;
    new.versao := old.versao + 1;
    new.criado_em := old.criado_em;
  end if;
  new.status := coalesce(new.dados ->> 'status', new.status);
  new.atualizado_em := now();
  new.atualizado_por := auth.uid();
  return new;
end $$;

drop trigger if exists pacientes_antes_gravar on public.pacientes;
create trigger pacientes_antes_gravar before insert or update on public.pacientes
  for each row execute function public.pacientes_antes_gravar();

create or replace function public.config_antes_gravar() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then new.versao := old.versao + 1; end if;
  new.atualizado_em := now();
  new.atualizado_por := auth.uid();
  return new;
end $$;

drop trigger if exists config_antes_gravar on public.config;
create trigger config_antes_gravar before insert or update on public.config
  for each row execute function public.config_antes_gravar();

-- Histórico de atividades (quem fez o quê)
create or replace function public.registrar_atividade() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  acao text;
  len_old int;
begin
  if tg_op = 'INSERT' then
    acao := 'internou o paciente';
  elsif old.status is distinct from new.status then
    acao := case new.status when 'alta' then 'deu alta' when 'obito' then 'registrou óbito'
      when 'transferido' then 'registrou transferência' else 'reabriu a internação' end;
  elsif old.dados -> 'prescricoes' is distinct from new.dados -> 'prescricoes' then
    acao := 'alterou a prescrição';
  elsif jsonb_array_length(coalesce(new.dados -> 'aplicacoes', '[]')) > jsonb_array_length(coalesce(old.dados -> 'aplicacoes', '[]')) then
    acao := 'checou medicação';
  elsif old.dados -> 'aplicacoes' is distinct from new.dados -> 'aplicacoes' then
    acao := 'corrigiu checagem de medicação';
  elsif old.dados -> 'registros' is distinct from new.dados -> 'registros' then
    acao := 'registrou monitoramento';
  elsif old.dados -> 'fluidos' is distinct from new.dados -> 'fluidos' then
    acao := 'alterou a fluidoterapia';
  elsif old.dados -> 'evolucoes' is distinct from new.dados -> 'evolucoes' then
    acao := 'registrou evolução';
  elsif old.dados -> 'boletins' is distinct from new.dados -> 'boletins' then
    acao := 'emitiu boletim';
  else
    acao := 'atualizou dados';
  end if;
  insert into public.atividades (usuario_id, usuario_nome, acao, paciente_id, paciente_nome)
  values (auth.uid(), (select nome from public.perfis where id = auth.uid()), acao, new.id, new.dados ->> 'nome');
  return null;
end $$;

drop trigger if exists registrar_atividade on public.pacientes;
create trigger registrar_atividade after insert or update on public.pacientes
  for each row execute function public.registrar_atividade();

-- ───────── Segurança por linha (RLS)
alter table public.perfis enable row level security;
alter table public.config enable row level security;
alter table public.pacientes enable row level security;
alter table public.atividades enable row level security;

drop policy if exists perfis_ler on public.perfis;
create policy perfis_ler on public.perfis for select to authenticated
  using (public.usuario_ativo() or id = auth.uid());
drop policy if exists perfis_admin_editar on public.perfis;
create policy perfis_admin_editar on public.perfis for update to authenticated
  using (public.meu_papel() = 'admin') with check (public.meu_papel() = 'admin');
drop policy if exists perfis_admin_excluir on public.perfis;
create policy perfis_admin_excluir on public.perfis for delete to authenticated
  using (public.meu_papel() = 'admin' and id <> auth.uid());

drop policy if exists config_ler on public.config;
create policy config_ler on public.config for select to authenticated using (public.usuario_ativo());
drop policy if exists config_admin_inserir on public.config;
create policy config_admin_inserir on public.config for insert to authenticated with check (public.meu_papel() = 'admin');
drop policy if exists config_admin_editar on public.config;
create policy config_admin_editar on public.config for update to authenticated
  using (public.meu_papel() = 'admin') with check (public.meu_papel() = 'admin');

drop policy if exists pacientes_ler on public.pacientes;
create policy pacientes_ler on public.pacientes for select to authenticated using (public.usuario_ativo());
drop policy if exists pacientes_inserir on public.pacientes;
create policy pacientes_inserir on public.pacientes for insert to authenticated
  with check (public.meu_papel() in ('admin', 'veterinario'));
drop policy if exists pacientes_editar on public.pacientes;
create policy pacientes_editar on public.pacientes for update to authenticated
  using (public.usuario_ativo()) with check (public.usuario_ativo());
drop policy if exists pacientes_excluir on public.pacientes;
create policy pacientes_excluir on public.pacientes for delete to authenticated using (public.meu_papel() = 'admin');

drop policy if exists atividades_ler on public.atividades;
create policy atividades_ler on public.atividades for select to authenticated using (public.meu_papel() = 'admin');

-- ───────── Tempo real (atualiza as telas de todos automaticamente)
do $$
begin
  begin alter publication supabase_realtime add table public.pacientes; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.config; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.perfis; exception when duplicate_object then null; end;
end $$;
