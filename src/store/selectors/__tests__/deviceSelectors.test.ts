import {
  selectAllDevices,
  selectDeviceById,
  selectDevicesStatus,
  selectDevicesError,
} from '../deviceSelectors';
import { DeviceStatus } from '@/types';
import type { Device } from '@/types';
import type { RootState } from '@/store';

function makeDevice(overrides: Partial<Device> & { id: string }): Device {
  return {
    name: 'Test Device',
    type: 'HVAC',
    status: DeviceStatus.Online,
    location: 'Building A',
    lastSeen: '2026-03-01T00:00:00.000Z',
    lastMaintenanceDate: null,
    ...overrides,
  };
}

function makeState(items: Device[]): RootState {
  const normalized: Record<string, Device> = {};
  for (const d of items) {
    normalized[d.id] = d;
  }
  return {
    devices: {
      items: normalized,
      status: 'succeeded',
      error: null,
      _rollback: {},
    },
    serviceRequests: {
      items: {},
      status: 'succeeded',
      error: null,
      _rollback: {},
    },
  };
}

describe('selectAllDevices', () => {
  it('returns all devices as an array', () => {
    const state = makeState([
      makeDevice({ id: 'd-1' }),
      makeDevice({ id: 'd-2' }),
      makeDevice({ id: 'd-3' }),
    ]);
    const result = selectAllDevices(state);
    expect(result).toHaveLength(3);
    expect(result.map((d) => d.id).sort()).toEqual(['d-1', 'd-2', 'd-3']);
  });

  it('returns empty array when no devices exist', () => {
    const state = makeState([]);
    expect(selectAllDevices(state)).toEqual([]);
  });
});

describe('selectDeviceById', () => {
  it('returns the matching device', () => {
    const state = makeState([makeDevice({ id: 'd-1', name: 'Chiller Unit' })]);
    const result = selectDeviceById(state, 'd-1');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Chiller Unit');
  });

  it('returns null for a non-existent id', () => {
    const state = makeState([]);
    expect(selectDeviceById(state, 'nope')).toBeNull();
  });
});

describe('selectDevicesStatus', () => {
  it('returns the current loading status', () => {
    const state = makeState([]);
    expect(selectDevicesStatus(state)).toBe('succeeded');
  });

  it('reflects different status values', () => {
    const state = makeState([]);
    state.devices.status = 'loading';
    expect(selectDevicesStatus(state)).toBe('loading');
  });
});

describe('selectDevicesError', () => {
  it('returns null when no error', () => {
    const state = makeState([]);
    expect(selectDevicesError(state)).toBeNull();
  });

  it('returns the error string when present', () => {
    const state = makeState([]);
    state.devices.error = 'Network failure';
    expect(selectDevicesError(state)).toBe('Network failure');
  });
});
