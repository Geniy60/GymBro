insert into public.gymbro_machines (id, name, note, sort_order, tracking_type)
values (
  'standard-seated-horizontal-row',
  'Горизонтальная тяга сидя',
  'Chest-supported seated row. Горизонтальная тяга к корпусу сидя с упором грудью в подушку.',
  155,
  'strength'
)
on conflict (id) do update set
  name = excluded.name,
  note = excluded.note,
  sort_order = excluded.sort_order,
  tracking_type = excluded.tracking_type;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group)
values
  ('standard-seated-horizontal-row', 'back'),
  ('standard-seated-horizontal-row', 'biceps')
on conflict (machine_id, muscle_group) do nothing;
