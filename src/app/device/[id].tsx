import { useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Button, Divider, Card } from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAppTheme } from '@/theme';
import useDeviceWithRequests from '@/hooks/useDeviceWithRequests';
import StatusIndicator from '@/components/StatusIndicator';
import ServiceRequestListItem from '@/components/ServiceRequestListItem';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString();
}

export default function DeviceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const { device, serviceRequests } = useDeviceWithRequests(id);

  const handleCreateSR = useCallback(() => {
    router.push(`/service-request/create?deviceId=${id}`);
  }, [router, id]);

  if (!device) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.onBackground }}>Device not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: device.name }} />

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="contained">
        <Card.Content style={styles.cardContent}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
            {device.name}
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            {device.type}
          </Text>
          <View style={styles.row}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Status:{' '}
            </Text>
            <StatusIndicator status={device.status} />
          </View>
          <InfoRow label="Location" value={device.location} />
          <InfoRow label="Last Seen" value={formatDate(device.lastSeen)} />
          <InfoRow label="Last Maintenance" value={formatDate(device.lastMaintenanceDate)} />
        </Card.Content>
      </Card>

      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
          Maintenance Timeline
        </Text>
      </View>

      <FlatList
        data={serviceRequests}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <ServiceRequestListItem
            serviceRequest={item}
            onPress={() => router.push(`/service-request/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              No service requests for this device
            </Text>
          </View>
        }
      />

      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
        <Button mode="contained" onPress={handleCreateSR}>
          Create Service Request
        </Button>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.infoRow}>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  list: {
    flex: 1,
  },
  empty: {
    padding: 16,
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
