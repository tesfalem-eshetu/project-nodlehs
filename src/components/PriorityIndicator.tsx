import { Text, StyleSheet } from 'react-native';
import { Priority } from '@/types';

const LABELS: Record<Priority, string> = {
  [Priority.Critical]: 'Critical',
  [Priority.High]: 'High',
  [Priority.Medium]: 'Medium',
  [Priority.Low]: 'Low',
};

const COLORS: Record<Priority, string> = {
  [Priority.Critical]: '#b71c1c',
  [Priority.High]: '#e65100',
  [Priority.Medium]: '#f9a825',
  [Priority.Low]: '#558b2f',
};

interface PriorityIndicatorProps {
  priority: Priority;
}

export default function PriorityIndicator({ priority }: PriorityIndicatorProps) {
  return (
    <Text style={[styles.text, { color: COLORS[priority] }]}>
      {LABELS[priority]}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
