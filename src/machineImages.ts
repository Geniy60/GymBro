import type { ImageSourcePropType } from 'react-native';

const machineImagesById: Partial<Record<string, ImageSourcePropType>> = {
  'standard-assisted-pull-up-dip': require('../assets/machines/assisted-pull-up-dip.png'),
  'standard-back-extension': require('../assets/machines/back-extension.png'),
  'standard-barbell-hip-thrust': require('../assets/machines/barbell-hip-thrust.png'),
  'standard-barbell-romanian-deadlift': require('../assets/machines/barbell-romanian-deadlift.png'),
  'standard-bent-arm-pec-deck': require('../assets/machines/bent-arm-pec-deck.png'),
  'standard-biceps-curl': require('../assets/machines/biceps-curl.png'),
  'standard-calf-raise': require('../assets/machines/calf-raise.png'),
  'standard-cable-triceps-pushdown': require('../assets/machines/cable-triceps-pushdown.png'),
  'standard-chest-press': require('../assets/machines/chest-press.png'),
  'standard-dumbbell-biceps-curl': require('../assets/machines/dumbbell-biceps-curl.png'),
  'standard-glute-kickback': require('../assets/machines/glute-kickback.png'),
  'standard-hip-abduction': require('../assets/machines/hip-abduction.png'),
  'standard-hip-adduction': require('../assets/machines/hip-adduction.png'),
  'standard-incline-chest-press': require('../assets/machines/incline-chest-press.png'),
  'standard-lat-pulldown': require('../assets/machines/lat-pulldown.png'),
  'standard-lateral-raise': require('../assets/machines/lateral-raise.png'),
  'standard-leg-extension': require('../assets/machines/leg-extension.png'),
  'standard-leg-press': require('../assets/machines/leg-press.png'),
  'standard-lying-leg-curl': require('../assets/machines/lying-leg-curl.png'),
  'standard-pec-deck': require('../assets/machines/pec-deck.png'),
  'standard-seated-leg-curl': require('../assets/machines/seated-leg-curl.png'),
  'standard-seated-overhead-triceps-extension': require('../assets/machines/seated-overhead-triceps-extension.png'),
  'standard-seated-row': require('../assets/machines/seated-row.png'),
  'standard-seated-triceps-press': require('../assets/machines/seated-triceps-press.png'),
};

export function getMachineImage(machineId: string): ImageSourcePropType | undefined {
  return machineImagesById[machineId];
}
