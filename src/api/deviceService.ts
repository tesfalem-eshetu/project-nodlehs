import type { Device } from '@/types';
import { seedDevices } from '@/constants/seed';
import { delay } from './utils';

const devices: Device[] = [...seedDevices];

export function fetchDevices(): Promise<Device[]> {
  return delay([...devices]);
}

export function fetchDeviceById(id: string): Promise<Device> {
  const device = devices.find((d) => d.id === id);
  if (!device) {
    return Promise.reject(new Error(`Device with id "${id}" not found`));
  }
  return delay({ ...device });
}

export function updateDeviceLastMaintenance(
  id: string,
  date: string,
): Promise<Device> {
  const index = devices.findIndex((d) => d.id === id);
  if (index === -1) {
    return Promise.reject(new Error(`Device with id "${id}" not found`));
  }
  devices[index] = { ...devices[index], lastMaintenanceDate: date };
  return delay({ ...devices[index] });
}
