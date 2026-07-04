create table if not exists public.gymbro_body_measurements (
  id text primary key,
  user_id text not null references public.gymbro_users(id) on delete cascade,
  measured_at timestamptz not null,
  weight_kg numeric,
  waist_cm numeric,
  hips_cm numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gymbro_body_measurements_has_value_check check (
    weight_kg is not null or waist_cm is not null or hips_cm is not null
  ),
  constraint gymbro_body_measurements_non_negative_check check (
    (weight_kg is null or weight_kg >= 0) and
    (waist_cm is null or waist_cm >= 0) and
    (hips_cm is null or hips_cm >= 0)
  )
);

create index if not exists gymbro_body_measurements_user_id_measured_at_idx
  on public.gymbro_body_measurements(user_id, measured_at desc);

drop trigger if exists gymbro_body_measurements_set_updated_at
  on public.gymbro_body_measurements;
create trigger gymbro_body_measurements_set_updated_at
before update on public.gymbro_body_measurements
for each row execute function public.set_updated_at();
