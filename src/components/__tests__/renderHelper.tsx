import React from 'react';
import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { lightTheme } from '@/theme';

export function renderWithTheme(ui: React.ReactElement) {
  return render(
    <PaperProvider theme={lightTheme}>{ui}</PaperProvider>,
  );
}
