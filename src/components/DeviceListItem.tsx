import { View, StyleSheet } from 'react-native';
import { Text, TouchableRipple, Badge } from 'react-native-paper';
import type { Device } from '@/types';
import StatusIndicator from './StatusIndicator';

interface DeviceListItemProps {
  device: Device;
  openRequestCount: number;
  onPress: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No maintenance history';
  return new Date(dateStr).toLocaleDateString();
}

export default function DeviceListItem({
  device,
  openRequestCount,
  onPress,
}: DeviceListItemProps) {
  return (
    <TouchableRipple onPress={onPress} style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <Text variant="titleMedium" style={styles.name}>
            {device.name} - {device.type}
          </Text>
          {openRequestCount > 0 && (
            <Badge style={styles.badge}>{openRequestCount}</Badge>
          )}
        </View>
        <View style={styles.bottomRow}>
          <StatusIndicator status={device.status} />
          <Text variant="bodySmall" style={styles.maintenance}>
            {formatDate(device.lastMaintenanceDate)}
          </Text>
        </View>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  inner: {
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
  },
  badge: {
    marginLeft: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maintenance: {
    color: '#757575',
  },
});
