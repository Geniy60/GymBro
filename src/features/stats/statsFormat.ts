export function formatWeight(weightKg: number): string {
  return Number.isInteger(weightKg)
    ? String(weightKg)
    : weightKg.toFixed(2).replace(/\.?0+$/, '');
}

export function formatCardioDistance(distanceKm: number | null): string {
  return formatOptionalNumber(distanceKm);
}

export function formatCardioDuration(durationSeconds: number | null): string {
  if (durationSeconds === null) {
    return '0';
  }

  return formatOptionalNumber(durationSeconds / 60);
}

export function formatCardioElevation(elevationMeters: number | null): string {
  return formatOptionalNumber(elevationMeters);
}

function formatOptionalNumber(value: number | null): string {
  if (value === null) {
    return '0';
  }

  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.?0+$/, '');
}
