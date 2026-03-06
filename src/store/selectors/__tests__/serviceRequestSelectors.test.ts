import {
  selectAllServiceRequests,
  selectServiceRequestById,
  selectRequestsByDeviceId,
  selectOpenRequestCountByDeviceId,
  selectOpenRequestCountsMap,
  selectOverdueRequests,
  selectCountsByStatus,
  selectCountsByPriority,
  selectServiceRequestsStatus,
  selectServiceRequestsError,
} from '../serviceRequestSelectors';
import {
  ServiceRequestStatus,
  Priority,
  Category,
} from '@/types';
import type { ServiceRequest } from '@/types';
import type { RootState } from '@/store';

function makeSR(overrides: Partial<ServiceRequest> & { id: string }): ServiceRequest {
  return {
    deviceId: 'device-1',
    title: 'Test',
    description: 'Test description',
    priority: Priority.Medium,
    category: Category.Repair,
    status: ServiceRequestStatus.Open,
    scheduledDate: '2026-04-01T00:00:00.000Z',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
    activityLog: [],
    ...overrides,
  };
}

function makeState(items: ServiceRequest[]): RootState {
  const normalized: Record<string, ServiceRequest> = {};
  for (const sr of items) {
    normalized[sr.id] = sr;
  }
  return {
    serviceRequests: {
      items: normalized,
      status: 'succeeded',
      error: null,
      _rollback: {},
    },
    devices: {
      items: {},
      status: 'succeeded',
      error: null,
      _rollback: {},
    },
  };
}

describe('selectAllServiceRequests', () => {
  it('returns all service requests as an array', () => {
    const state = makeState([
      makeSR({ id: 'sr-1' }),
      makeSR({ id: 'sr-2' }),
    ]);
    const result = selectAllServiceRequests(state);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id).sort()).toEqual(['sr-1', 'sr-2']);
  });

  it('returns empty array when no items exist', () => {
    const state = makeState([]);
    expect(selectAllServiceRequests(state)).toEqual([]);
  });
});

describe('selectServiceRequestById', () => {
  it('returns the matching service request', () => {
    const state = makeState([makeSR({ id: 'sr-1', title: 'Fix HVAC' })]);
    const result = selectServiceRequestById(state, 'sr-1');
    expect(result).not.toBeNull();
    expect(result!.title).toBe('Fix HVAC');
  });

  it('returns null for a non-existent id', () => {
    const state = makeState([]);
    expect(selectServiceRequestById(state, 'nope')).toBeNull();
  });
});

describe('selectRequestsByDeviceId', () => {
  it('returns only requests for the given device, sorted newest first', () => {
    const state = makeState([
      makeSR({ id: 'sr-1', deviceId: 'device-1', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeSR({ id: 'sr-2', deviceId: 'device-2', createdAt: '2026-02-01T00:00:00.000Z' }),
      makeSR({ id: 'sr-3', deviceId: 'device-1', createdAt: '2026-03-01T00:00:00.000Z' }),
    ]);
    const result = selectRequestsByDeviceId(state, 'device-1');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('sr-3');
    expect(result[1].id).toBe('sr-1');
  });

  it('returns empty array when no requests match', () => {
    const state = makeState([makeSR({ id: 'sr-1', deviceId: 'device-1' })]);
    expect(selectRequestsByDeviceId(state, 'device-99')).toEqual([]);
  });
});

describe('selectOpenRequestCountByDeviceId', () => {
  it('counts only open requests for the given device', () => {
    const state = makeState([
      makeSR({ id: 'sr-1', deviceId: 'device-1', status: ServiceRequestStatus.Open }),
      makeSR({ id: 'sr-2', deviceId: 'device-1', status: ServiceRequestStatus.InProgress }),
      makeSR({ id: 'sr-3', deviceId: 'device-1', status: ServiceRequestStatus.Open }),
      makeSR({ id: 'sr-4', deviceId: 'device-2', status: ServiceRequestStatus.Open }),
    ]);
    expect(selectOpenRequestCountByDeviceId(state, 'device-1')).toBe(2);
  });

  it('returns 0 when no open requests exist', () => {
    const state = makeState([
      makeSR({ id: 'sr-1', deviceId: 'device-1', status: ServiceRequestStatus.Completed }),
    ]);
    expect(selectOpenRequestCountByDeviceId(state, 'device-1')).toBe(0);
  });
});

describe('selectOpenRequestCountsMap', () => {
  it('builds a map of device id to open request count', () => {
    const state = makeState([
      makeSR({ id: 'sr-1', deviceId: 'device-1', status: ServiceRequestStatus.Open }),
      makeSR({ id: 'sr-2', deviceId: 'device-1', status: ServiceRequestStatus.Open }),
      makeSR({ id: 'sr-3', deviceId: 'device-2', status: ServiceRequestStatus.Open }),
      makeSR({ id: 'sr-4', deviceId: 'device-1', status: ServiceRequestStatus.Completed }),
      makeSR({ id: 'sr-5', deviceId: 'device-3', status: ServiceRequestStatus.Cancelled }),
    ]);
    const result = selectOpenRequestCountsMap(state);
    expect(result).toEqual({ 'device-1': 2, 'device-2': 1 });
  });

  it('returns empty object when no open requests exist', () => {
    const state = makeState([
      makeSR({ id: 'sr-1', status: ServiceRequestStatus.Completed }),
    ]);
    expect(selectOpenRequestCountsMap(state)).toEqual({});
  });
});

describe('selectOverdueRequests', () => {
  it('returns requests with past scheduled dates that are not completed or cancelled', () => {
    const pastDate = '2020-01-01T00:00:00.000Z';
    const futureDate = '2030-01-01T00:00:00.000Z';

    const state = makeState([
      makeSR({ id: 'sr-1', scheduledDate: pastDate, status: ServiceRequestStatus.Open }),
      makeSR({ id: 'sr-2', scheduledDate: pastDate, status: ServiceRequestStatus.InProgress }),
      makeSR({ id: 'sr-3', scheduledDate: pastDate, status: ServiceRequestStatus.Completed }),
      makeSR({ id: 'sr-4', scheduledDate: pastDate, status: ServiceRequestStatus.Cancelled }),
      makeSR({ id: 'sr-5', scheduledDate: futureDate, status: ServiceRequestStatus.Open }),
    ]);

    const result = selectOverdueRequests(state);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id).sort()).toEqual(['sr-1', 'sr-2']);
  });

  it('returns empty array when nothing is overdue', () => {
    const state = makeState([
      makeSR({ id: 'sr-1', scheduledDate: '2030-01-01T00:00:00.000Z', status: ServiceRequestStatus.Open }),
    ]);
    expect(selectOverdueRequests(state)).toEqual([]);
  });
});

describe('selectCountsByStatus', () => {
  it('counts each status correctly', () => {
    const state = makeState([
      makeSR({ id: 'sr-1', status: ServiceRequestStatus.Open }),
      makeSR({ id: 'sr-2', status: ServiceRequestStatus.Open }),
      makeSR({ id: 'sr-3', status: ServiceRequestStatus.InProgress }),
      makeSR({ id: 'sr-4', status: ServiceRequestStatus.Completed }),
      makeSR({ id: 'sr-5', status: ServiceRequestStatus.Completed }),
      makeSR({ id: 'sr-6', status: ServiceRequestStatus.Completed }),
      makeSR({ id: 'sr-7', status: ServiceRequestStatus.Cancelled }),
    ]);
    expect(selectCountsByStatus(state)).toEqual({
      open: 2,
      inProgress: 1,
      completed: 3,
      cancelled: 1,
    });
  });

  it('returns all zeros for empty state', () => {
    const state = makeState([]);
    expect(selectCountsByStatus(state)).toEqual({
      open: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    });
  });
});

describe('selectCountsByPriority', () => {
  it('counts each priority correctly', () => {
    const state = makeState([
      makeSR({ id: 'sr-1', priority: Priority.Critical }),
      makeSR({ id: 'sr-2', priority: Priority.High }),
      makeSR({ id: 'sr-3', priority: Priority.High }),
      makeSR({ id: 'sr-4', priority: Priority.Medium }),
      makeSR({ id: 'sr-5', priority: Priority.Low }),
      makeSR({ id: 'sr-6', priority: Priority.Low }),
      makeSR({ id: 'sr-7', priority: Priority.Low }),
    ]);
    expect(selectCountsByPriority(state)).toEqual({
      critical: 1,
      high: 2,
      medium: 1,
      low: 3,
    });
  });

  it('returns all zeros for empty state', () => {
    const state = makeState([]);
    expect(selectCountsByPriority(state)).toEqual({
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    });
  });
});

describe('selectServiceRequestsStatus', () => {
  it('returns the current loading status', () => {
    const state = makeState([]);
    expect(selectServiceRequestsStatus(state)).toBe('succeeded');
  });
});

describe('selectServiceRequestsError', () => {
  it('returns null when no error', () => {
    const state = makeState([]);
    expect(selectServiceRequestsError(state)).toBeNull();
  });
});
