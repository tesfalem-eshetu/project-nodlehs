import { View, StyleSheet } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import type { ServiceRequest } from '@/types';
import { useAppTheme } from '@/theme';
import StatusIndicator from './StatusIndicator';
import PriorityIndicator from './PriorityIndicator';

interface ServiceRequestListItemProps {
  serviceRequest: ServiceRequest;
  onPress: () => void;
}

export default function ServiceRequestListItem({
  serviceRequest,
  onPress,
}: ServiceRequestListItemProps) {
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
        <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
          {serviceRequest.title}
        </Text>
        <View style={styles.row}>
          <StatusIndicator status={serviceRequest.status} />
          <PriorityIndicator priority={serviceRequest.priority} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {new Date(serviceRequest.createdAt).toLocaleDateString()}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
