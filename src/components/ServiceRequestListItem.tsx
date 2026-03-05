import { View, StyleSheet } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import type { ServiceRequest } from '@/types';
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
  return (
    <TouchableRipple onPress={onPress} style={styles.container}>
      <View style={styles.inner}>
        <Text variant="titleSmall">{serviceRequest.title}</Text>
        <View style={styles.row}>
          <StatusIndicator status={serviceRequest.status} />
          <PriorityIndicator priority={serviceRequest.priority} />
          <Text variant="bodySmall" style={styles.date}>
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
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  inner: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  date: {
    color: '#757575',
  },
});
