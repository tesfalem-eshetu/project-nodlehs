import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { ActivityEntry } from '@/types';

interface ActivityLogEntryProps {
  entry: ActivityEntry;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

const TYPE_LABELS: Record<ActivityEntry['type'], string> = {
  status_change: 'Status Change',
  note: 'Note',
};

export default function ActivityLogEntryComponent({ entry }: ActivityLogEntryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="labelSmall" style={styles.type}>
          {TYPE_LABELS[entry.type]}
        </Text>
        <Text variant="bodySmall" style={styles.timestamp}>
          {formatTimestamp(entry.timestamp)}
        </Text>
      </View>
      <Text variant="bodyMedium">{entry.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  type: {
    fontWeight: '700',
    color: '#424242',
  },
  timestamp: {
    color: '#757575',
  },
});
