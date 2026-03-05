import 'react-native-get-random-values';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { store, useAppDispatch } from '@/store';
import { fetchDevices } from '@/store/thunks/deviceThunks';
import { fetchServiceRequests } from '@/store/thunks/serviceRequestThunks';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function DataLoader() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchDevices());
    dispatch(fetchServiceRequests());
  }, [dispatch]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PaperProvider>
        <DataLoader />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="device/[id]" options={{ title: 'Device Details' }} />
          <Stack.Screen name="service-request/create" options={{ title: 'New Service Request' }} />
          <Stack.Screen name="service-request/[id]" options={{ title: 'Service Request' }} />
        </Stack>
        <StatusBar style="auto" />
      </PaperProvider>
    </Provider>
  );
}
