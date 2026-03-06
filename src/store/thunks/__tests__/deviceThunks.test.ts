import { configureStore } from '@reduxjs/toolkit';
import devicesReducer from '@/store/slices/devicesSlice';
import serviceRequestsReducer from '@/store/slices/serviceRequestsSlice';
import { fetchDevices, fetchDeviceById } from '../deviceThunks';
import { DeviceStatus } from '@/types';
import type { Device } from '@/types';

jest.mock('@/api/deviceService');
jest.mock('@/api/serviceRequestService');

import * as deviceService from '@/api/deviceService';

const mockedDeviceService = deviceService as jest.Mocked<typeof deviceService>;

function createTestStore() {
  return configureStore({
    reducer: {
      devices: devicesReducer,
      serviceRequests: serviceRequestsReducer,
    },
  });
}

const sampleDevice: Device = {
  id: 'device-1',
  name: 'HVAC Unit A',
  type: 'HVAC',
  status: DeviceStatus.Online,
  location: 'Building A',
  lastSeen: '2026-03-01T00:00:00.000Z',
  lastMaintenanceDate: null,
};

describe('fetchDevices', () => {
  it('sets status to loading then succeeded, and populates items', async () => {
    const devices = [sampleDevice, { ...sampleDevice, id: 'device-2', name: 'Chiller' }];
    mockedDeviceService.fetchDevices.mockResolvedValue(devices);

    const store = createTestStore();

    expect(store.getState().devices.status).toBe('idle');

    const promise = store.dispatch(fetchDevices());

    expect(store.getState().devices.status).toBe('loading');

    await promise;

    const state = store.getState().devices;
    expect(state.status).toBe('succeeded');
    expect(state.error).toBeNull();
    expect(Object.keys(state.items)).toHaveLength(2);
    expect(state.items['device-1'].name).toBe('HVAC Unit A');
    expect(state.items['device-2'].name).toBe('Chiller');
  });

  it('sets status to failed and stores error message on rejection', async () => {
    mockedDeviceService.fetchDevices.mockRejectedValue(new Error('Network error'));

    const store = createTestStore();
    await store.dispatch(fetchDevices());

    const state = store.getState().devices;
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Network error');
  });
});

describe('fetchDeviceById', () => {
  it('adds the fetched device to state', async () => {
    mockedDeviceService.fetchDeviceById.mockResolvedValue(sampleDevice);

    const store = createTestStore();
    await store.dispatch(fetchDeviceById('device-1'));

    const state = store.getState().devices;
    expect(state.items['device-1']).toEqual(sampleDevice);
  });

  it('does not alter state on rejection', async () => {
    mockedDeviceService.fetchDeviceById.mockRejectedValue(
      new Error('Device with id "bad" not found'),
    );

    const store = createTestStore();
    await store.dispatch(fetchDeviceById('bad'));

    expect(Object.keys(store.getState().devices.items)).toHaveLength(0);
  });
});
