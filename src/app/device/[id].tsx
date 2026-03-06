import { useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme';
import useDeviceWithRequests from '@/hooks/useDeviceWithRequests';
import StatusIndicator from '@/components/StatusIndicator';
import ServiceRequestListItem from '@/components/ServiceRequestListItem';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'None';
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DeviceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
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
      <Stack.Screen options={{ title: '' }} />

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="contained">
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardNameBlock}>
              <Text
                variant="titleLarge"
                style={[styles.cardName, { color: theme.colors.onSurface }]}
              >
                {device.name}
              </Text>
              <View style={[styles.typeBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {device.type}
                </Text>
              </View>
            </View>
            <StatusIndicator status={device.status} />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

          <InfoRow label="Location" value={device.location} />
          <InfoRow label="Last Seen" value={formatDate(device.lastSeen)} />
          <InfoRow label="Last Maintenance" value={formatDate(device.lastMaintenanceDate)} />
        </Card.Content>
      </Card>

      <View style={styles.sectionHeader}>
        <Text
          variant="labelLarge"
          style={[styles.sectionHeaderText, { color: theme.colors.onSurfaceVariant }]}
        >
          Maintenance Timeline
        </Text>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {serviceRequests.length} {serviceRequests.length === 1 ? 'request' : 'requests'}
        </Text>
      </View>

      <FlatList
        data={serviceRequests}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 8 }}
        renderItem={({ item }) => (
          <ServiceRequestListItem
            serviceRequest={item}
            onPress={() => router.push(`/service-request/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              No service requests yet
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
            >
              Tap the button below to create one
            </Text>
          </View>
        }
      />

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outlineVariant,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        <Button mode="contained" onPress={handleCreateSR} contentStyle={styles.buttonContent}>
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
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  cardContent: {
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardNameBlock: {
    flex: 1,
    gap: 6,
    marginRight: 12,
  },
  cardName: {
    fontWeight: '600',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeaderText: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  list: {
    flex: 1,
  },
  empty: {
    paddingTop: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  buttonContent: {
    height: 52,
  },
});
