insert into public.gymbro_machines (id, name, note, sort_order)
values (
  'standard-barbell-hip-thrust',
  'Ягодичный мост со штангой',
  'Barbell hip thrust. Ягодичный мост со штангой на тазу и плечами на скамье.',
  85
)
on conflict (id) do nothing;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group)
values
  ('standard-barbell-hip-thrust', 'glutes'),
  ('standard-barbell-hip-thrust', 'hamstrings'),
  ('standard-barbell-hip-thrust', 'quads')
on conflict (machine_id, muscle_group) do nothing;
