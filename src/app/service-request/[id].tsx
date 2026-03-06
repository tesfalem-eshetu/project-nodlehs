import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Button, TextInput, Card } from 'react-native-paper';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ServiceRequestStatus, Category } from '@/types';
import { useAppTheme } from '@/theme';
import useServiceRequestDetail from '@/hooks/useServiceRequestDetail';
import StatusIndicator from '@/components/StatusIndicator';
import PriorityIndicator from '@/components/PriorityIndicator';
import ActivityLogEntryComponent from '@/components/ActivityLogEntry';

const CATEGORY_LABELS: Record<Category, string> = {
  repair: 'Repair',
  preventive_maintenance: 'Preventive',
  inspection: 'Inspection',
  replacement: 'Replacement',
};

export default function ServiceRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const {
    sr,
    device,
    noteText,
    setNoteText,
    updatingStatus,
    addingNote,
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
      <Stack.Screen options={{ title: '' }} />

      <FlatList
        data={sr.activityLog}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
        renderItem={({ item }) => <ActivityLogEntryComponent entry={item} />}
        ListHeaderComponent={
          <View>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="contained">
              <Card.Content style={styles.cardContent}>
                <View style={styles.titleBlock}>
                  <Text
                    variant="titleLarge"
                    style={[styles.titleText, { color: theme.colors.onSurface }]}
                  >
                    {sr.title}
                  </Text>
                  <View style={styles.chipRow}>
                    <View
                      style={[styles.categoryChip, { backgroundColor: theme.colors.surfaceVariant }]}
                    >
                      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {CATEGORY_LABELS[sr.category]}
                      </Text>
                    </View>
                    {device && (
                      <View
                        style={[styles.categoryChip, { backgroundColor: theme.colors.surfaceVariant }]}
                      >
                        <Text
                          variant="labelSmall"
                          style={{ color: theme.colors.onSurfaceVariant }}
                          numberOfLines={1}
                        >
                          {device.name}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant, lineHeight: 22 }}
                >
                  {sr.description}
                </Text>

                <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

                <View style={styles.badgeRow}>
                  <StatusIndicator status={sr.status} />
                  <PriorityIndicator priority={sr.priority} />
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

                <DetailRow
                  label="Scheduled"
                  value={new Date(sr.scheduledDate).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                />
                <DetailRow
                  label="Created"
                  value={new Date(sr.createdAt).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                />
              </Card.Content>
            </Card>

            {!isTerminal && (
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="contained">
                <Card.Content style={styles.actionCardContent}>
                  <Text
                    variant="labelLarge"
                    style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}
                  >
                    Update Status
                  </Text>

                  {sr.status === ServiceRequestStatus.Open && (
                    <>
                      <Button
                        mode="contained"
                        onPress={() => handleStatusUpdate(ServiceRequestStatus.InProgress)}
                        loading={updatingStatus === ServiceRequestStatus.InProgress}
                        disabled={updatingStatus !== null}
                        contentStyle={styles.buttonContent}
                      >
                        Mark In Progress
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => handleStatusUpdate(ServiceRequestStatus.Cancelled)}
                        loading={updatingStatus === ServiceRequestStatus.Cancelled}
                        disabled={updatingStatus !== null}
                        contentStyle={styles.buttonContent}
                        textColor={theme.colors.error}
                        style={{ borderColor: theme.colors.error }}
                      >
                        Cancel Request
                      </Button>
                    </>
                  )}

                  {sr.status === ServiceRequestStatus.InProgress && (
                    <>
                      <Button
                        mode="contained"
                        onPress={() => handleStatusUpdate(ServiceRequestStatus.Completed)}
                        loading={updatingStatus === ServiceRequestStatus.Completed}
                        disabled={updatingStatus !== null}
                        contentStyle={styles.buttonContent}
                      >
                        Mark Completed
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => handleStatusUpdate(ServiceRequestStatus.Cancelled)}
                        loading={updatingStatus === ServiceRequestStatus.Cancelled}
                        disabled={updatingStatus !== null}
                        contentStyle={styles.buttonContent}
                        textColor={theme.colors.error}
                        style={{ borderColor: theme.colors.error }}
                      >
                        Cancel Request
                      </Button>
                    </>
                  )}

                  {actionError && (
                    <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                      {actionError}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            )}

            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="contained">
              <Card.Content style={styles.actionCardContent}>
                <Text
                  variant="labelLarge"
                  style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}
                >
                  Add Note
                </Text>
                <TextInput
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder="Type a note..."
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                />
                <Button
                  mode="contained-tonal"
                  onPress={handleAddNote}
                  loading={addingNote}
                  disabled={!noteText.trim() || addingNote}
                  contentStyle={styles.buttonContent}
                >
                  Add Note
                </Button>
              </Card.Content>
            </Card>

            <View style={styles.sectionHeader}>
              <Text
                variant="labelLarge"
                style={[styles.sectionHeaderText, { color: theme.colors.onSurfaceVariant }]}
              >
                Activity Log
              </Text>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {sr.activityLog.length} {sr.activityLog.length === 1 ? 'entry' : 'entries'}
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
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
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
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 0,
    borderRadius: 12,
  },
  cardContent: {
    gap: 12,
  },
  actionCardContent: {
    gap: 12,
  },
  titleBlock: {
    gap: 8,
  },
  titleText: {
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionHeaderText: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  buttonContent: {
    height: 48,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
});
