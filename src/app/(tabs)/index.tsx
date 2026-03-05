import { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Searchbar, Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import useEquipmentList from '@/hooks/useEquipmentList';
import DeviceListItem from '@/components/DeviceListItem';

export default function EquipmentListScreen() {
  const router = useRouter();
  const { devices, status, openCounts } = useEquipmentList();
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

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (status === 'failed') {
    return (
      <View style={styles.center}>
        <Text>Failed to load devices</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by name, type, or location"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredDevices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DeviceListItem
            device={item}
            openRequestCount={openCounts[item.id] ?? 0}
            onPress={() => router.push(`/device/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No devices found</Text>
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
    margin: 8,
  },
});
