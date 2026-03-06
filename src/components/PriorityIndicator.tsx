import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Priority } from '@/types';
import { useAppTheme } from '@/theme';
import { priority as priorityColors, priorityDark } from '@/theme/colors';

const LABELS: Record<Priority, string> = {
  [Priority.Critical]: 'Critical',
  [Priority.High]: 'High',
  [Priority.Medium]: 'Medium',
  [Priority.Low]: 'Low',
};

interface PriorityIndicatorProps {
  priority: Priority;
}

export default function PriorityIndicator({ priority }: PriorityIndicatorProps) {
  const theme = useAppTheme();
  const palette = theme.dark ? priorityDark : priorityColors;
  const colors = palette[priority];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {LABELS[priority]}
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
