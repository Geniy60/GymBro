import type { ImageSourcePropType } from 'react-native';

const machineImagesById: Partial<Record<string, ImageSourcePropType>> = {
  'standard-assisted-pull-up-dip': require('../assets/machines/assisted-pull-up-dip.png'),
};

export function getMachineImage(machineId: string): ImageSourcePropType | undefined {
  return machineImagesById[machineId];
}
