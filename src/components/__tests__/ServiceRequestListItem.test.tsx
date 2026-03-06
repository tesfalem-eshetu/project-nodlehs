import { fireEvent } from '@testing-library/react-native';
import {
  ServiceRequestStatus,
  Priority,
  Category,
} from '@/types';
import type { ServiceRequest } from '@/types';
import ServiceRequestListItem from '../ServiceRequestListItem';
import { renderWithTheme } from './renderHelper';

const baseSR: ServiceRequest = {
  id: 'sr-1',
  deviceId: 'device-1',
  title: 'Fix compressor leak',
  description: 'Compressor is leaking refrigerant',
  priority: Priority.High,
  category: Category.Repair,
  status: ServiceRequestStatus.Open,
  scheduledDate: '2026-04-15T00:00:00.000Z',
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-01T00:00:00.000Z',
  activityLog: [],
};

describe('ServiceRequestListItem', () => {
  it('renders title and category label', () => {
    const { getByText } = renderWithTheme(
      <ServiceRequestListItem serviceRequest={baseSR} onPress={jest.fn()} />,
    );

    expect(getByText('Fix compressor leak')).toBeTruthy();
    expect(getByText('Repair')).toBeTruthy();
  });

  it('renders status and priority indicators', () => {
    const { getByText } = renderWithTheme(
      <ServiceRequestListItem serviceRequest={baseSR} onPress={jest.fn()} />,
    );

    expect(getByText('Open')).toBeTruthy();
    expect(getByText('High')).toBeTruthy();
  });

  it('renders the formatted scheduled date', () => {
    const { getByText } = renderWithTheme(
      <ServiceRequestListItem serviceRequest={baseSR} onPress={jest.fn()} />,
    );

    expect(getByText(/Apr/)).toBeTruthy();
  });

  it.each([
    [Category.Repair, 'Repair'],
    [Category.PreventiveMaintenance, 'Preventive'],
    [Category.Inspection, 'Inspection'],
    [Category.Replacement, 'Replacement'],
  ] as const)('maps category %s to label "%s"', (cat, label) => {
    const sr = { ...baseSR, category: cat };
    const { getByText } = renderWithTheme(
      <ServiceRequestListItem serviceRequest={sr} onPress={jest.fn()} />,
    );

    expect(getByText(label)).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <ServiceRequestListItem serviceRequest={baseSR} onPress={onPress} />,
    );

    fireEvent.press(getByText('Fix compressor leak'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
