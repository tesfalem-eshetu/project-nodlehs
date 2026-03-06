import { fireEvent } from '@testing-library/react-native';
import { DeviceStatus } from '@/types';
import type { Device } from '@/types';
import DeviceListItem from '../DeviceListItem';
import { renderWithTheme } from './renderHelper';

const baseDevice: Device = {
  id: 'd-1',
  name: 'HVAC Unit A',
  type: 'HVAC',
  status: DeviceStatus.Online,
  location: 'Building A, Floor 2',
  lastSeen: '2026-03-01T00:00:00.000Z',
  lastMaintenanceDate: '2026-02-15T00:00:00.000Z',
};

describe('DeviceListItem', () => {
  it('renders device name, type, and location', () => {
    const { getByText } = renderWithTheme(
      <DeviceListItem device={baseDevice} openRequestCount={0} onPress={jest.fn()} />,
    );

    expect(getByText('HVAC Unit A')).toBeTruthy();
    expect(getByText('HVAC')).toBeTruthy();
    expect(getByText('Building A, Floor 2')).toBeTruthy();
  });

  it('renders the status indicator', () => {
    const { getByText } = renderWithTheme(
      <DeviceListItem device={baseDevice} openRequestCount={0} onPress={jest.fn()} />,
    );

    expect(getByText('Online')).toBeTruthy();
  });

  it('renders formatted last maintenance date', () => {
    const { getByText } = renderWithTheme(
      <DeviceListItem device={baseDevice} openRequestCount={0} onPress={jest.fn()} />,
    );

    expect(getByText(/Feb/)).toBeTruthy();
  });

  it('renders "No history" when lastMaintenanceDate is null', () => {
    const device = { ...baseDevice, lastMaintenanceDate: null };
    const { getByText } = renderWithTheme(
      <DeviceListItem device={device} openRequestCount={0} onPress={jest.fn()} />,
    );

    expect(getByText('No history')).toBeTruthy();
  });

  it('shows open request count badge when count > 0', () => {
    const { getByText } = renderWithTheme(
      <DeviceListItem device={baseDevice} openRequestCount={3} onPress={jest.fn()} />,
    );

    expect(getByText('3')).toBeTruthy();
  });

  it('hides badge when open request count is 0', () => {
    const { queryByText } = renderWithTheme(
      <DeviceListItem device={baseDevice} openRequestCount={0} onPress={jest.fn()} />,
    );

    expect(queryByText('0')).toBeNull();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <DeviceListItem device={baseDevice} openRequestCount={0} onPress={onPress} />,
    );

    fireEvent.press(getByText('HVAC Unit A'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
