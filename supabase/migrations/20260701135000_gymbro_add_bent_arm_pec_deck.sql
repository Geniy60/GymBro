insert into public.gymbro_machines (id, name, note, sort_order)
values (
  'standard-bent-arm-pec-deck',
  'Сведение рук с согнутыми локтями',
  'Bent-arm pec deck. Сведение рук на тренажере с упором предплечьями в вертикальные подушки.',
  120
)
on conflict (id) do nothing;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group)
values
  ('standard-bent-arm-pec-deck', 'chest'),
  ('standard-bent-arm-pec-deck', 'shoulders')
on conflict (machine_id, muscle_group) do nothing;
