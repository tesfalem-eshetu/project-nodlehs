import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@/theme';
import { brand } from '@/theme/colors';

export default function TabLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
        tabBarActiveTintColor: brand.gold,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Equipment',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="devices" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
