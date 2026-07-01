insert into public.gymbro_machines (id, name, note, sort_order)
values (
  'standard-dumbbell-lunges',
  'Выпады с гантелями',
  'Dumbbell lunges. Выпад вперед с гантелями в руках по бокам.',
  89
)
on conflict (id) do nothing;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group)
values
  ('standard-dumbbell-lunges', 'quads'),
  ('standard-dumbbell-lunges', 'glutes'),
  ('standard-dumbbell-lunges', 'hamstrings')
on conflict (machine_id, muscle_group) do nothing;
