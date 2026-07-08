import { StyleSheet, View } from 'react-native';

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
            <View style={styles.skeletonAccent} />
            <View style={styles.skeletonTextBlock}>
              <View
                style={[
                  styles.skeletonTitle,
                  index % 2 === 1 && styles.shortSkeletonTitle,
                ]}
              />
              <View
                style={[
                  styles.skeletonMeta,
                  index % 2 === 1 && styles.longSkeletonMeta,
                ]}
              />
            </View>
            <View style={styles.skeletonAction} />
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
    alignItems: 'center',
    backgroundColor: '#FBFDFB',
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  skeletonAccent: {
    backgroundColor: '#EAF7F0',
    borderColor: '#D5EBDD',
    borderRadius: 7,
    borderWidth: 1,
    height: 42,
    width: 42,
  },
  skeletonTextBlock: {
    flex: 1,
    gap: 9,
  },
  skeletonTitle: {
    backgroundColor: '#E1E8EF',
    borderRadius: 6,
    height: 16,
    width: '68%',
  },
  shortSkeletonTitle: {
    width: '52%',
  },
  skeletonMeta: {
    backgroundColor: '#EEF2F6',
    borderRadius: 6,
    height: 12,
    width: '38%',
  },
  longSkeletonMeta: {
    width: '48%',
  },
  skeletonAction: {
    backgroundColor: '#F2F6F3',
    borderColor: '#DCE9E2',
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    width: 36,
  },
});
