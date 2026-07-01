create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.gymbro_machines (
  id text primary key,
  name text not null,
  note text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gymbro_machines_name_unique unique (name)
);

create table if not exists public.gymbro_machine_muscle_groups (
  machine_id text not null references public.gymbro_machines(id) on delete cascade,
  muscle_group text not null,
  primary key (machine_id, muscle_group),
  constraint gymbro_machine_muscle_groups_group_check check (
    muscle_group in (
      'chest',
      'back',
      'shoulders',
      'biceps',
      'triceps',
      'forearms',
      'abs',
      'glutes',
      'quads',
      'hamstrings',
      'calves',
      'traps',
      'adductors',
      'abductors',
      'lowerBack'
    )
  )
);

create table if not exists public.gymbro_workouts (
  id text primary key,
  name text not null,
  started_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gymbro_workout_exercises (
  id text primary key,
  workout_id text not null references public.gymbro_workouts(id) on delete cascade,
  machine_id text references public.gymbro_machines(id) on delete set null,
  machine_name_snapshot text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gymbro_workout_sets (
  id text primary key,
  exercise_id text not null references public.gymbro_workout_exercises(id) on delete cascade,
  weight_kg text not null default '',
  reps text not null default '',
  note text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gymbro_machine_muscle_groups_machine_id_idx
  on public.gymbro_machine_muscle_groups(machine_id);

create index if not exists gymbro_workouts_started_at_idx
  on public.gymbro_workouts(started_at desc);

create index if not exists gymbro_workout_exercises_workout_id_idx
  on public.gymbro_workout_exercises(workout_id);

create index if not exists gymbro_workout_sets_exercise_id_idx
  on public.gymbro_workout_sets(exercise_id);

drop trigger if exists gymbro_machines_set_updated_at on public.gymbro_machines;
create trigger gymbro_machines_set_updated_at
before update on public.gymbro_machines
for each row execute function public.set_updated_at();

drop trigger if exists gymbro_workouts_set_updated_at on public.gymbro_workouts;
create trigger gymbro_workouts_set_updated_at
before update on public.gymbro_workouts
for each row execute function public.set_updated_at();

drop trigger if exists gymbro_workout_exercises_set_updated_at on public.gymbro_workout_exercises;
create trigger gymbro_workout_exercises_set_updated_at
before update on public.gymbro_workout_exercises
for each row execute function public.set_updated_at();

drop trigger if exists gymbro_workout_sets_set_updated_at on public.gymbro_workout_sets;
create trigger gymbro_workout_sets_set_updated_at
before update on public.gymbro_workout_sets
for each row execute function public.set_updated_at();

insert into public.gymbro_machines (id, name, note, sort_order) values
  ('standard-leg-press', 'Жим ногами', 'Leg press. Платформа для жима ногами сидя или под углом.', 10),
  ('standard-leg-extension', 'Разгибание ног', 'Leg extension. Валик перед голенями, разгибание коленей сидя.', 20),
  ('standard-seated-leg-curl', 'Сгибание ног сидя', 'Seated leg curl. Сгибание коленей сидя, валик у голеней.', 30),
  ('standard-lying-leg-curl', 'Сгибание ног лежа', 'Lying leg curl. Сгибание коленей лежа лицом вниз.', 40),
  ('standard-hip-adduction', 'Сведение ног', 'Adductor. Ноги сводятся внутрь.', 50),
  ('standard-hip-abduction', 'Разведение ног', 'Abductor. Ноги разводятся наружу.', 60),
  ('standard-calf-raise', 'Подъем на икры', 'Calf raise. Подъем на носки сидя или стоя.', 70),
  ('standard-glute-kickback', 'Отведение ноги назад', 'Glute kickback. Нога уходит назад, акцент на ягодицы.', 80),
  ('standard-chest-press', 'Жим от груди', 'Chest press. Жим рукоятей вперед сидя.', 90),
  ('standard-incline-chest-press', 'Жим от груди под наклоном', 'Incline chest press. Жим рукоятей вверх-вперед полулежа на наклонной спинке.', 100),
  ('standard-pec-deck', 'Сведение рук / бабочка', 'Pec deck или butterfly. Сведение рук перед грудью.', 110),
  ('standard-bent-arm-pec-deck', 'Сведение рук с согнутыми локтями', 'Bent-arm pec deck. Сведение рук на тренажере с упором предплечьями в вертикальные подушки.', 120),
  ('standard-lateral-raise', 'Разведение рук в стороны', 'Lateral raise. Подъем рук в стороны, акцент на средние дельты.', 130),
  ('standard-lat-pulldown', 'Вертикальная тяга', 'Lat pulldown. Тяга рукояти сверху к груди.', 140),
  ('standard-seated-row', 'Горизонтальная тяга', 'Seated row. Тяга рукояти к животу сидя.', 150),
  ('standard-back-extension', 'Гиперэкстензия', 'Back extension. Разгибание корпуса, акцент на поясницу и ягодицы.', 180),
  ('standard-biceps-curl', 'Сгибание рук на бицепс', 'Biceps curl machine. Сгибание локтей на тренажере.', 190),
  ('standard-dumbbell-biceps-curl', 'Сгибание рук с гантелями', 'Dumbbell biceps curl. Сгибание рук с гантелями стоя.', 200),
  ('standard-cable-triceps-pushdown', 'Разгибание рук на блоке', 'Cable triceps pushdown. Разгибание рук вниз на верхнем блоке с канатной рукоятью.', 205),
  ('standard-seated-triceps-press', 'Жим на трицепс сидя', 'Seated triceps press. Жим рукоятей вниз сидя, как машинные отжимания на трицепс.', 207),
  ('standard-seated-overhead-triceps-extension', 'Разгибание рук из-за головы сидя', 'Seated overhead triceps extension. Разгибание рук из-за головы на тренажере сидя.', 208),
  ('standard-assisted-pull-up-dip', 'Гравитрон', 'Assisted pull-up / dip. Подтягивания или отжимания с противовесом.', 210)
on conflict (id) do nothing;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group) values
  ('standard-leg-press', 'quads'),
  ('standard-leg-press', 'glutes'),
  ('standard-leg-press', 'hamstrings'),
  ('standard-leg-extension', 'quads'),
  ('standard-seated-leg-curl', 'hamstrings'),
  ('standard-lying-leg-curl', 'hamstrings'),
  ('standard-hip-adduction', 'adductors'),
  ('standard-hip-abduction', 'abductors'),
  ('standard-hip-abduction', 'glutes'),
  ('standard-calf-raise', 'calves'),
  ('standard-glute-kickback', 'glutes'),
  ('standard-glute-kickback', 'hamstrings'),
  ('standard-chest-press', 'chest'),
  ('standard-chest-press', 'triceps'),
  ('standard-chest-press', 'shoulders'),
  ('standard-incline-chest-press', 'chest'),
  ('standard-incline-chest-press', 'shoulders'),
  ('standard-incline-chest-press', 'triceps'),
  ('standard-pec-deck', 'chest'),
  ('standard-bent-arm-pec-deck', 'chest'),
  ('standard-bent-arm-pec-deck', 'shoulders'),
  ('standard-lateral-raise', 'shoulders'),
  ('standard-lat-pulldown', 'back'),
  ('standard-lat-pulldown', 'biceps'),
  ('standard-seated-row', 'back'),
  ('standard-seated-row', 'biceps'),
  ('standard-back-extension', 'lowerBack'),
  ('standard-back-extension', 'glutes'),
  ('standard-back-extension', 'hamstrings'),
  ('standard-biceps-curl', 'biceps'),
  ('standard-biceps-curl', 'forearms'),
  ('standard-dumbbell-biceps-curl', 'biceps'),
  ('standard-dumbbell-biceps-curl', 'forearms'),
  ('standard-cable-triceps-pushdown', 'triceps'),
  ('standard-cable-triceps-pushdown', 'forearms'),
  ('standard-seated-triceps-press', 'triceps'),
  ('standard-seated-triceps-press', 'chest'),
  ('standard-seated-triceps-press', 'shoulders'),
  ('standard-seated-overhead-triceps-extension', 'triceps'),
  ('standard-seated-overhead-triceps-extension', 'forearms'),
  ('standard-assisted-pull-up-dip', 'back'),
  ('standard-assisted-pull-up-dip', 'biceps'),
  ('standard-assisted-pull-up-dip', 'chest'),
  ('standard-assisted-pull-up-dip', 'triceps')
on conflict (machine_id, muscle_group) do nothing;
