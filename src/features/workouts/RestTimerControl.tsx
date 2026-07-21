import { strings } from '../../strings';

export function formatRestTimerLabel(
  isActive: boolean,
  remainingSeconds: number,
): string {
  return isActive
    ? strings.restTimer.activeLabel(formatRemainingTime(remainingSeconds))
    : strings.restTimer.startLabel;
}

function formatRemainingTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
