import { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Button, TextInput, Divider } from 'react-native-paper';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectServiceRequestById } from '@/store/selectors/serviceRequestSelectors';
import { selectDeviceById } from '@/store/selectors/deviceSelectors';
import {
  updateServiceRequestStatus,
  addNoteToServiceRequest,
} from '@/store/thunks/serviceRequestThunks';
import { ServiceRequestStatus, Category } from '@/types';
import StatusIndicator from '@/components/StatusIndicator';
import PriorityIndicator from '@/components/PriorityIndicator';
import ActivityLogEntryComponent from '@/components/ActivityLogEntry';

const CATEGORY_LABELS: Record<Category, string> = {
  repair: 'Repair',
  preventive_maintenance: 'Preventive Maintenance',
  inspection: 'Inspection',
  replacement: 'Replacement',
};

export default function ServiceRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const sr = useAppSelector((state) => selectServiceRequestById(state, id));
  const device = useAppSelector((state) =>
    sr ? selectDeviceById(state, sr.deviceId) : null,
  );

  const [noteText, setNoteText] = useState('');
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusUpdate = useCallback(
    async (newStatus: ServiceRequestStatus) => {
      if (!sr) return;
      setUpdating(true);
      setActionError(null);
      try {
        await dispatch(
          updateServiceRequestStatus({
            id: sr.id,
            status: newStatus,
            deviceId: sr.deviceId,
          }),
        ).unwrap();
      } catch (e) {
        setActionError(e instanceof Error ? e.message : 'Failed to update status');
      } finally {
        setUpdating(false);
      }
    },
    [dispatch, sr],
  );

  const handleAddNote = useCallback(async () => {
    if (!sr || !noteText.trim()) return;
    setActionError(null);
    try {
      await dispatch(
        addNoteToServiceRequest({ id: sr.id, content: noteText.trim() }),
      ).unwrap();
      setNoteText('');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to add note');
    }
  }, [dispatch, sr, noteText]);

  if (!sr) {
    return (
      <View style={styles.center}>
        <Text>Service request not found</Text>
      </View>
    );
  }

  const isTerminal =
    sr.status === ServiceRequestStatus.Completed ||
    sr.status === ServiceRequestStatus.Cancelled;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: sr.title }} />

      <FlatList
        data={sr.activityLog}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityLogEntryComponent entry={item} />}
        ListHeaderComponent={
          <View>
            <View style={styles.section}>
              <Text variant="headlineSmall">{sr.title}</Text>
              <Text variant="bodyMedium" style={styles.description}>
                {sr.description}
              </Text>
              {device && (
                <Text variant="bodyMedium">Device: {device.name}</Text>
              )}
              <View style={styles.row}>
                <Text variant="bodyMedium">Status: </Text>
                <StatusIndicator status={sr.status} />
              </View>
              <View style={styles.row}>
                <Text variant="bodyMedium">Priority: </Text>
                <PriorityIndicator priority={sr.priority} />
              </View>
              <Text variant="bodyMedium">
                Category: {CATEGORY_LABELS[sr.category] ?? sr.category}
              </Text>
              <Text variant="bodyMedium">
                Scheduled: {new Date(sr.scheduledDate).toLocaleDateString()}
              </Text>
              <Text variant="bodyMedium">
                Created: {new Date(sr.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <Divider />

            {!isTerminal && (
              <View style={styles.section}>
                <Text variant="titleMedium">Update Status</Text>
                <View style={styles.buttonRow}>
                  {sr.status === ServiceRequestStatus.Open && (
                    <>
                      <Button
                        mode="contained"
                        onPress={() =>
                          handleStatusUpdate(ServiceRequestStatus.InProgress)
                        }
                        loading={updating}
                        disabled={updating}
                        compact
                      >
                        Mark In Progress
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() =>
                          handleStatusUpdate(ServiceRequestStatus.Cancelled)
                        }
                        loading={updating}
                        disabled={updating}
                        compact
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {sr.status === ServiceRequestStatus.InProgress && (
                    <>
                      <Button
                        mode="contained"
                        onPress={() =>
                          handleStatusUpdate(ServiceRequestStatus.Completed)
                        }
                        loading={updating}
                        disabled={updating}
                        compact
                      >
                        Mark Completed
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() =>
                          handleStatusUpdate(ServiceRequestStatus.Cancelled)
                        }
                        loading={updating}
                        disabled={updating}
                        compact
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </View>
              </View>
            )}

            {actionError && (
              <Text variant="bodySmall" style={styles.errorText}>
                {actionError}
              </Text>
            )}

            <Divider />

            <View style={styles.section}>
              <Text variant="titleMedium">Add Note</Text>
              <TextInput
                value={noteText}
                onChangeText={setNoteText}
                placeholder="Type a note..."
                mode="outlined"
                multiline
              />
              <Button
                mode="contained-tonal"
                onPress={handleAddNote}
                disabled={!noteText.trim()}
                style={styles.addNoteButton}
              >
                Add Note
              </Button>
            </View>

            <Divider />

            <View style={styles.sectionHeader}>
              <Text variant="titleMedium">Activity Log</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No activity entries</Text>
          </View>
        }
      />
    </View>
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
  section: {
    padding: 16,
    gap: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  description: {
    color: '#424242',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  addNoteButton: {
    alignSelf: 'flex-start',
  },
  errorText: {
    color: '#c62828',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});
