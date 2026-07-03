insert into public.gymbro_machines (id, name, note, sort_order, tracking_type)
values (
  'standard-stair-climber',
  'Лестница',
  'Stair climber. Кардио на лестнице с учетом времени, дистанции, высоты и скорости.',
  17,
  'cardio'
)
on conflict (id) do update set
  name = excluded.name,
  note = excluded.note,
  sort_order = excluded.sort_order,
  tracking_type = excluded.tracking_type;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group) values
  ('standard-stair-climber', 'glutes'),
  ('standard-stair-climber', 'quads'),
  ('standard-stair-climber', 'hamstrings'),
  ('standard-stair-climber', 'calves')
on conflict (machine_id, muscle_group) do nothing;
