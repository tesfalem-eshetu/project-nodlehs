import { DeviceStatus, ServiceRequestStatus } from '@/types';
import StatusIndicator from '../StatusIndicator';
import { renderWithTheme } from './renderHelper';

describe('StatusIndicator', () => {
  it.each([
    [DeviceStatus.Online, 'Online'],
    [DeviceStatus.Offline, 'Offline'],
    [DeviceStatus.Warning, 'Warning'],
    [ServiceRequestStatus.Open, 'Open'],
    [ServiceRequestStatus.InProgress, 'In Progress'],
    [ServiceRequestStatus.Completed, 'Completed'],
    [ServiceRequestStatus.Cancelled, 'Cancelled'],
  ] as const)('renders label "%s" as "%s"', (status, label) => {
    const { getByText } = renderWithTheme(<StatusIndicator status={status} />);
    expect(getByText(label)).toBeTruthy();
  });
});
