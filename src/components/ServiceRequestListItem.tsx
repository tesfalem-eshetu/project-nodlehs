import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import type { ServiceRequest } from '@/types';
import { Category } from '@/types';
import { useAppTheme } from '@/theme';
import StatusIndicator from './StatusIndicator';
import PriorityIndicator from './PriorityIndicator';

interface ServiceRequestListItemProps {
  serviceRequest: ServiceRequest;
  onPress: () => void;
}

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.Repair]: 'Repair',
  [Category.PreventiveMaintenance]: 'Preventive',
  [Category.Inspection]: 'Inspection',
  [Category.Replacement]: 'Replacement',
};

export default function ServiceRequestListItem({
  serviceRequest,
  onPress,
}: ServiceRequestListItemProps) {
  const theme = useAppTheme();

  return (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      mode="contained"
      onPress={onPress}
    >
      <Card.Content style={styles.content}>
        <View style={styles.topRow}>
          <Text
            variant="titleSmall"
            style={[styles.title, { color: theme.colors.onSurface }]}
            numberOfLines={2}
          >
            {serviceRequest.title}
          </Text>
          <View style={[styles.categoryChip, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {CATEGORY_LABELS[serviceRequest.category]}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

        <View style={styles.bottomRow}>
          <View style={styles.badges}>
            <StatusIndicator status={serviceRequest.status} />
            <PriorityIndicator priority={serviceRequest.priority} />
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {new Date(serviceRequest.scheduledDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
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
  title: {
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
