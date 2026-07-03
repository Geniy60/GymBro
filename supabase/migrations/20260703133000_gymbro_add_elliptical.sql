insert into public.gymbro_machines (id, name, note, sort_order, tracking_type)
values (
  'standard-elliptical',
  'Эллиптический ход',
  'Elliptical trainer. Кардио на эллипсоиде с учетом времени, дистанции, высоты и скорости.',
  16,
  'cardio'
)
on conflict (id) do update set
  name = excluded.name,
  note = excluded.note,
  sort_order = excluded.sort_order,
  tracking_type = excluded.tracking_type;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group) values
  ('standard-elliptical', 'glutes'),
  ('standard-elliptical', 'quads'),
  ('standard-elliptical', 'hamstrings'),
  ('standard-elliptical', 'calves')
on conflict (machine_id, muscle_group) do nothing;
