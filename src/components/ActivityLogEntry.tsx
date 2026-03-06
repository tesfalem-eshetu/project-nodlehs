import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { ActivityEntry } from '@/types';
import { useAppTheme } from '@/theme';
import { brand } from '@/theme/colors';

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

const BORDER_COLORS: Record<ActivityEntry['type'], string> = {
  status_change: brand.teal,
  note: brand.gold,
};

export default function ActivityLogEntryComponent({ entry }: ActivityLogEntryProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderLeftColor: BORDER_COLORS[entry.type],
          backgroundColor: theme.colors.surface,
        },
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
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 14,
    paddingRight: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderLeftWidth: 3,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  type: {
    fontWeight: '700',
  },
});
