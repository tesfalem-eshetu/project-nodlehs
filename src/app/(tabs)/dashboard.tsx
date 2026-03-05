import { useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Divider, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/store';
import {
  selectCountsByStatus,
  selectCountsByPriority,
  selectOverdueRequests,
  selectServiceRequestsStatus,
} from '@/store/selectors/serviceRequestSelectors';
import { selectDeviceById } from '@/store/selectors/deviceSelectors';
import type { ServiceRequest } from '@/types';
import ServiceRequestListItem from '@/components/ServiceRequestListItem';

function DeviceNameLabel({ deviceId }: { deviceId: string }) {
  const device = useAppSelector((state) => selectDeviceById(state, deviceId));
  return (
    <Text variant="bodySmall" style={styles.deviceName}>
      {device ? device.name : 'Unknown Device'}
    </Text>
  );
}

function OverdueItem({
  item,
  onPress,
}: {
  item: ServiceRequest;
  onPress: () => void;
}) {
  return (
    <View>
      <DeviceNameLabel deviceId={item.deviceId} />
      <ServiceRequestListItem serviceRequest={item} onPress={onPress} />
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const statusCounts = useAppSelector(selectCountsByStatus);
  const priorityCounts = useAppSelector(selectCountsByPriority);
  const overdueRequests = useAppSelector(selectOverdueRequests);
  const status = useAppSelector(selectServiceRequestsStatus);

  const handleSRPress = useCallback(
    (sr: ServiceRequest) => {
      router.push(`/service-request/${sr.id}`);
    },
    [router],
  );

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={overdueRequests}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <OverdueItem item={item} onPress={() => handleSRPress(item)} />
      )}
      ListHeaderComponent={
        <View>
          <View style={styles.section}>
            <Text variant="titleMedium">Status Summary</Text>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text variant="headlineMedium">{statusCounts.open}</Text>
                <Text variant="bodySmall">Open</Text>
              </View>
              <View style={styles.gridItem}>
                <Text variant="headlineMedium">{statusCounts.inProgress}</Text>
                <Text variant="bodySmall">In Progress</Text>
              </View>
              <View style={styles.gridItem}>
                <Text variant="headlineMedium">{statusCounts.completed}</Text>
                <Text variant="bodySmall">Completed</Text>
              </View>
              <View style={styles.gridItem}>
                <Text variant="headlineMedium">{statusCounts.cancelled}</Text>
                <Text variant="bodySmall">Cancelled</Text>
              </View>
            </View>
          </View>

          <Divider />

          <View style={styles.section}>
            <Text variant="titleMedium">Priority Breakdown</Text>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text variant="headlineMedium">{priorityCounts.critical}</Text>
                <Text variant="bodySmall">Critical</Text>
              </View>
              <View style={styles.gridItem}>
                <Text variant="headlineMedium">{priorityCounts.high}</Text>
                <Text variant="bodySmall">High</Text>
              </View>
              <View style={styles.gridItem}>
                <Text variant="headlineMedium">{priorityCounts.medium}</Text>
                <Text variant="bodySmall">Medium</Text>
              </View>
              <View style={styles.gridItem}>
                <Text variant="headlineMedium">{priorityCounts.low}</Text>
                <Text variant="bodySmall">Low</Text>
              </View>
            </View>
          </View>

          <Divider />

          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">
              Overdue Requests ({overdueRequests.length})
            </Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyOverdue}>
          <Text>No overdue requests</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  section: {
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  emptyOverdue: {
    padding: 16,
    alignItems: 'center',
  },
  deviceName: {
    paddingHorizontal: 16,
    paddingTop: 8,
    color: '#757575',
  },
});
