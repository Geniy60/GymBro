insert into public.gymbro_machines (id, name, note, sort_order)
values (
  'standard-standing-calf-raise',
  'Подъем на икры стоя',
  'Standing calf raise machine. Подъем на носки стоя с упором в наклонную платформу.',
  75
)
on conflict (id) do update set
  name = excluded.name,
  note = excluded.note,
  sort_order = excluded.sort_order;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group)
values
  ('standard-standing-calf-raise', 'calves')
on conflict (machine_id, muscle_group) do nothing;
