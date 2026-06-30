import { StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';

type ListLoadingStateProps = {
  rowCount?: number;
};

export function ListLoadingState({
  rowCount = 4,
}: ListLoadingStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.rows}>
        {Array.from({ length: rowCount }, (_, index) => (
          <View key={index} style={styles.skeletonRow}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonMeta} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  rows: {
    gap: 10,
  },
  skeletonRow: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  skeletonTitle: {
    backgroundColor: '#E9EEF5',
    borderRadius: 6,
    height: 16,
    width: '58%',
  },
  skeletonMeta: {
    backgroundColor: '#F1F4F8',
    borderRadius: 6,
    height: 12,
    marginTop: 10,
    width: '36%',
  },
});
