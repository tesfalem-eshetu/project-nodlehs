import { configureStore } from '@reduxjs/toolkit';
import devicesReducer from '@/store/slices/devicesSlice';
import serviceRequestsReducer from '@/store/slices/serviceRequestsSlice';
import {
  fetchServiceRequests,
  createServiceRequest,
  updateServiceRequestStatus,
  addNoteToServiceRequest,
} from '../serviceRequestThunks';
import {
  ServiceRequestStatus,
  Priority,
  Category,
  DeviceStatus,
} from '@/types';
import type { ServiceRequest, Device } from '@/types';

jest.mock('@/api/serviceRequestService');
jest.mock('@/api/deviceService');

import * as serviceRequestService from '@/api/serviceRequestService';
import * as deviceService from '@/api/deviceService';

const mockedSRService = serviceRequestService as jest.Mocked<typeof serviceRequestService>;
const mockedDeviceService = deviceService as jest.Mocked<typeof deviceService>;

afterEach(() => {
  jest.clearAllMocks();
});

function createTestStore() {
  return configureStore({
    reducer: {
      devices: devicesReducer,
      serviceRequests: serviceRequestsReducer,
    },
  });
}

const sampleSR: ServiceRequest = {
  id: 'sr-1',
  deviceId: 'device-1',
  title: 'Fix compressor',
  description: 'Compressor is failing',
  priority: Priority.High,
  category: Category.Repair,
  status: ServiceRequestStatus.Open,
  scheduledDate: '2026-04-01T00:00:00.000Z',
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-01T00:00:00.000Z',
  activityLog: [
    {
      id: 'act-1',
      timestamp: '2026-03-01T00:00:00.000Z',
      type: 'status_change',
      content: 'Service request created with status: Open',
    },
  ],
};

const sampleDevice: Device = {
  id: 'device-1',
  name: 'HVAC Unit A',
  type: 'HVAC',
  status: DeviceStatus.Online,
  location: 'Building A',
  lastSeen: '2026-03-01T00:00:00.000Z',
  lastMaintenanceDate: null,
};

describe('fetchServiceRequests', () => {
  it('sets status to loading then succeeded, and populates items', async () => {
    mockedSRService.fetchServiceRequests.mockResolvedValue([sampleSR]);

    const store = createTestStore();
    const promise = store.dispatch(fetchServiceRequests());

    expect(store.getState().serviceRequests.status).toBe('loading');

    await promise;

    const state = store.getState().serviceRequests;
    expect(state.status).toBe('succeeded');
    expect(state.error).toBeNull();
    expect(Object.keys(state.items)).toHaveLength(1);
    expect(state.items['sr-1'].title).toBe('Fix compressor');
  });

  it('sets status to failed on rejection', async () => {
    mockedSRService.fetchServiceRequests.mockRejectedValue(new Error('Timeout'));

    const store = createTestStore();
    await store.dispatch(fetchServiceRequests());

    const state = store.getState().serviceRequests;
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Timeout');
  });
});

describe('createServiceRequest', () => {
  it('adds the new service request to state', async () => {
    const created: ServiceRequest = {
      ...sampleSR,
      id: 'sr-new',
      title: 'New request',
    };
    mockedSRService.createServiceRequest.mockResolvedValue(created);

    const store = createTestStore();
    await store.dispatch(
      createServiceRequest({
        deviceId: 'device-1',
        title: 'New request',
        description: 'desc',
        priority: Priority.Medium,
        category: Category.Inspection,
        scheduledDate: '2026-04-10T00:00:00.000Z',
      }),
    );

    expect(store.getState().serviceRequests.items['sr-new']).toBeDefined();
    expect(store.getState().serviceRequests.items['sr-new'].title).toBe('New request');
  });
});

describe('updateServiceRequestStatus', () => {
  function storeWithSR() {
    const store = createTestStore();
    store.dispatch({
      type: 'serviceRequests/fetchAll/fulfilled',
      payload: [sampleSR],
    });
    store.dispatch({
      type: 'devices/fetchDevices/fulfilled',
      payload: [sampleDevice],
    });
    return store;
  }

  it('applies optimistic update on pending, then replaces with server data on fulfilled', async () => {
    const updatedSR: ServiceRequest = {
      ...sampleSR,
      status: ServiceRequestStatus.InProgress,
      updatedAt: '2026-03-05T00:00:00.000Z',
      activityLog: [
        ...sampleSR.activityLog,
        {
          id: 'act-server',
          timestamp: '2026-03-05T00:00:00.000Z',
          type: 'status_change',
          content: 'Status changed to: In Progress',
        },
      ],
    };

    mockedSRService.updateServiceRequestStatus.mockResolvedValue(updatedSR);

    const store = storeWithSR();
    const promise = store.dispatch(
      updateServiceRequestStatus({
        id: 'sr-1',
        status: ServiceRequestStatus.InProgress,
        deviceId: 'device-1',
      }),
    );

    const pendingState = store.getState().serviceRequests;
    expect(pendingState.items['sr-1'].status).toBe(ServiceRequestStatus.InProgress);
    expect(pendingState._rollback['sr-1']).toBeDefined();
    expect(pendingState._rollback['sr-1'].status).toBe(ServiceRequestStatus.Open);

    await promise;

    const fulfilledState = store.getState().serviceRequests;
    expect(fulfilledState.items['sr-1'].status).toBe(ServiceRequestStatus.InProgress);
    expect(fulfilledState.items['sr-1'].updatedAt).toBe('2026-03-05T00:00:00.000Z');
    expect(fulfilledState._rollback['sr-1']).toBeUndefined();
  });

  it('triggers device lastMaintenanceDate update when status is Completed', async () => {
    const inProgressSR: ServiceRequest = {
      ...sampleSR,
      status: ServiceRequestStatus.InProgress,
    };

    const completedSR: ServiceRequest = {
      ...inProgressSR,
      status: ServiceRequestStatus.Completed,
      updatedAt: '2026-03-05T12:00:00.000Z',
    };

    const updatedDevice: Device = {
      ...sampleDevice,
      lastMaintenanceDate: '2026-03-05T12:00:00.000Z',
    };

    mockedSRService.updateServiceRequestStatus.mockResolvedValue(completedSR);
    mockedDeviceService.updateDeviceLastMaintenance.mockResolvedValue(updatedDevice);

    const store = createTestStore();
    store.dispatch({
      type: 'serviceRequests/fetchAll/fulfilled',
      payload: [inProgressSR],
    });
    store.dispatch({
      type: 'devices/fetchDevices/fulfilled',
      payload: [sampleDevice],
    });

    await store.dispatch(
      updateServiceRequestStatus({
        id: 'sr-1',
        status: ServiceRequestStatus.Completed,
        deviceId: 'device-1',
      }),
    );

    expect(mockedDeviceService.updateDeviceLastMaintenance).toHaveBeenCalledWith(
      'device-1',
      completedSR.updatedAt,
    );

    const deviceState = store.getState().devices;
    expect(deviceState.items['device-1'].lastMaintenanceDate).toBe('2026-03-05T12:00:00.000Z');
    expect(deviceState._rollback['device-1']).toBeUndefined();
  });

  it('does not call device update for non-Completed transitions', async () => {
    const updatedSR: ServiceRequest = {
      ...sampleSR,
      status: ServiceRequestStatus.InProgress,
    };

    mockedSRService.updateServiceRequestStatus.mockResolvedValue(updatedSR);

    const store = storeWithSR();
    await store.dispatch(
      updateServiceRequestStatus({
        id: 'sr-1',
        status: ServiceRequestStatus.InProgress,
        deviceId: 'device-1',
      }),
    );

    expect(mockedDeviceService.updateDeviceLastMaintenance).not.toHaveBeenCalled();
  });

  it('rolls back optimistic update on rejection', async () => {
    mockedSRService.updateServiceRequestStatus.mockRejectedValue(
      new Error('Invalid transition'),
    );

    const store = storeWithSR();

    await store.dispatch(
      updateServiceRequestStatus({
        id: 'sr-1',
        status: ServiceRequestStatus.Completed,
        deviceId: 'device-1',
      }),
    );

    const state = store.getState().serviceRequests;
    expect(state.items['sr-1'].status).toBe(ServiceRequestStatus.Open);
    expect(state._rollback['sr-1']).toBeUndefined();
  });
});

describe('addNoteToServiceRequest', () => {
  function storeWithSR() {
    const store = createTestStore();
    store.dispatch({
      type: 'serviceRequests/fetchAll/fulfilled',
      payload: [sampleSR],
    });
    return store;
  }

  it('applies optimistic note on pending, then replaces with server data on fulfilled', async () => {
    const withNote: ServiceRequest = {
      ...sampleSR,
      updatedAt: '2026-03-05T00:00:00.000Z',
      activityLog: [
        ...sampleSR.activityLog,
        {
          id: 'act-server-note',
          timestamp: '2026-03-05T00:00:00.000Z',
          type: 'note',
          content: 'Checked filters',
        },
      ],
    };

    mockedSRService.addNoteToServiceRequest.mockResolvedValue(withNote);

    const store = storeWithSR();
    const promise = store.dispatch(
      addNoteToServiceRequest({ id: 'sr-1', content: 'Checked filters' }),
    );

    const pendingState = store.getState().serviceRequests;
    const pendingSR = pendingState.items['sr-1'];
    expect(pendingSR.activityLog).toHaveLength(2);
    expect(pendingSR.activityLog[1].type).toBe('note');
    expect(pendingSR.activityLog[1].content).toBe('Checked filters');
    expect(pendingState._rollback['sr-1']).toBeDefined();

    await promise;

    const fulfilledState = store.getState().serviceRequests;
    expect(fulfilledState.items['sr-1'].updatedAt).toBe('2026-03-05T00:00:00.000Z');
    expect(fulfilledState._rollback['sr-1']).toBeUndefined();
  });

  it('rolls back note on rejection', async () => {
    mockedSRService.addNoteToServiceRequest.mockRejectedValue(
      new Error('Server error'),
    );

    const store = storeWithSR();
    await store.dispatch(
      addNoteToServiceRequest({ id: 'sr-1', content: 'Will be rolled back' }),
    );

    const state = store.getState().serviceRequests;
    expect(state.items['sr-1'].activityLog).toHaveLength(1);
    expect(state._rollback['sr-1']).toBeUndefined();
  });
});
