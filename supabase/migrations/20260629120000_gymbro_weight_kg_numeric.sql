alter table public.gymbro_workout_sets
  alter column weight_kg drop default;

alter table public.gymbro_workout_sets
  alter column weight_kg type numeric
  using case
    when trim(weight_kg) = '' then null
    when replace(trim(weight_kg), ',', '.') ~ '^-?[0-9]+(\.[0-9]+)?$'
      then replace(trim(weight_kg), ',', '.')::numeric
    else null
  end;

alter table public.gymbro_workout_sets
  alter column weight_kg drop not null;
