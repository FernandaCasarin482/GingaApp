-- Criação da tabela de Perfis do GINGA+
create table public.profiles (
  id uuid references auth.users not null,
  apelido text,
  personagem text default 'IMG/BOI DANÇANDO.png',
  quadrilha_progress int default 1,
  hiphop_progress int default 1,
  gaucha_progress int default 1,
  afro_progress int default 1,
  achievements_unlocked jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()),

  primary key (id)
);

-- Ativar Row Level Security (Segurança)
alter table public.profiles enable row level security;

-- Política: Usuários podem ver o próprio perfil
create policy "Usuários podem ver seu próprio perfil."
  on profiles for select
  using ( auth.uid() = id );

-- Política: Usuários podem inserir seu próprio perfil
create policy "Usuários podem inserir seu próprio perfil."
  on profiles for insert
  with check ( auth.uid() = id );

-- Política: Usuários podem atualizar seu próprio perfil
create policy "Usuários podem atualizar seu próprio perfil."
  on profiles for update
  using ( auth.uid() = id );

-- Trigger para criar o perfil automaticamente quando o usuário se cadastrar (opcional mas recomendado)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, apelido)
  values (new.id, new.raw_user_meta_data ->> 'apelido');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
