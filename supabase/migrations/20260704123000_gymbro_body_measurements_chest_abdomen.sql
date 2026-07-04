alter table public.gymbro_body_measurements
  add column if not exists chest_cm numeric,
  add column if not exists abdomen_cm numeric;

alter table public.gymbro_body_measurements
  drop constraint if exists gymbro_body_measurements_has_value_check;

alter table public.gymbro_body_measurements
  add constraint gymbro_body_measurements_has_value_check check (
    weight_kg is not null or
    waist_cm is not null or
    hips_cm is not null or
    chest_cm is not null or
    abdomen_cm is not null
  );

alter table public.gymbro_body_measurements
  drop constraint if exists gymbro_body_measurements_non_negative_check;

alter table public.gymbro_body_measurements
  add constraint gymbro_body_measurements_non_negative_check check (
    (weight_kg is null or weight_kg >= 0) and
    (waist_cm is null or waist_cm >= 0) and
    (hips_cm is null or hips_cm >= 0) and
    (chest_cm is null or chest_cm >= 0) and
    (abdomen_cm is null or abdomen_cm >= 0)
  );
