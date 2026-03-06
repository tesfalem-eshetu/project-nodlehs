import { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  LayoutAnimation,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import {
  TextInput,
  Button,
  Text,
  HelperText,
  Card,
} from 'react-native-paper';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '@/store';
import { createServiceRequest } from '@/store/thunks/serviceRequestThunks';
import { useAppTheme } from '@/theme';
import { priority as priorityColors, priorityDark } from '@/theme/colors';
import { Priority, Category } from '@/types';

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: Priority.Critical, label: 'Critical' },
  { value: Priority.High, label: 'High' },
  { value: Priority.Medium, label: 'Medium' },
  { value: Priority.Low, label: 'Low' },
];

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: Category.Repair, label: 'Repair' },
  { value: Category.PreventiveMaintenance, label: 'Preventive Maintenance' },
  { value: Category.Inspection, label: 'Inspection' },
  { value: Category.Replacement, label: 'Replacement' },
];

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  open,
  onToggle,
  getDotColor,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  open: boolean;
  onToggle: () => void;
  getDotColor?: (v: T) => string;
}) {
  const theme = useAppTheme();
  const selected = options.find((o) => o.value === value);
  const dotColor = getDotColor?.(value);

  const handleToggle = () => {
    LayoutAnimation.configureNext({
      duration: 220,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    onToggle();
  };

  const handleSelect = (v: T) => {
    LayoutAnimation.configureNext({
      duration: 180,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    onChange(v);
    onToggle();
  };

  return (
    <View
      style={[
        select.wrapper,
        {
          borderColor: open ? theme.colors.primary : theme.colors.outline,
          backgroundColor: theme.colors.surfaceVariant,
        },
      ]}
    >
      <Pressable onPress={handleToggle} style={select.trigger}>
        <Text
          variant="labelSmall"
          style={[select.floatingLabel, { color: open ? theme.colors.primary : theme.colors.onSurfaceVariant }]}
        >
          {label}
        </Text>
        <View style={select.triggerInner}>
          <Text
            variant="bodyLarge"
            style={{ color: open ? theme.colors.onSurfaceVariant : (dotColor ?? theme.colors.onSurface), flex: 1 }}
          >
            {open ? 'Select an option' : (selected?.label ?? '')}
          </Text>
          <Text style={{ color: open ? theme.colors.primary : theme.colors.onSurfaceVariant, fontSize: 11 }}>
            {open ? '▲' : '▼'}
          </Text>
        </View>
      </Pressable>

      {open && (
        <View style={[select.optionList, { borderTopColor: theme.colors.outlineVariant }]}>
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const dc = getDotColor?.(opt.value);
            const isLast = i === options.length - 1;
            return (
              <Pressable
                key={opt.value}
                onPress={() => handleSelect(opt.value)}
                style={({ pressed }) => [
                  select.option,
                  !isLast && {
                    borderBottomColor: theme.colors.outlineVariant,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  },
                  {
                    backgroundColor: pressed
                      ? theme.colors.surfaceVariant
                      : isSelected
                      ? theme.colors.primaryContainer + '30'
                      : 'transparent',
                  },
                ]}
              >
                <Text
                  variant="bodyMedium"
                  style={{
                    color: dc ?? (isSelected ? theme.colors.primary : theme.colors.onSurface),
                    flex: 1,
                    fontWeight: isSelected ? '600' : '400',
                  }}
                >
                  {opt.label}
                </Text>
                {isSelected && (
                  <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '700' }}>
                    ✓
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const select = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  trigger: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  floatingLabel: {
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  triggerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionList: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
});

export default function CreateServiceRequestScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [category, setCategory] = useState<Category>(Category.Repair);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeField, setActiveField] = useState<'priority' | 'category' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const toggleField = useCallback((field: 'priority' | 'category') => {
    setActiveField((current) => (current === field ? null : field));
  }, []);

  const priorityPalette = theme.dark ? priorityDark : priorityColors;

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
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.onBackground }}>No device selected</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 20) + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="contained">
          <Card.Content style={styles.cardContent}>
            <Text
              variant="labelLarge"
              style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}
            >
              Details
            </Text>
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
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="contained">
          <Card.Content style={styles.cardContent}>
            <Text
              variant="labelLarge"
              style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}
            >
              Classification
            </Text>
            <SelectField
              label="Priority"
              value={priority}
              options={PRIORITY_OPTIONS}
              onChange={setPriority}
              open={activeField === 'priority'}
              onToggle={() => toggleField('priority')}
              getDotColor={(v) => priorityPalette[v].text}
            />
            <SelectField
              label="Category"
              value={category}
              options={CATEGORY_OPTIONS}
              onChange={setCategory}
              open={activeField === 'category'}
              onToggle={() => toggleField('category')}
            />
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="contained">
          <Card.Content style={styles.cardContent}>
            <Text
              variant="labelLarge"
              style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}
            >
              Scheduled Date
            </Text>

            {Platform.OS === 'ios' ? (
              <View
                style={[
                  styles.iosDateRow,
                  {
                    borderColor: errors.scheduledDate
                      ? theme.colors.error
                      : theme.colors.outline,
                    backgroundColor: theme.colors.surfaceVariant,
                  },
                ]}
              >
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {scheduledDate ? 'Scheduled for' : 'Pick a date'}
                </Text>
                <DateTimePicker
                  value={scheduledDate ?? new Date()}
                  mode="date"
                  display="compact"
                  onChange={handleDateChange}
                  accentColor={theme.colors.primary}
                />
              </View>
            ) : (
              <>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  style={({ pressed }) => [
                    styles.androidDatePicker,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: errors.scheduledDate
                        ? theme.colors.error
                        : scheduledDate
                        ? theme.colors.primary
                        : theme.colors.outline,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    variant="bodyLarge"
                    style={{
                      color: scheduledDate
                        ? theme.colors.onSurface
                        : theme.colors.onSurfaceVariant,
                    }}
                  >
                    {scheduledDate
                      ? scheduledDate.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Select a date'}
                  </Text>
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={scheduledDate ?? new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </>
            )}

            {errors.scheduledDate && (
              <HelperText type="error">{errors.scheduledDate}</HelperText>
            )}
          </Card.Content>
        </Card>

        {errors.form && (
          <HelperText type="error" style={styles.formError}>
            {errors.form}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Create Service Request
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
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
    gap: 12,
  },
  card: {
    borderRadius: 12,
  },
  cardContent: {
    gap: 12,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  descriptionInput: {
    minHeight: 140,
  },
  iosDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  androidDatePicker: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  formError: {
    paddingHorizontal: 4,
  },
  submitButton: {
    marginTop: 8,
  },
  submitButtonContent: {
    height: 52,
  },
});
