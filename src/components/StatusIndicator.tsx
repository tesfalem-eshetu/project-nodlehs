import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { DeviceStatus, ServiceRequestStatus } from '@/types';
import { useAppTheme } from '@/theme';
import { status as statusColors, statusDark } from '@/theme/colors';

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

interface StatusIndicatorProps {
  status: StatusValue;
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const theme = useAppTheme();
  const palette = theme.dark ? statusDark : statusColors;
  const colors = palette[status];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
