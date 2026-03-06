import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Button, TextInput, Divider, Card } from 'react-native-paper';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ServiceRequestStatus, Category } from '@/types';
import { useAppTheme } from '@/theme';
import useServiceRequestDetail from '@/hooks/useServiceRequestDetail';
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
  const theme = useAppTheme();
  const {
    sr,
    device,
    noteText,
    setNoteText,
    updating,
    actionError,
    handleStatusUpdate,
    handleAddNote,
  } = useServiceRequestDetail(id);

  if (!sr) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.onBackground }}>Service request not found</Text>
      </View>
    );
  }

  const isTerminal =
    sr.status === ServiceRequestStatus.Completed ||
    sr.status === ServiceRequestStatus.Cancelled;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: sr.title }} />

      <FlatList
        data={sr.activityLog}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityLogEntryComponent entry={item} />}
        ListHeaderComponent={
          <View>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="contained">
              <Card.Content style={styles.cardContent}>
                <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                  {sr.title}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {sr.description}
                </Text>
                {device && (
                  <DetailRow label="Device" value={device.name} />
                )}
                <View style={styles.row}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Status:{' '}
                  </Text>
                  <StatusIndicator status={sr.status} />
                </View>
                <View style={styles.row}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Priority:{' '}
                  </Text>
                  <PriorityIndicator priority={sr.priority} />
                </View>
                <DetailRow label="Category" value={CATEGORY_LABELS[sr.category] ?? sr.category} />
                <DetailRow label="Scheduled" value={new Date(sr.scheduledDate).toLocaleDateString()} />
                <DetailRow label="Created" value={new Date(sr.createdAt).toLocaleDateString()} />
              </Card.Content>
            </Card>

            {!isTerminal && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
                  Update Status
                </Text>
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
              <Text
                variant="bodySmall"
                style={[styles.errorText, { color: theme.colors.error }]}
              >
                {actionError}
              </Text>
            )}

            <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />

            <View style={styles.section}>
              <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
                Add Note
              </Text>
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

            <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />

            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
                Activity Log
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>No activity entries</Text>
          </View>
        }
      />
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.detailRow}>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
        {value}
      </Text>
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
  card: {
    margin: 12,
    borderRadius: 12,
  },
  cardContent: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    padding: 16,
    gap: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  empty: {
    padding: 16,
    alignItems: 'center',
  },
});
