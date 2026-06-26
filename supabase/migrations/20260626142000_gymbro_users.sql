create table if not exists public.gymbro_users (
  id text primary key,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gymbro_users_name_unique unique (name)
);

drop trigger if exists gymbro_users_set_updated_at on public.gymbro_users;
create trigger gymbro_users_set_updated_at
before update on public.gymbro_users
for each row execute function public.set_updated_at();

insert into public.gymbro_users (id, name, sort_order) values
  ('gymbro-user-zhenya', 'Женя', 10),
  ('gymbro-user-nastya', 'Настя', 20)
on conflict (id) do update set
  name = excluded.name,
  sort_order = excluded.sort_order;

alter table public.gymbro_workouts
  add column if not exists user_id text;

update public.gymbro_workouts
set user_id = 'gymbro-user-zhenya'
where user_id is null;

alter table public.gymbro_workouts
  alter column user_id set not null;

alter table public.gymbro_workouts
  drop constraint if exists gymbro_workouts_user_id_fkey;

alter table public.gymbro_workouts
  add constraint gymbro_workouts_user_id_fkey
  foreign key (user_id) references public.gymbro_users(id) on delete restrict;

create index if not exists gymbro_workouts_user_id_started_at_idx
  on public.gymbro_workouts(user_id, started_at desc);
