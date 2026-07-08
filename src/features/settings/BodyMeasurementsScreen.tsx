import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Svg, {
  Circle,
  Line,
  Polyline,
  Text as SvgText,
} from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { showAppAlert } from '../../appAlert';
import { SecondaryScreenHeader } from '../../components/SecondaryScreenHeader';
import { createId } from '../../createId';
import { queryKeys } from '../../queryClient';
import {
  hasBodyMeasurementValue,
  isValidBodyMeasurementDraft,
  deleteBodyMeasurement,
  loadBodyMeasurements,
  saveBodyMeasurement,
  updateBodyMeasurement,
} from '../../services/bodyMeasurementsService';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type {
  BodyMeasurement,
  BodyMeasurementDraft,
  BodyMeasurementMetric,
} from '../../types';
import { useKeyboardBottomInset } from '../../useKeyboardBottomInset';

const EMPTY_DRAFT: BodyMeasurementDraft = {
  abdomenCm: '',
  chestCm: '',
  hipsCm: '',
  waistCm: '',
  weightKg: '',
};

const METRICS: BodyMeasurementMetric[] = [
  'weightKg',
  'waistCm',
  'hipsCm',
  'chestCm',
  'abdomenCm',
];

type BodyMeasurementsScreenProps = {
  backgroundColor: string;
  onBack: () => void;
  userId: string | null;
};

export function BodyMeasurementsScreen({
  backgroundColor,
  onBack,
  userId,
}: BodyMeasurementsScreenProps) {
  const [draft, setDraft] = useState<BodyMeasurementDraft>(EMPTY_DRAFT);
  const [selectedMetric, setSelectedMetric] =
    useState<BodyMeasurementMetric>('weightKg');
  const [editingMeasurement, setEditingMeasurement] =
    useState<BodyMeasurement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const keyboardBottomInset = useKeyboardBottomInset();
  const queryClient = useQueryClient();
  const measurementsQuery = useQuery({
    enabled: userId !== null,
    queryFn: () => loadBodyMeasurements(userId ?? ''),
    queryKey: queryKeys.bodyMeasurements(userId ?? 'none'),
  });
  const measurements = measurementsQuery.data ?? [];
  const reversedMeasurements = useMemo(
    () => measurements.slice().reverse(),
    [measurements],
  );

  async function saveMeasurement() {
    if (userId === null || isSaving) {
      return;
    }

    if (!hasBodyMeasurementValue(draft)) {
      showAppAlert(strings.bodyMeasurements.title, strings.bodyMeasurements.saveEmpty);
      return;
    }

    if (!isValidBodyMeasurementDraft(draft)) {
      showAppAlert(
        strings.bodyMeasurements.title,
        strings.bodyMeasurements.invalidValue,
      );
      return;
    }

    setIsSaving(true);

    try {
      if (editingMeasurement === null) {
        await saveBodyMeasurement({
          draft,
          id: createId(),
          measuredAt: new Date().toISOString(),
          userId,
        });
      } else {
        await updateBodyMeasurement({
          draft,
          id: editingMeasurement.id,
        });
      }

      setDraft(EMPTY_DRAFT);
      setEditingMeasurement(null);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.bodyMeasurements(userId),
      });
    } catch {
      showAppAlert(strings.alerts.storageSaveTitle, strings.alerts.storageSaveMessage);
    } finally {
      setIsSaving(false);
    }
  }

  function startEditingMeasurement(measurement: BodyMeasurement) {
    setEditingMeasurement(measurement);
    setDraft(createDraftFromMeasurement(measurement));
  }

  function cancelEditingMeasurement() {
    setEditingMeasurement(null);
    setDraft(EMPTY_DRAFT);
  }

  function confirmDeleteMeasurement(measurement: BodyMeasurement) {
    showAppAlert(
      strings.bodyMeasurements.deleteTitle,
      strings.bodyMeasurements.deleteMessage,
      [
        {
          text: strings.actions.cancel,
          style: 'cancel',
        },
        {
          text: strings.actions.delete,
          style: 'destructive',
          onPress: () => {
            void deleteMeasurement(measurement);
          },
        },
      ],
    );
  }

  async function deleteMeasurement(measurement: BodyMeasurement) {
    try {
      await deleteBodyMeasurement(measurement.id);

      if (editingMeasurement?.id === measurement.id) {
        cancelEditingMeasurement();
      }

      if (userId !== null) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.bodyMeasurements(userId),
        });
      }
    } catch {
      showAppAlert(strings.alerts.storageSaveTitle, strings.alerts.storageSaveMessage);
    }
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={[styles.safeArea, { backgroundColor }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <SecondaryScreenHeader
          marginBottom={14}
          onBack={onBack}
          title={strings.bodyMeasurements.title}
        />

        <FlatList
          contentContainerStyle={[
            styles.listContent,
          ]}
          data={reversedMeasurements}
          keyExtractor={(item) => item.id}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            measurementsQuery.isLoading ? (
              <Text style={styles.emptyText}>{strings.bodyMeasurements.loading}</Text>
            ) : (
              <Text style={styles.emptyText}>{strings.bodyMeasurements.empty}</Text>
            )
          }
          ListHeaderComponent={
            <View>
              <MeasurementMetricPicker
                onSelectMetric={setSelectedMetric}
                selectedMetric={selectedMetric}
              />
              <MeasurementChart
                measurements={measurements}
                selectedMetric={selectedMetric}
              />
              <MeasurementForm
                draft={draft}
                isEditing={editingMeasurement !== null}
                isSaving={isSaving}
                onCancelEditing={cancelEditingMeasurement}
                onChangeDraft={setDraft}
                onSave={() => {
                  void saveMeasurement();
                }}
              />
              <Text style={styles.sectionTitle}>
                {strings.bodyMeasurements.listTitle}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <MeasurementRow
              measurement={item}
              onDelete={() => confirmDeleteMeasurement(item)}
              onEdit={() => startEditingMeasurement(item)}
            />
          )}
          style={[
            styles.measurementsList,
            keyboardBottomInset > 0 && { marginBottom: keyboardBottomInset },
          ]}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MeasurementMetricPicker({
  onSelectMetric,
  selectedMetric,
}: {
  onSelectMetric: (metric: BodyMeasurementMetric) => void;
  selectedMetric: BodyMeasurementMetric;
}) {
  return (
    <View style={styles.metricRow}>
      {METRICS.map((metric) => {
        const isSelected = metric === selectedMetric;
        const label = getMetricLabel(metric);

        return (
          <Pressable
            accessibilityLabel={strings.accessibility.bodyMeasurementMetric(label)}
            key={metric}
            onPress={() => onSelectMetric(metric)}
            style={({ pressed }) => [
              styles.metricButton,
              isSelected && styles.selectedMetricButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text
              style={[
                styles.metricButtonText,
                isSelected && styles.selectedMetricButtonText,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MeasurementChart({
  measurements,
  selectedMetric,
}: {
  measurements: BodyMeasurement[];
  selectedMetric: BodyMeasurementMetric;
}) {
  const [chartWidth, setChartWidth] = useState(0);
  const chartPoints = measurements
    .map((measurement) => ({
      dateLabel: formatShortDate(measurement.measuredAt),
      value: measurement[selectedMetric],
    }))
    .filter(
      (point): point is { dateLabel: string; value: number } =>
        point.value !== null,
    );

  function handleLayout(event: LayoutChangeEvent) {
    setChartWidth(event.nativeEvent.layout.width);
  }

  if (chartPoints.length < 2) {
    return (
      <View onLayout={handleLayout} style={styles.chartEmptyBlock}>
        <Text style={styles.emptyText}>{strings.bodyMeasurements.chartEmpty}</Text>
      </View>
    );
  }

  const chartHeight = 156;
  const horizontalPadding = 16;
  const topPadding = 18;
  const bottomPadding = 32;
  const safeChartWidth = Math.max(chartWidth, 1);
  const drawableWidth = Math.max(safeChartWidth - horizontalPadding * 2, 1);
  const drawableHeight = chartHeight - topPadding - bottomPadding;
  const values = chartPoints.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;
  const points = chartPoints.map((point, index) => {
    const x =
      horizontalPadding +
      (chartPoints.length === 1
        ? drawableWidth / 2
        : (drawableWidth * index) / (chartPoints.length - 1));
    const y =
      topPadding +
      (valueRange === 0
        ? drawableHeight / 2
        : drawableHeight - ((point.value - minValue) / valueRange) * drawableHeight);

    return {
      ...point,
      x,
      y,
    };
  });

  return (
    <View onLayout={handleLayout} style={styles.chartBlock}>
      <Svg height={chartHeight} width="100%">
        <Line
          stroke={colors.border}
          strokeWidth={1}
          x1={horizontalPadding}
          x2={safeChartWidth - horizontalPadding}
          y1={chartHeight - bottomPadding}
          y2={chartHeight - bottomPadding}
        />
        <SvgText
          fill={colors.muted}
          fontSize="11"
          fontWeight="700"
          x={horizontalPadding}
          y={12}
        >
          {formatMeasurementValue(maxValue)}
        </SvgText>
        <SvgText
          fill={colors.muted}
          fontSize="11"
          fontWeight="700"
          x={horizontalPadding}
          y={chartHeight - 6}
        >
          {points[0]?.dateLabel}
        </SvgText>
        <SvgText
          fill={colors.muted}
          fontSize="11"
          fontWeight="700"
          textAnchor="end"
          x={safeChartWidth - horizontalPadding}
          y={chartHeight - 6}
        >
          {points[points.length - 1]?.dateLabel}
        </SvgText>
        <Polyline
          fill="none"
          points={points.map((point) => `${point.x},${point.y}`).join(' ')}
          stroke={colors.primary}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
        />
        {points.map((point) => (
          <Circle
            cx={point.x}
            cy={point.y}
            fill={colors.panel}
            key={`${point.dateLabel}-${point.x}`}
            r={4}
            stroke={colors.primary}
            strokeWidth={2}
          />
        ))}
      </Svg>
    </View>
  );
}

function MeasurementForm({
  draft,
  isEditing,
  isSaving,
  onCancelEditing,
  onChangeDraft,
  onSave,
}: {
  draft: BodyMeasurementDraft;
  isEditing: boolean;
  isSaving: boolean;
  onCancelEditing: () => void;
  onChangeDraft: (draft: BodyMeasurementDraft) => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.formBlock}>
      <Text style={styles.sectionTitle}>
        {isEditing
          ? strings.bodyMeasurements.editTitle
          : strings.bodyMeasurements.addTitle}
      </Text>
      <View style={styles.inputRow}>
        <MeasurementInput
          label={strings.bodyMeasurements.weightKg}
          onChangeText={(value) => onChangeDraft({ ...draft, weightKg: value })}
          value={draft.weightKg}
        />
        <MeasurementInput
          label={strings.bodyMeasurements.waistCm}
          onChangeText={(value) => onChangeDraft({ ...draft, waistCm: value })}
          value={draft.waistCm}
        />
        <MeasurementInput
          label={strings.bodyMeasurements.hipsCm}
          onChangeText={(value) => onChangeDraft({ ...draft, hipsCm: value })}
          value={draft.hipsCm}
        />
        <MeasurementInput
          label={strings.bodyMeasurements.chestCm}
          onChangeText={(value) => onChangeDraft({ ...draft, chestCm: value })}
          value={draft.chestCm}
        />
        <MeasurementInput
          label={strings.bodyMeasurements.abdomenCm}
          onChangeText={(value) => onChangeDraft({ ...draft, abdomenCm: value })}
          value={draft.abdomenCm}
        />
      </View>
      {isEditing ? (
        <Pressable
          onPress={onCancelEditing}
          style={({ pressed }) => [
            styles.cancelEditButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.cancelEditButtonText}>
            {strings.bodyMeasurements.cancelEdit}
          </Text>
        </Pressable>
      ) : null}
      <Pressable
        disabled={isSaving}
        onPress={onSave}
        style={({ pressed }) => [
          styles.saveButton,
          isSaving && styles.disabledButton,
          pressed && styles.pressedButton,
        ]}
      >
        <Text style={styles.saveButtonText}>{strings.actions.save}</Text>
      </Pressable>
    </View>
  );
}

function MeasurementInput({
  label,
  onChangeText,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <View style={styles.inputBlock}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        keyboardType="decimal-pad"
        onChangeText={onChangeText}
        placeholder="0"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function MeasurementRow({
  measurement,
  onDelete,
  onEdit,
}: {
  measurement: BodyMeasurement;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <View style={styles.measurementRow}>
      <View style={styles.measurementTextBlock}>
        <Text style={styles.measurementDate}>
          {formatFullDate(measurement.measuredAt)}
        </Text>
        <Text style={styles.measurementValues}>
          {[
            formatOptionalMeasurement(strings.bodyMeasurements.weightKg, measurement.weightKg),
            formatOptionalMeasurement(strings.bodyMeasurements.waistCm, measurement.waistCm),
            formatOptionalMeasurement(strings.bodyMeasurements.hipsCm, measurement.hipsCm),
            formatOptionalMeasurement(strings.bodyMeasurements.chestCm, measurement.chestCm),
            formatOptionalMeasurement(
              strings.bodyMeasurements.abdomenCm,
              measurement.abdomenCm,
            ),
          ]
            .filter((value) => value.length > 0)
            .join(' · ')}
        </Text>
      </View>
      <View style={styles.measurementActions}>
        <Pressable
          accessibilityLabel={strings.accessibility.editBodyMeasurement}
          onPress={onEdit}
          style={({ pressed }) => [
            styles.measurementActionButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons color={colors.primary} name="pencil" size={18} />
        </Pressable>
        <Pressable
          accessibilityLabel={strings.accessibility.deleteBodyMeasurement}
          onPress={onDelete}
          style={({ pressed }) => [
            styles.measurementActionButton,
            styles.deleteActionButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons color={colors.destructive} name="trash-outline" size={18} />
        </Pressable>
      </View>
    </View>
  );
}

function getMetricLabel(metric: BodyMeasurementMetric): string {
  if (metric === 'chestCm') {
    return strings.bodyMeasurements.metricChest;
  }

  if (metric === 'abdomenCm') {
    return strings.bodyMeasurements.metricAbdomen;
  }

  if (metric === 'waistCm') {
    return strings.bodyMeasurements.metricWaist;
  }

  if (metric === 'hipsCm') {
    return strings.bodyMeasurements.metricHips;
  }

  return strings.bodyMeasurements.metricWeight;
}

function createDraftFromMeasurement(
  measurement: BodyMeasurement,
): BodyMeasurementDraft {
  return {
    abdomenCm: formatDraftMeasurementValue(measurement.abdomenCm),
    chestCm: formatDraftMeasurementValue(measurement.chestCm),
    hipsCm: formatDraftMeasurementValue(measurement.hipsCm),
    waistCm: formatDraftMeasurementValue(measurement.waistCm),
    weightKg: formatDraftMeasurementValue(measurement.weightKg),
  };
}

function formatOptionalMeasurement(label: string, value: number | null): string {
  return value === null ? '' : `${label}: ${formatMeasurementValue(value)}`;
}

function formatMeasurementValue(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(1)));
}

function formatDraftMeasurementValue(value: number | null): string {
  return value === null ? '' : formatMeasurementValue(value);
}

function formatShortDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

function formatFullDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('ru-RU');
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  listContent: {
    flexGrow: 1,
    gap: 10,
    paddingBottom: 24,
  },
  measurementsList: {
    flex: 1,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  metricButton: {
    alignItems: 'center',
    backgroundColor: '#FBFDFB',
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '31%',
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 40,
  },
  selectedMetricButton: {
    backgroundColor: '#EAF7F0',
    borderColor: '#B7D8C5',
  },
  metricButtonText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  selectedMetricButtonText: {
    color: colors.primary,
  },
  chartBlock: {
    backgroundColor: colors.panel,
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  chartEmptyBlock: {
    backgroundColor: colors.panel,
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 96,
    justifyContent: 'center',
    padding: 12,
  },
  formBlock: {
    backgroundColor: colors.panel,
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  inputBlock: {
    flexBasis: '48%',
    flexGrow: 1,
    gap: 6,
  },
  inputLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#FBFDFB',
    borderColor: '#DCE9E2',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    height: 44,
    paddingHorizontal: 12,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: '#B7D8C5',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelEditButton: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#B7D8C5',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: 8,
    minHeight: 40,
  },
  cancelEditButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  saveButtonText: {
    color: colors.panel,
    fontSize: 15,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.45,
  },
  measurementRow: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderLeftColor: '#B7D8C5',
    borderLeftWidth: 3,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  measurementTextBlock: {
    flex: 1,
  },
  measurementDate: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  measurementValues: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  measurementActions: {
    flexDirection: 'row',
    gap: 6,
  },
  measurementActionButton: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  deleteActionButton: {
    backgroundColor: '#FFF7F7',
    borderColor: colors.destructiveBorder,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
