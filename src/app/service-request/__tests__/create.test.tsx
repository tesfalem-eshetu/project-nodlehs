import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { lightTheme } from '@/theme';

const mockBack = jest.fn();
const mockUnwrap = jest.fn();
const mockDispatch = jest.fn(() => ({ unwrap: mockUnwrap }));

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ deviceId: 'device-1' })),
  useRouter: () => ({ back: mockBack }),
  Stack: { Screen: () => null },
}));

jest.mock('@/store', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@/store/thunks/serviceRequestThunks', () => ({
  createServiceRequest: jest.fn((payload: unknown) => ({
    type: 'serviceRequests/create',
    payload,
  })),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const insets = { top: 0, bottom: 0, left: 0, right: 0 };
  const frame = { x: 0, y: 0, width: 390, height: 844 };
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaConsumer: ({ children }: { children: (insets: any) => React.ReactNode }) => children(insets),
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
    SafeAreaInsetsContext: {
      Consumer: ({ children }: { children: (insets: any) => React.ReactNode }) => children(insets),
      Provider: ({ children }: { children: React.ReactNode }) => children,
    },
    SafeAreaFrameContext: {
      Consumer: ({ children }: { children: (frame: any) => React.ReactNode }) => children(frame),
      Provider: ({ children }: { children: React.ReactNode }) => children,
    },
    initialWindowMetrics: { insets, frame },
  };
});

jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="date-picker" {...props} />,
  };
});

import CreateServiceRequestScreen from '../create';
import { useLocalSearchParams } from 'expo-router';

function renderScreen() {
  return render(
    <PaperProvider theme={lightTheme}>
      <CreateServiceRequestScreen />
    </PaperProvider>,
  );
}

afterEach(() => {
  jest.clearAllMocks();
  (useLocalSearchParams as jest.Mock).mockReturnValue({ deviceId: 'device-1' });
});

describe('CreateServiceRequestScreen', () => {
  describe('missing deviceId', () => {
    it('shows "No device selected" when deviceId is absent', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({});
      const { getByText } = renderScreen();
      expect(getByText('No device selected')).toBeTruthy();
    });
  });

  describe('form validation', () => {
    it('shows title error when submitting with empty title', async () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('Create Service Request'));

      await waitFor(() => {
        expect(getByText('Title is required')).toBeTruthy();
      });
    });

    it('shows description error when submitting with empty description', async () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('Create Service Request'));

      await waitFor(() => {
        expect(getByText('Description is required')).toBeTruthy();
      });
    });

    it('shows both errors when both fields are empty', async () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('Create Service Request'));

      await waitFor(() => {
        expect(getByText('Title is required')).toBeTruthy();
        expect(getByText('Description is required')).toBeTruthy();
      });
    });

    it('treats whitespace-only input as empty', async () => {
      const { getByText, getAllByDisplayValue } = renderScreen();

      const inputs = getAllByDisplayValue('');
      fireEvent.changeText(inputs[0], '   ');
      fireEvent.changeText(inputs[1], '   ');

      fireEvent.press(getByText('Create Service Request'));

      await waitFor(() => {
        expect(getByText('Title is required')).toBeTruthy();
        expect(getByText('Description is required')).toBeTruthy();
      });
    });

    it('does not dispatch when validation fails', async () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('Create Service Request'));

      await waitFor(() => {
        expect(getByText('Title is required')).toBeTruthy();
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('clears title error when user types in title field', async () => {
      const { getByText, getAllByDisplayValue, queryByText } = renderScreen();

      fireEvent.press(getByText('Create Service Request'));

      await waitFor(() => {
        expect(getByText('Title is required')).toBeTruthy();
      });

      const inputs = getAllByDisplayValue('');
      fireEvent.changeText(inputs[0], 'Fix HVAC');

      await waitFor(() => {
        expect(queryByText('Title is required')).toBeNull();
      });
    });

    it('clears description error when user types in description field', async () => {
      const { getByText, getAllByDisplayValue, queryByText } = renderScreen();

      fireEvent.press(getByText('Create Service Request'));

      await waitFor(() => {
        expect(getByText('Description is required')).toBeTruthy();
      });

      const titleInput = getAllByDisplayValue('');
      fireEvent.changeText(titleInput[0], 'Title');

      const descInputs = getAllByDisplayValue('');
      fireEvent.changeText(descInputs[0], 'Some description');

      await waitFor(() => {
        expect(queryByText('Description is required')).toBeNull();
      });
    });
  });

  describe('successful submission', () => {
    it('dispatches createServiceRequest and navigates back on success', async () => {
      mockUnwrap.mockResolvedValue({});

      const { getByText, getAllByDisplayValue } = renderScreen();

      const inputs = getAllByDisplayValue('');
      fireEvent.changeText(inputs[0], 'Fix compressor');
      fireEvent.changeText(inputs[1], 'Compressor is leaking');

      fireEvent.press(getByText('Create Service Request'));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(mockBack).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('failed submission', () => {
    it('shows form-level error when dispatch rejects', async () => {
      mockUnwrap.mockRejectedValue(new Error('Server error'));

      const { getByText, getAllByDisplayValue } = renderScreen();

      const inputs = getAllByDisplayValue('');
      fireEvent.changeText(inputs[0], 'Fix compressor');
      fireEvent.changeText(inputs[1], 'Compressor is leaking');

      fireEvent.press(getByText('Create Service Request'));

      await waitFor(() => {
        expect(getByText('Failed to create service request')).toBeTruthy();
      });

      expect(mockBack).not.toHaveBeenCalled();
    });
  });
});
