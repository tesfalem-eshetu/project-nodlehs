import { View, StyleSheet } from 'react-native';
import { Text, TouchableRipple, Badge } from 'react-native-paper';
import type { Device } from '@/types';
import { useAppTheme } from '@/theme';
import { brand } from '@/theme/colors';
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
  const theme = useAppTheme();

  return (
    <TouchableRipple onPress={onPress}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.outlineVariant,
          },
        ]}
      >
        <View style={styles.topRow}>
          <View style={styles.nameRow}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {device.name}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {device.type}
            </Text>
          </View>
          {openRequestCount > 0 && (
            <Badge style={[styles.badge, { backgroundColor: brand.gold }]}>
              {openRequestCount}
            </Badge>
          )}
        </View>
        <View style={styles.bottomRow}>
          <StatusIndicator status={device.status} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
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
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flex: 1,
    gap: 2,
  },
  badge: {
    marginLeft: 8,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
