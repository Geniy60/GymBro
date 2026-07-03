insert into public.gymbro_machines (id, name, note, sort_order)
values (
  'standard-curtsy-reverse-lunge',
  'Косые выпады назад',
  'Curtsy reverse lunge. Выпад назад по диагонали с заведением ноги крест-накрест за опорную.',
  89
)
on conflict (id) do update set
  name = excluded.name,
  note = excluded.note,
  sort_order = excluded.sort_order,
  tracking_type = 'strength';

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group)
values
  ('standard-curtsy-reverse-lunge', 'quads'),
  ('standard-curtsy-reverse-lunge', 'glutes'),
  ('standard-curtsy-reverse-lunge', 'hamstrings')
on conflict (machine_id, muscle_group) do nothing;
