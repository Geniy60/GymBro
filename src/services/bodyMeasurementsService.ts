import { supabase } from '../supabaseClient';
import type {
  BodyMeasurement,
  BodyMeasurementDraft,
} from '../types';

type BodyMeasurementRow = {
  abdomen_cm: number | null;
  chest_cm: number | null;
  hips_cm: number | null;
  id: string;
  measured_at: string;
  user_id: string;
  waist_cm: number | null;
  weight_kg: number | null;
};

export async function loadBodyMeasurements(
  userId: string,
): Promise<BodyMeasurement[]> {
  const { data, error } = await supabase
    .from('gymbro_body_measurements')
    .select(
      'id, user_id, measured_at, weight_kg, waist_cm, hips_cm, chest_cm, abdomen_cm',
    )
    .eq('user_id', userId)
    .order('measured_at', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as BodyMeasurementRow[]).map(mapBodyMeasurementRow);
}

export async function saveBodyMeasurement({
  draft,
  id,
  measuredAt,
  userId,
}: {
  draft: BodyMeasurementDraft;
  id: string;
  measuredAt: string;
  userId: string;
}): Promise<void> {
  const { error } = await supabase.from('gymbro_body_measurements').insert({
    abdomen_cm: parseOptionalMeasurement(draft.abdomenCm),
    chest_cm: parseOptionalMeasurement(draft.chestCm),
    hips_cm: parseOptionalMeasurement(draft.hipsCm),
    id,
    measured_at: measuredAt,
    user_id: userId,
    waist_cm: parseOptionalMeasurement(draft.waistCm),
    weight_kg: parseOptionalMeasurement(draft.weightKg),
  });

  if (error) {
    throw error;
  }
}

export async function updateBodyMeasurement({
  draft,
  id,
}: {
  draft: BodyMeasurementDraft;
  id: string;
}): Promise<void> {
  const { error } = await supabase
    .from('gymbro_body_measurements')
    .update({
      abdomen_cm: parseOptionalMeasurement(draft.abdomenCm),
      chest_cm: parseOptionalMeasurement(draft.chestCm),
      hips_cm: parseOptionalMeasurement(draft.hipsCm),
      waist_cm: parseOptionalMeasurement(draft.waistCm),
      weight_kg: parseOptionalMeasurement(draft.weightKg),
    })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function deleteBodyMeasurement(id: string): Promise<void> {
  const { error } = await supabase
    .from('gymbro_body_measurements')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export function hasBodyMeasurementValue(draft: BodyMeasurementDraft): boolean {
  return [
    draft.weightKg,
    draft.waistCm,
    draft.hipsCm,
    draft.chestCm,
    draft.abdomenCm,
  ].some(
    (value) => value.trim().length > 0,
  );
}

export function isValidBodyMeasurementDraft(
  draft: BodyMeasurementDraft,
): boolean {
  return [
    draft.weightKg,
    draft.waistCm,
    draft.hipsCm,
    draft.chestCm,
    draft.abdomenCm,
  ].every(
    isValidOptionalMeasurement,
  );
}

function mapBodyMeasurementRow(row: BodyMeasurementRow): BodyMeasurement {
  return {
    abdomenCm: row.abdomen_cm,
    chestCm: row.chest_cm,
    hipsCm: row.hips_cm,
    id: row.id,
    measuredAt: row.measured_at,
    userId: row.user_id,
    waistCm: row.waist_cm,
    weightKg: row.weight_kg,
  };
}

function parseOptionalMeasurement(value: string): number | null {
  const normalizedValue = value.trim().replace(',', '.');

  if (normalizedValue.length === 0) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function isValidOptionalMeasurement(value: string): boolean {
  const normalizedValue = value.trim().replace(',', '.');

  if (normalizedValue.length === 0) {
    return true;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) && parsedValue >= 0;
}
