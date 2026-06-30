delete from public.gymbro_machines
where id in (
  'standard-incline-chest-press',
  'standard-torso-rotation',
  'standard-machine-pullover',
  'standard-triceps-extension',
  'standard-high-row',
  'standard-abdominal-crunch'
);
