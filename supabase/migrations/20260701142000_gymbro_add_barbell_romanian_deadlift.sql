insert into public.gymbro_machines (id, name, note, sort_order)
values (
  'standard-barbell-romanian-deadlift',
  'Румынская тяга',
  'Barbell Romanian deadlift. Наклон со штангой у ног, таз назад и слегка согнутые колени.',
  87
)
on conflict (id) do nothing;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group)
values
  ('standard-barbell-romanian-deadlift', 'hamstrings'),
  ('standard-barbell-romanian-deadlift', 'glutes'),
  ('standard-barbell-romanian-deadlift', 'lowerBack')
on conflict (machine_id, muscle_group) do nothing;
