import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { getMachineImage } from '../machineImages';
import { strings } from '../strings';
import { colors } from '../theme/colors';

type MachineImageFrameProps = {
  machineId: string;
  style?: StyleProp<ViewStyle>;
};

export function MachineImageFrame({ machineId, style }: MachineImageFrameProps) {
  const machineImage = getMachineImage(machineId);

  return (
    <View style={[styles.frame, style]}>
      {machineImage === undefined ? (
        <View style={styles.placeholder}>
          <Ionicons name="image-outline" size={22} color={colors.muted} />
          <Text style={styles.placeholderText}>{strings.machineImages.noImage}</Text>
        </View>
      ) : (
        <Image source={machineImage} style={styles.image} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    resizeMode: 'contain',
    width: '100%',
  },
  placeholder: {
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  placeholderText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});
