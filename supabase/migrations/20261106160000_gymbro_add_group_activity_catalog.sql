insert into public.gymbro_machines (id, name, note, sort_order, tracking_type)
values
  ('standard-pilates', 'Пилатес', '', 200, 'group'),
  ('standard-mobility', 'Мобилити', '', 210, 'group'),
  ('standard-healthy-spine', 'Здоровый позвоночник', '', 220, 'group')
on conflict (id) do update set
  name = excluded.name,
  note = excluded.note,
  sort_order = excluded.sort_order,
  tracking_type = excluded.tracking_type;
