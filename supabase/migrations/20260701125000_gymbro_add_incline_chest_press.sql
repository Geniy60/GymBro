insert into public.gymbro_machines (id, name, note, sort_order)
values (
  'standard-incline-chest-press',
  'Жим от груди под наклоном',
  'Incline chest press. Жим рукоятей вверх-вперед полулежа на наклонной спинке.',
  100
)
on conflict (id) do nothing;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group)
values
  ('standard-incline-chest-press', 'chest'),
  ('standard-incline-chest-press', 'shoulders'),
  ('standard-incline-chest-press', 'triceps')
on conflict (machine_id, muscle_group) do nothing;
