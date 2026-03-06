import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { ActivityEntry } from '@/types';
import { useAppTheme } from '@/theme';

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
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        { borderBottomColor: theme.colors.outlineVariant },
      ]}
    >
      <View style={styles.header}>
        <Text
          variant="labelSmall"
          style={[styles.type, { color: theme.colors.primary }]}
        >
          {TYPE_LABELS[entry.type]}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {formatTimestamp(entry.timestamp)}
        </Text>
      </View>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
        {entry.content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  type: {
    fontWeight: '700',
  },
});
