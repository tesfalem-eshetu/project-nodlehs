import { useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
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
  const { device, serviceRequests } = useDeviceWithRequests(id);

  const handleCreateSR = useCallback(() => {
    router.push(`/service-request/create?deviceId=${id}`);
  }, [router, id]);

  if (!device) {
    return (
      <View style={styles.center}>
        <Text>Device not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: device.name }} />

      <View style={styles.header}>
        <Text variant="headlineSmall">{device.name}</Text>
        <Text variant="bodyLarge">{device.type}</Text>
        <View style={styles.row}>
          <Text variant="bodyMedium">Status: </Text>
          <StatusIndicator status={device.status} />
        </View>
        <Text variant="bodyMedium">Location: {device.location}</Text>
        <Text variant="bodyMedium">Last Seen: {formatDate(device.lastSeen)}</Text>
        <Text variant="bodyMedium">
          Last Maintenance: {formatDate(device.lastMaintenanceDate)}
        </Text>
      </View>

      <Divider />

      <View style={styles.sectionHeader}>
        <Text variant="titleMedium">Maintenance Timeline</Text>
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
          <View style={styles.center}>
            <Text>No service requests for this device</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <Button mode="contained" onPress={handleCreateSR}>
          Create Service Request
        </Button>
      </View>
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
  header: {
    padding: 16,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  list: {
    flex: 1,
  },
  footer: {
    padding: 16,
  },
});
