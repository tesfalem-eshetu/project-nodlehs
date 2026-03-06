import { DeviceStatus, ServiceRequestStatus, Priority } from '@/types';

export const brand = {
  gold: '#EFC01A',
  goldLight: '#FFD53F',
  goldDark: '#C9A000',
  teal: '#4B8189',
  tealLight: '#6A9FA7',
  tealDark: '#35616A',
};

export const light = {
  background: '#F0F4F8',
  surface: '#FFFFFF',
  surfaceVariant: '#E8EDF2',
  text: '#2D2D2D',
  textSecondary: '#5A6A7A',
  textMuted: '#869AB8',
  outline: '#C8D1DC',
  divider: '#DDE3EB',
  error: '#C62828',
  errorContainer: '#FDECEA',
};

export const dark = {
  background: '#121E22',
  surface: '#1A2F33',
  surfaceVariant: '#243D42',
  text: '#E8EDF2',
  textSecondary: '#A0B0C0',
  textMuted: '#6E8090',
  outline: '#3A5058',
  divider: '#2E464D',
  error: '#EF5350',
  errorContainer: '#3B1C1C',
};

export const status: Record<DeviceStatus | ServiceRequestStatus, { text: string; bg: string }> = {
  [DeviceStatus.Online]: { text: '#1B8A2E', bg: '#E6F5E9' },
  [DeviceStatus.Offline]: { text: '#C62828', bg: '#FDECEA' },
  [DeviceStatus.Warning]: { text: '#E07000', bg: '#FFF3E0' },
  [ServiceRequestStatus.Open]: { text: '#1565C0', bg: '#E3F2FD' },
  [ServiceRequestStatus.InProgress]: { text: '#E07000', bg: '#FFF3E0' },
  [ServiceRequestStatus.Completed]: { text: '#1B8A2E', bg: '#E6F5E9' },
  [ServiceRequestStatus.Cancelled]: { text: '#6E7A88', bg: '#ECEFF3' },
};

export const statusDark: Record<DeviceStatus | ServiceRequestStatus, { text: string; bg: string }> = {
  [DeviceStatus.Online]: { text: '#66D97A', bg: '#1A3320' },
  [DeviceStatus.Offline]: { text: '#EF5350', bg: '#3B1C1C' },
  [DeviceStatus.Warning]: { text: '#FFB74D', bg: '#3B2810' },
  [ServiceRequestStatus.Open]: { text: '#64B5F6', bg: '#102840' },
  [ServiceRequestStatus.InProgress]: { text: '#FFB74D', bg: '#3B2810' },
  [ServiceRequestStatus.Completed]: { text: '#66D97A', bg: '#1A3320' },
  [ServiceRequestStatus.Cancelled]: { text: '#90A4AE', bg: '#263238' },
};

export const priority: Record<Priority, { text: string; bg: string }> = {
  [Priority.Critical]: { text: '#C62828', bg: '#FDECEA' },
  [Priority.High]: { text: '#E65100', bg: '#FFF3E0' },
  [Priority.Medium]: { text: '#C9A000', bg: '#FFF8E1' },
  [Priority.Low]: { text: '#2E7D32', bg: '#E6F5E9' },
};

export const priorityDark: Record<Priority, { text: string; bg: string }> = {
  [Priority.Critical]: { text: '#EF5350', bg: '#3B1C1C' },
  [Priority.High]: { text: '#FF8A65', bg: '#3B2010' },
  [Priority.Medium]: { text: '#FFD53F', bg: '#3B3010' },
  [Priority.Low]: { text: '#66D97A', bg: '#1A3320' },
};
