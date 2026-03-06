import { View, FlatList, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/store';
import { selectDeviceById } from '@/store/selectors/deviceSelectors';
import { useAppTheme } from '@/theme';
import {
  status as statusColors,
  statusDark,
  priority as priorityColors,
  priorityDark,
} from '@/theme/colors';
import { ServiceRequestStatus, Priority, Category } from '@/types';
import type { ServiceRequest } from '@/types';
import useDashboardData from '@/hooks/useDashboardData';
import useRefreshData from '@/hooks/useRefreshData';
import StatusIndicator from '@/components/StatusIndicator';
import PriorityIndicator from '@/components/PriorityIndicator';

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.Repair]: 'Repair',
  [Category.PreventiveMaintenance]: 'Preventive',
  [Category.Inspection]: 'Inspection',
  [Category.Replacement]: 'Replacement',
};

function StatCard({
  value,
  label,
  textColor,
  bgColor,
  borderColor,
}: {
  value: number;
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}) {
  const theme = useAppTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: bgColor, borderLeftColor: borderColor }]}>
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.sectionHeaderRow}>
      <Text
        variant="labelLarge"
        style={[styles.sectionHeaderText, { color: theme.colors.onSurfaceVariant }]}
      >
        {title}
      </Text>
    </View>
  );
}

function OverdueCard({
  item,
  onPress,
}: {
  item: ServiceRequest;
  onPress: () => void;
}) {
  const theme = useAppTheme();
  const device = useAppSelector((state) => selectDeviceById(state, item.deviceId));

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.overdueCard,
        { backgroundColor: theme.colors.surface, borderLeftColor: theme.colors.error, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.overdueTop}>
        <View style={styles.overdueTitleBlock}>
          <Text
            variant="titleSmall"
            style={[styles.overdueTitle, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {device && (
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
              numberOfLines={1}
            >
              {device.name}
            </Text>
          )}
        </View>
        <View style={[styles.categoryChip, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {CATEGORY_LABELS[item.category]}
          </Text>
        </View>
      </View>

      <View style={[styles.overdueDivider, { backgroundColor: theme.colors.outlineVariant }]} />

      <View style={styles.overdueBottom}>
        <View style={styles.badges}>
          <StatusIndicator status={item.status} />
          <PriorityIndicator priority={item.priority} />
        </View>
        <Text variant="bodySmall" style={{ color: theme.colors.error, fontWeight: '600' }}>
          Due {new Date(item.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </Text>
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { statusCounts, priorityCounts, overdueRequests, status } = useDashboardData();
  const { refreshing, onRefresh } = useRefreshData();

  const sp = theme.dark ? statusDark : statusColors;
  const pp = theme.dark ? priorityDark : priorityColors;

  if (status === 'loading' && overdueRequests.length === 0 && statusCounts.open === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      data={overdueRequests}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={({ item }) => (
        <OverdueCard
          item={item}
          onPress={() => router.push(`/service-request/${item.id}`)}
        />
      )}
      ListHeaderComponent={
        <View>
          <SectionHeader title="Status Summary" />
          <View style={styles.grid}>
            <StatCard
              value={statusCounts.open}
              label="Open"
              textColor={sp[ServiceRequestStatus.Open].text}
              bgColor={sp[ServiceRequestStatus.Open].bg}
              borderColor={sp[ServiceRequestStatus.Open].text}
            />
            <StatCard
              value={statusCounts.inProgress}
              label="In Progress"
              textColor={sp[ServiceRequestStatus.InProgress].text}
              bgColor={sp[ServiceRequestStatus.InProgress].bg}
              borderColor={sp[ServiceRequestStatus.InProgress].text}
            />
            <StatCard
              value={statusCounts.completed}
              label="Completed"
              textColor={sp[ServiceRequestStatus.Completed].text}
              bgColor={sp[ServiceRequestStatus.Completed].bg}
              borderColor={sp[ServiceRequestStatus.Completed].text}
            />
            <StatCard
              value={statusCounts.cancelled}
              label="Cancelled"
              textColor={sp[ServiceRequestStatus.Cancelled].text}
              bgColor={sp[ServiceRequestStatus.Cancelled].bg}
              borderColor={sp[ServiceRequestStatus.Cancelled].text}
            />
          </View>

          <SectionHeader title="Priority Breakdown" />
          <View style={styles.grid}>
            <StatCard
              value={priorityCounts.critical}
              label="Critical"
              textColor={pp[Priority.Critical].text}
              bgColor={pp[Priority.Critical].bg}
              borderColor={pp[Priority.Critical].text}
            />
            <StatCard
              value={priorityCounts.high}
              label="High"
              textColor={pp[Priority.High].text}
              bgColor={pp[Priority.High].bg}
              borderColor={pp[Priority.High].text}
            />
            <StatCard
              value={priorityCounts.medium}
              label="Medium"
              textColor={pp[Priority.Medium].text}
              bgColor={pp[Priority.Medium].bg}
              borderColor={pp[Priority.Medium].text}
            />
            <StatCard
              value={priorityCounts.low}
              label="Low"
              textColor={pp[Priority.Low].text}
              bgColor={pp[Priority.Low].bg}
              borderColor={pp[Priority.Low].text}
            />
          </View>

          <View style={styles.overdueHeader}>
            <Text
              variant="labelLarge"
              style={[styles.sectionHeaderText, { color: theme.colors.onSurfaceVariant }]}
            >
              Overdue Requests
            </Text>
            {overdueRequests.length > 0 && (
              <View style={[styles.overdueBadge, { backgroundColor: theme.colors.error }]}>
                <Text style={styles.overdueBadgeText}>{overdueRequests.length}</Text>
              </View>
            )}
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyOverdue}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            No overdue requests
          </Text>
        </View>
      }
    />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeaderRow: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionHeaderText: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  overdueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 10,
  },
  overdueBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  overdueBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  overdueCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  overdueTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  overdueTitleBlock: {
    flex: 1,
    gap: 2,
    marginRight: 10,
  },
  overdueTitle: {
    fontWeight: '600',
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },
  overdueDivider: {
    height: StyleSheet.hairlineWidth,
  },
  overdueBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyOverdue: {
    padding: 24,
    alignItems: 'center',
  },
});
