import { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  SegmentedButtons,
  HelperText,
} from 'react-native-paper';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDispatch } from '@/store';
import { createServiceRequest } from '@/store/thunks/serviceRequestThunks';
import { Priority, Category } from '@/types';

const PRIORITY_OPTIONS = [
  { value: Priority.Critical, label: 'Critical' },
  { value: Priority.High, label: 'High' },
  { value: Priority.Medium, label: 'Medium' },
  { value: Priority.Low, label: 'Low' },
];

const CATEGORY_OPTIONS = [
  { value: Category.Repair, label: 'Repair' },
  { value: Category.PreventiveMaintenance, label: 'Preventive' },
  { value: Category.Inspection, label: 'Inspection' },
  { value: Category.Replacement, label: 'Replace' },
];

export default function CreateServiceRequestScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [category, setCategory] = useState<Category>(Category.Repair);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!scheduledDate) newErrors.scheduledDate = 'Scheduled date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, description, scheduledDate]);

  const handleDateChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowDatePicker(Platform.OS === 'ios');
      if (selectedDate) {
        setScheduledDate(selectedDate);
        setErrors((prev) => {
          const next = { ...prev };
          delete next.scheduledDate;
          return next;
        });
      }
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await dispatch(
        createServiceRequest({
          deviceId,
          title: title.trim(),
          description: description.trim(),
          priority,
          category,
          scheduledDate: scheduledDate!.toISOString(),
        }),
      ).unwrap();
      router.back();
    } catch {
      setErrors((prev) => ({ ...prev, form: 'Failed to create service request' }));
    } finally {
      setSubmitting(false);
    }
  }, [validate, dispatch, deviceId, title, description, priority, category, scheduledDate, router]);

  if (!deviceId) {
    return (
      <View style={styles.center}>
        <Text>No device selected</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TextInput
        label="Title"
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (errors.title) {
            setErrors((prev) => {
              const next = { ...prev };
              delete next.title;
              return next;
            });
          }
        }}
        mode="outlined"
        error={!!errors.title}
      />
      {errors.title && <HelperText type="error">{errors.title}</HelperText>}

      <TextInput
        label="Description"
        value={description}
        onChangeText={(text) => {
          setDescription(text);
          if (errors.description) {
            setErrors((prev) => {
              const next = { ...prev };
              delete next.description;
              return next;
            });
          }
        }}
        mode="outlined"
        multiline
        numberOfLines={4}
        error={!!errors.description}
        style={styles.descriptionInput}
      />
      {errors.description && (
        <HelperText type="error">{errors.description}</HelperText>
      )}

      <Text variant="labelLarge" style={styles.label}>
        Priority
      </Text>
      <SegmentedButtons
        value={priority}
        onValueChange={(value) => setPriority(value as Priority)}
        buttons={PRIORITY_OPTIONS}
      />

      <Text variant="labelLarge" style={styles.label}>
        Category
      </Text>
      <SegmentedButtons
        value={category}
        onValueChange={(value) => setCategory(value as Category)}
        buttons={CATEGORY_OPTIONS}
      />

      <Text variant="labelLarge" style={styles.label}>
        Scheduled Date
      </Text>
      <Button
        mode="outlined"
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        {scheduledDate ? scheduledDate.toLocaleDateString() : 'Select Date'}
      </Button>
      {errors.scheduledDate && (
        <HelperText type="error">{errors.scheduledDate}</HelperText>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={scheduledDate ?? new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {errors.form && <HelperText type="error">{errors.form}</HelperText>}

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={submitting}
        disabled={submitting}
        style={styles.submitButton}
      >
        Submit
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  descriptionInput: {
    minHeight: 100,
  },
  label: {
    marginTop: 8,
  },
  dateButton: {
    alignSelf: 'flex-start',
  },
  submitButton: {
    marginTop: 16,
  },
});
