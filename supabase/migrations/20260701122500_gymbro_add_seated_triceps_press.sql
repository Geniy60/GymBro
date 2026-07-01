insert into public.gymbro_machines (id, name, note, sort_order)
values (
  'standard-seated-triceps-press',
  'Жим на трицепс сидя',
  'Seated triceps press. Жим рукоятей вниз сидя, как машинные отжимания на трицепс.',
  207
)
on conflict (id) do nothing;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group)
values
  ('standard-seated-triceps-press', 'triceps'),
  ('standard-seated-triceps-press', 'chest'),
  ('standard-seated-triceps-press', 'shoulders')
on conflict (machine_id, muscle_group) do nothing;
