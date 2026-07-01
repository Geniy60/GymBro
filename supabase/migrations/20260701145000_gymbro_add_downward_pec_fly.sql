insert into public.gymbro_machines (id, name, note, sort_order)
values (
  'standard-downward-pec-fly',
  'Сведение рук вниз',
  'Downward pec fly. Рычажное сведение рук по дуге вниз к корпусу.',
  125
)
on conflict (id) do nothing;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group)
values
  ('standard-downward-pec-fly', 'chest'),
  ('standard-downward-pec-fly', 'shoulders')
on conflict (machine_id, muscle_group) do nothing;
