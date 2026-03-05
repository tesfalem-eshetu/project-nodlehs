import { Text, StyleSheet } from 'react-native';
import { DeviceStatus, ServiceRequestStatus } from '@/types';

type StatusValue = DeviceStatus | ServiceRequestStatus;

const LABELS: Record<StatusValue, string> = {
  [DeviceStatus.Online]: 'Online',
  [DeviceStatus.Offline]: 'Offline',
  [DeviceStatus.Warning]: 'Warning',
  [ServiceRequestStatus.Open]: 'Open',
  [ServiceRequestStatus.InProgress]: 'In Progress',
  [ServiceRequestStatus.Completed]: 'Completed',
  [ServiceRequestStatus.Cancelled]: 'Cancelled',
};

const COLORS: Record<StatusValue, string> = {
  [DeviceStatus.Online]: '#2e7d32',
  [DeviceStatus.Offline]: '#c62828',
  [DeviceStatus.Warning]: '#ef6c00',
  [ServiceRequestStatus.Open]: '#1565c0',
  [ServiceRequestStatus.InProgress]: '#ef6c00',
  [ServiceRequestStatus.Completed]: '#2e7d32',
  [ServiceRequestStatus.Cancelled]: '#757575',
};

interface StatusIndicatorProps {
  status: StatusValue;
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  return (
    <Text style={[styles.text, { color: COLORS[status] }]}>
      {LABELS[status]}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
