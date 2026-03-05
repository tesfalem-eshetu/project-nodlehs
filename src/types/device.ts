export enum DeviceStatus {
  Online = 'online',
  Offline = 'offline',
  Warning = 'warning',
}

export interface Device {
  id: string;
  name: string;
  type: string;
  status: DeviceStatus;
  location: string;
  lastSeen: string;
  lastMaintenanceDate: string | null;
}
