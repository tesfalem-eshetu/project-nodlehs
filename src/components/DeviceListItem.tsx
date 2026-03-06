import { View, StyleSheet } from 'react-native';
import { Text, Card, Badge } from 'react-native-paper';
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
  if (!dateStr) return 'No history';
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DeviceListItem({
  device,
  openRequestCount,
  onPress,
}: DeviceListItemProps) {
  const theme = useAppTheme();

  return (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      mode="contained"
      onPress={onPress}
    >
      <Card.Content style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameBlock}>
            <View style={styles.nameRow}>
              <Text
                variant="titleMedium"
                style={[styles.name, { color: theme.colors.onSurface }]}
                numberOfLines={1}
              >
                {device.name}
              </Text>
              {openRequestCount > 0 && (
                <Badge
                  size={20}
                  style={[styles.countBadge, { backgroundColor: brand.gold, color: '#2D2D2D' }]}
                >
                  {openRequestCount}
                </Badge>
              )}
            </View>
            <View
              style={[styles.typeBadge, { backgroundColor: theme.colors.surfaceVariant }]}
            >
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {device.type}
              </Text>
            </View>
          </View>
          <StatusIndicator status={device.status} />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

        <View style={styles.bottomRow}>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
            numberOfLines={1}
          >
            {device.location}
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {formatDate(device.lastMaintenanceDate)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
  },
  content: {
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameBlock: {
    flex: 1,
    gap: 6,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontWeight: '600',
    flexShrink: 1,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  countBadge: {
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
