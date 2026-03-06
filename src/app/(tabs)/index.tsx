import { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Searchbar, Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme';
import useEquipmentList from '@/hooks/useEquipmentList';
import useRefreshData from '@/hooks/useRefreshData';
import DeviceListItem from '@/components/DeviceListItem';

export default function EquipmentListScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { devices, status, openCounts } = useEquipmentList();
  const { refreshing, onRefresh } = useRefreshData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDevices = useMemo(() => {
    if (!searchQuery.trim()) return devices;
    const query = searchQuery.toLowerCase();
    return devices.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.type.toLowerCase().includes(query) ||
        d.location.toLowerCase().includes(query),
    );
  }, [devices, searchQuery]);

  if (status === 'loading' && devices.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (status === 'failed' && devices.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.onBackground }}>Failed to load devices</Text>
      </View>
    );
  }

  const countLabel = searchQuery.trim()
    ? `${filteredDevices.length} of ${devices.length} devices`
    : `${devices.length} devices`;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search by name, type, or location"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={[styles.searchbar, { backgroundColor: theme.colors.surface, marginTop: insets.top + 12 }]}
        inputStyle={{ color: theme.colors.onSurface }}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        iconColor={theme.colors.onSurfaceVariant}
      />
      <FlatList
        data={filteredDevices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <Text
            variant="labelMedium"
            style={[styles.countLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            {countLabel}
          </Text>
        }
        renderItem={({ item }) => (
          <DeviceListItem
            device={item}
            openRequestCount={openCounts[item.id] ?? 0}
            onPress={() => router.push(`/device/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text
              variant="bodyLarge"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              No devices found
            </Text>
            {searchQuery.trim() !== '' && (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
              >
                Try a different search term
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  searchbar: {
    marginHorizontal: 16,
    marginBottom: 4,
    elevation: 0,
    borderRadius: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  countLabel: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 16,
  },
});
