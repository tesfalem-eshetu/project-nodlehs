import reducer, { DevicesState } from '../devicesSlice';
import { fetchDevices, fetchDeviceById } from '@/store/thunks/deviceThunks';
import { updateServiceRequestStatus } from '@/store/thunks/serviceRequestThunks';
import { DeviceStatus, ServiceRequestStatus } from '@/types';
import type { Device } from '@/types';

jest.mock('@/api/serviceRequestService');
jest.mock('@/api/deviceService');

function makeDevice(overrides: Partial<Device> & { id: string }): Device {
  return {
    name: 'HVAC Unit',
    type: 'HVAC',
    status: DeviceStatus.Online,
    location: 'Building A',
    lastSeen: '2026-03-01T00:00:00.000Z',
    lastMaintenanceDate: null,
    ...overrides,
  };
}

function stateWith(items: Device[]): DevicesState {
  const normalized: Record<string, Device> = {};
  for (const d of items) {
    normalized[d.id] = d;
  }
  return { items: normalized, status: 'succeeded', error: null, _rollback: {} };
}

const META = { requestId: 'req-1', requestStatus: 'pending' as const };

describe('devicesSlice reducer', () => {
  it('returns initial state', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({
      items: {},
      status: 'idle',
      error: null,
      _rollback: {},
    });
  });

  describe('fetchDevices', () => {
    it('pending sets loading and clears error', () => {
      const prev: DevicesState = {
        items: {},
        status: 'failed',
        error: 'old',
        _rollback: {},
      };
      const next = reducer(prev, { type: fetchDevices.pending.type });
      expect(next.status).toBe('loading');
      expect(next.error).toBeNull();
    });

    it('fulfilled normalizes payload and sets succeeded', () => {
      const d = makeDevice({ id: 'd-1' });
      const next = reducer(
        { items: {}, status: 'loading', error: null, _rollback: {} },
        { type: fetchDevices.fulfilled.type, payload: [d] },
      );
      expect(next.status).toBe('succeeded');
      expect(next.items['d-1']).toEqual(d);
    });

    it('fulfilled replaces existing items entirely', () => {
      const prev = stateWith([makeDevice({ id: 'd-old' })]);
      const next = reducer(prev, {
        type: fetchDevices.fulfilled.type,
        payload: [makeDevice({ id: 'd-new' })],
      });
      expect(next.items['d-old']).toBeUndefined();
      expect(next.items['d-new']).toBeDefined();
    });

    it('rejected sets failed status and error message', () => {
      const next = reducer(
        { items: {}, status: 'loading', error: null, _rollback: {} },
        { type: fetchDevices.rejected.type, error: { message: 'Timeout' } },
      );
      expect(next.status).toBe('failed');
      expect(next.error).toBe('Timeout');
    });

    it('rejected uses fallback message when error.message is undefined', () => {
      const next = reducer(
        { items: {}, status: 'loading', error: null, _rollback: {} },
        { type: fetchDevices.rejected.type, error: {} },
      );
      expect(next.error).toBe('Failed to fetch devices');
    });
  });

  describe('fetchDeviceById', () => {
    it('fulfilled adds device to state', () => {
      const d = makeDevice({ id: 'd-1' });
      const next = reducer(stateWith([]), {
        type: fetchDeviceById.fulfilled.type,
        payload: d,
      });
      expect(next.items['d-1']).toEqual(d);
    });

    it('fulfilled updates an existing device', () => {
      const original = makeDevice({ id: 'd-1', name: 'Old' });
      const updated = makeDevice({ id: 'd-1', name: 'Updated' });
      const next = reducer(stateWith([original]), {
        type: fetchDeviceById.fulfilled.type,
        payload: updated,
      });
      expect(next.items['d-1'].name).toBe('Updated');
    });
  });

  describe('updateServiceRequestStatus cross-slice optimistic update', () => {
    const device = makeDevice({ id: 'device-1', lastMaintenanceDate: null });

    it('pending with Completed status updates lastMaintenanceDate optimistically', () => {
      const next = reducer(stateWith([device]), {
        type: updateServiceRequestStatus.pending.type,
        meta: {
          ...META,
          arg: { id: 'sr-1', status: ServiceRequestStatus.Completed, deviceId: 'device-1' },
        },
      });

      expect(next.items['device-1'].lastMaintenanceDate).not.toBeNull();
      expect(next._rollback['device-1']).toBeDefined();
      expect(next._rollback['device-1'].lastMaintenanceDate).toBeNull();
    });

    it('pending with non-Completed status does not touch device state', () => {
      const next = reducer(stateWith([device]), {
        type: updateServiceRequestStatus.pending.type,
        meta: {
          ...META,
          arg: { id: 'sr-1', status: ServiceRequestStatus.InProgress, deviceId: 'device-1' },
        },
      });

      expect(next.items['device-1'].lastMaintenanceDate).toBeNull();
      expect(next._rollback['device-1']).toBeUndefined();
    });

    it('pending with Completed but missing device is a no-op', () => {
      const next = reducer(stateWith([device]), {
        type: updateServiceRequestStatus.pending.type,
        meta: {
          ...META,
          arg: { id: 'sr-1', status: ServiceRequestStatus.Completed, deviceId: 'device-missing' },
        },
      });

      expect(next._rollback['device-missing']).toBeUndefined();
    });

    it('fulfilled with device payload replaces device and clears rollback', () => {
      const serverDevice = makeDevice({
        id: 'device-1',
        lastMaintenanceDate: '2026-03-05T12:00:00.000Z',
      });

      const withRollback: DevicesState = {
        ...stateWith([device]),
        _rollback: { 'device-1': device },
      };

      const next = reducer(withRollback, {
        type: updateServiceRequestStatus.fulfilled.type,
        payload: { serviceRequest: {} as any, device: serverDevice },
        meta: {
          ...META,
          requestStatus: 'fulfilled' as const,
          arg: { id: 'sr-1', status: ServiceRequestStatus.Completed, deviceId: 'device-1' },
        },
      });

      expect(next.items['device-1'].lastMaintenanceDate).toBe('2026-03-05T12:00:00.000Z');
      expect(next._rollback['device-1']).toBeUndefined();
    });

    it('fulfilled without device payload still clears rollback', () => {
      const withRollback: DevicesState = {
        ...stateWith([device]),
        _rollback: { 'device-1': device },
      };

      const next = reducer(withRollback, {
        type: updateServiceRequestStatus.fulfilled.type,
        payload: { serviceRequest: {} as any, device: null },
        meta: {
          ...META,
          requestStatus: 'fulfilled' as const,
          arg: { id: 'sr-1', status: ServiceRequestStatus.InProgress, deviceId: 'device-1' },
        },
      });

      expect(next._rollback['device-1']).toBeUndefined();
    });

    it('rejected restores device from rollback', () => {
      const optimistic = makeDevice({
        id: 'device-1',
        lastMaintenanceDate: '2026-03-05T00:00:00.000Z',
      });

      const withRollback: DevicesState = {
        items: { 'device-1': optimistic },
        status: 'succeeded',
        error: null,
        _rollback: { 'device-1': device },
      };

      const next = reducer(withRollback, {
        type: updateServiceRequestStatus.rejected.type,
        error: { message: 'fail' },
        meta: {
          ...META,
          requestStatus: 'rejected' as const,
          arg: { id: 'sr-1', status: ServiceRequestStatus.Completed, deviceId: 'device-1' },
          rejectedWithValue: false,
          aborted: false,
          condition: false,
        },
      });

      expect(next.items['device-1'].lastMaintenanceDate).toBeNull();
      expect(next._rollback['device-1']).toBeUndefined();
    });

    it('rejected is safe when no rollback data exists', () => {
      const next = reducer(stateWith([device]), {
        type: updateServiceRequestStatus.rejected.type,
        error: { message: 'fail' },
        meta: {
          ...META,
          requestStatus: 'rejected' as const,
          arg: { id: 'sr-1', status: ServiceRequestStatus.InProgress, deviceId: 'device-1' },
          rejectedWithValue: false,
          aborted: false,
          condition: false,
        },
      });

      expect(next.items['device-1'].lastMaintenanceDate).toBeNull();
    });
  });
});
