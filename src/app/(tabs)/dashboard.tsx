import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, Divider, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/store';
import { selectDeviceById } from '@/store/selectors/deviceSelectors';
import { useAppTheme } from '@/theme';
import { brand } from '@/theme/colors';
import type { ServiceRequest } from '@/types';
import useDashboardData from '@/hooks/useDashboardData';
import ServiceRequestListItem from '@/components/ServiceRequestListItem';

function DeviceNameLabel({ deviceId }: { deviceId: string }) {
  const device = useAppSelector((state) => selectDeviceById(state, deviceId));
  const theme = useAppTheme();
  return (
    <Text variant="bodySmall" style={[styles.deviceName, { color: theme.colors.onSurfaceVariant }]}>
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

function StatCard({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <Card
      style={[
        styles.statCard,
        { backgroundColor: theme.colors.surface },
      ]}
      mode="contained"
    >
      <Card.Content style={styles.statContent}>
        <Text
          variant="headlineMedium"
          style={{ color: accent ? brand.gold : theme.colors.primary, fontWeight: '700' }}
        >
          {value}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {label}
        </Text>
      </Card.Content>
    </Card>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { statusCounts, priorityCounts, overdueRequests, status } = useDashboardData();

  if (status === 'loading') {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      data={overdueRequests}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <OverdueItem
          item={item}
          onPress={() => router.push(`/service-request/${item.id}`)}
        />
      )}
      ListHeaderComponent={
        <View>
          <View style={styles.section}>
            <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
              Status Summary
            </Text>
            <View style={styles.grid}>
              <StatCard value={statusCounts.open} label="Open" />
              <StatCard value={statusCounts.inProgress} label="In Progress" />
              <StatCard value={statusCounts.completed} label="Completed" />
              <StatCard value={statusCounts.cancelled} label="Cancelled" />
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
              Priority Breakdown
            </Text>
            <View style={styles.grid}>
              <StatCard value={priorityCounts.critical} label="Critical" accent />
              <StatCard value={priorityCounts.high} label="High" accent />
              <StatCard value={priorityCounts.medium} label="Medium" />
              <StatCard value={priorityCounts.low} label="Low" />
            </View>
          </View>

          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />

          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
              Overdue Requests ({overdueRequests.length})
            </Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyOverdue}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>No overdue requests</Text>
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
    gap: 10,
  },
  statCard: {
    width: '47%',
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  emptyOverdue: {
    padding: 16,
    alignItems: 'center',
  },
  deviceName: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
