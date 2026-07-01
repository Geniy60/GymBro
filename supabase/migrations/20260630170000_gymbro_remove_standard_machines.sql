delete from public.gymbro_machines
where id in (
  'standard-torso-rotation',
  'standard-machine-pullover',
  'standard-triceps-extension',
  'standard-high-row',
  'standard-abdominal-crunch'
);
