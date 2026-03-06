import 'react-native-get-random-values';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
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
import { lightTheme, darkTheme } from '@/theme';
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
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

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
      <PaperProvider theme={theme}>
        <DataLoader />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.onSurface,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false, headerBackTitle: 'Back' }} />
          <Stack.Screen name="device/[id]" options={{ title: '', headerBackTitle: 'Back' }} />
          <Stack.Screen name="service-request/create" options={{ title: '', headerBackTitle: 'Back' }} />
          <Stack.Screen name="service-request/[id]" options={{ title: '', headerBackTitle: 'Back' }} />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </PaperProvider>
    </Provider>
  );
}
