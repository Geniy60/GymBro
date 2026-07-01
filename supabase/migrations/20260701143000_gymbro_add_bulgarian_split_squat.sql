insert into public.gymbro_machines (id, name, note, sort_order)
values (
  'standard-bulgarian-split-squat',
  'Болгарские приседания',
  'Bulgarian split squat. Выпад с задней стопой на скамье.',
  88
)
on conflict (id) do nothing;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group)
values
  ('standard-bulgarian-split-squat', 'quads'),
  ('standard-bulgarian-split-squat', 'glutes'),
  ('standard-bulgarian-split-squat', 'hamstrings')
on conflict (machine_id, muscle_group) do nothing;
