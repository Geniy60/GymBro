insert into public.gymbro_machines (id, name, note, sort_order)
values (
  'standard-dumbbell-biceps-curl',
  'Сгибание рук с гантелями',
  'Dumbbell biceps curl. Сгибание рук с гантелями стоя.',
  200
)
on conflict (id) do nothing;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group)
values
  ('standard-dumbbell-biceps-curl', 'biceps'),
  ('standard-dumbbell-biceps-curl', 'forearms')
on conflict (machine_id, muscle_group) do nothing;
