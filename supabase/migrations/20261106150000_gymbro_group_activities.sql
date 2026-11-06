alter table public.gymbro_machines
  drop constraint if exists gymbro_machines_tracking_type_check;

alter table public.gymbro_machines
  add constraint gymbro_machines_tracking_type_check
  check (tracking_type in ('strength', 'cardio', 'group'));

alter table public.gymbro_workout_exercises
  drop constraint if exists gymbro_workout_exercises_tracking_type_check;

alter table public.gymbro_workout_exercises
  add constraint gymbro_workout_exercises_tracking_type_check
  check (tracking_type in ('strength', 'cardio', 'group'));
