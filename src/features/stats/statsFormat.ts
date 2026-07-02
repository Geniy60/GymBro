export function formatWeight(weightKg: number): string {
  return Number.isInteger(weightKg)
    ? String(weightKg)
    : weightKg.toFixed(2).replace(/\.?0+$/, '');
}
