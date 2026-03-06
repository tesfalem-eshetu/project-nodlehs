import reducer, { ServiceRequestsState } from '../serviceRequestsSlice';
import {
  fetchServiceRequests,
  createServiceRequest,
  updateServiceRequestStatus,
  addNoteToServiceRequest,
} from '@/store/thunks/serviceRequestThunks';
import { ServiceRequestStatus, Priority, Category } from '@/types';
import type { ServiceRequest } from '@/types';

jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

jest.mock('@/api/serviceRequestService');
jest.mock('@/api/deviceService');

function makeSR(overrides: Partial<ServiceRequest> & { id: string }): ServiceRequest {
  return {
    deviceId: 'device-1',
    title: 'Test SR',
    description: 'desc',
    priority: Priority.Medium,
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
        content: 'Created',
      },
    ],
    ...overrides,
  };
}

function stateWith(items: ServiceRequest[]): ServiceRequestsState {
  const normalized: Record<string, ServiceRequest> = {};
  for (const sr of items) {
    normalized[sr.id] = sr;
  }
  return { items: normalized, status: 'succeeded', error: null, _rollback: {} };
}

const META = { requestId: 'req-1', requestStatus: 'pending' as const };

describe('serviceRequestsSlice reducer', () => {
  it('returns initial state', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({
      items: {},
      status: 'idle',
      error: null,
      _rollback: {},
    });
  });

  describe('fetchServiceRequests', () => {
    it('pending sets loading and clears error', () => {
      const prev: ServiceRequestsState = {
        items: {},
        status: 'failed',
        error: 'old error',
        _rollback: {},
      };
      const next = reducer(prev, { type: fetchServiceRequests.pending.type });
      expect(next.status).toBe('loading');
      expect(next.error).toBeNull();
    });

    it('fulfilled normalizes payload and sets succeeded', () => {
      const sr = makeSR({ id: 'sr-1' });
      const next = reducer(
        { items: {}, status: 'loading', error: null, _rollback: {} },
        { type: fetchServiceRequests.fulfilled.type, payload: [sr] },
      );
      expect(next.status).toBe('succeeded');
      expect(next.items['sr-1']).toEqual(sr);
    });

    it('fulfilled replaces existing items entirely', () => {
      const prev = stateWith([makeSR({ id: 'sr-old' })]);
      const newSR = makeSR({ id: 'sr-new' });
      const next = reducer(prev, {
        type: fetchServiceRequests.fulfilled.type,
        payload: [newSR],
      });
      expect(next.items['sr-old']).toBeUndefined();
      expect(next.items['sr-new']).toBeDefined();
    });

    it('rejected sets failed status and error message', () => {
      const next = reducer(
        { items: {}, status: 'loading', error: null, _rollback: {} },
        {
          type: fetchServiceRequests.rejected.type,
          error: { message: 'Network down' },
        },
      );
      expect(next.status).toBe('failed');
      expect(next.error).toBe('Network down');
    });

    it('rejected uses fallback message when error.message is undefined', () => {
      const next = reducer(
        { items: {}, status: 'loading', error: null, _rollback: {} },
        { type: fetchServiceRequests.rejected.type, error: {} },
      );
      expect(next.error).toBe('Failed to fetch service requests');
    });
  });

  describe('createServiceRequest', () => {
    it('fulfilled adds the new item to state', () => {
      const sr = makeSR({ id: 'sr-new' });
      const next = reducer(stateWith([]), {
        type: createServiceRequest.fulfilled.type,
        payload: sr,
      });
      expect(next.items['sr-new']).toEqual(sr);
    });

    it('fulfilled does not remove existing items', () => {
      const existing = makeSR({ id: 'sr-1' });
      const created = makeSR({ id: 'sr-2' });
      const next = reducer(stateWith([existing]), {
        type: createServiceRequest.fulfilled.type,
        payload: created,
      });
      expect(Object.keys(next.items)).toHaveLength(2);
    });
  });

  describe('updateServiceRequestStatus optimistic update', () => {
    const sr = makeSR({ id: 'sr-1', status: ServiceRequestStatus.Open });

    it('pending applies optimistic status change and activity log entry', () => {
      const next = reducer(stateWith([sr]), {
        type: updateServiceRequestStatus.pending.type,
        meta: {
          ...META,
          arg: { id: 'sr-1', status: ServiceRequestStatus.InProgress, deviceId: 'device-1' },
        },
      });

      expect(next.items['sr-1'].status).toBe(ServiceRequestStatus.InProgress);
      expect(next.items['sr-1'].activityLog).toHaveLength(2);
      expect(next.items['sr-1'].activityLog[1].type).toBe('status_change');
      expect(next.items['sr-1'].activityLog[1].content).toContain('open');
      expect(next.items['sr-1'].activityLog[1].content).toContain('in_progress');
      expect(next.items['sr-1'].activityLog[1].id).toBe('mock-uuid');
    });

    it('pending saves original state to _rollback', () => {
      const next = reducer(stateWith([sr]), {
        type: updateServiceRequestStatus.pending.type,
        meta: {
          ...META,
          arg: { id: 'sr-1', status: ServiceRequestStatus.InProgress, deviceId: 'device-1' },
        },
      });

      expect(next._rollback['sr-1']).toBeDefined();
      expect(next._rollback['sr-1'].status).toBe(ServiceRequestStatus.Open);
      expect(next._rollback['sr-1'].activityLog).toHaveLength(1);
    });

    it('pending is a no-op for non-existent id', () => {
      const prev = stateWith([sr]);
      const next = reducer(prev, {
        type: updateServiceRequestStatus.pending.type,
        meta: {
          ...META,
          arg: { id: 'sr-missing', status: ServiceRequestStatus.InProgress, deviceId: 'device-1' },
        },
      });

      expect(next.items['sr-1'].status).toBe(ServiceRequestStatus.Open);
      expect(next._rollback).toEqual({});
    });

    it('pending updates the updatedAt timestamp', () => {
      const next = reducer(stateWith([sr]), {
        type: updateServiceRequestStatus.pending.type,
        meta: {
          ...META,
          arg: { id: 'sr-1', status: ServiceRequestStatus.InProgress, deviceId: 'device-1' },
        },
      });

      expect(next.items['sr-1'].updatedAt).not.toBe(sr.updatedAt);
    });

    it('fulfilled replaces with server data and clears rollback', () => {
      const serverSR = makeSR({
        id: 'sr-1',
        status: ServiceRequestStatus.InProgress,
        updatedAt: '2026-03-05T00:00:00.000Z',
      });

      const withRollback: ServiceRequestsState = {
        ...stateWith([sr]),
        _rollback: { 'sr-1': sr },
      };

      const next = reducer(withRollback, {
        type: updateServiceRequestStatus.fulfilled.type,
        payload: { serviceRequest: serverSR, device: null },
        meta: {
          ...META,
          requestStatus: 'fulfilled' as const,
          arg: { id: 'sr-1', status: ServiceRequestStatus.InProgress, deviceId: 'device-1' },
        },
      });

      expect(next.items['sr-1'].updatedAt).toBe('2026-03-05T00:00:00.000Z');
      expect(next._rollback['sr-1']).toBeUndefined();
    });

    it('rejected restores from rollback', () => {
      const optimistic = makeSR({ id: 'sr-1', status: ServiceRequestStatus.InProgress });
      const withRollback: ServiceRequestsState = {
        items: { 'sr-1': optimistic },
        status: 'succeeded',
        error: null,
        _rollback: { 'sr-1': sr },
      };

      const next = reducer(withRollback, {
        type: updateServiceRequestStatus.rejected.type,
        error: { message: 'Invalid transition' },
        meta: {
          ...META,
          requestStatus: 'rejected' as const,
          arg: { id: 'sr-1', status: ServiceRequestStatus.InProgress, deviceId: 'device-1' },
          rejectedWithValue: false,
          aborted: false,
          condition: false,
        },
      });

      expect(next.items['sr-1'].status).toBe(ServiceRequestStatus.Open);
      expect(next._rollback['sr-1']).toBeUndefined();
    });

    it('rejected is safe when no rollback data exists', () => {
      const prev = stateWith([sr]);
      const next = reducer(prev, {
        type: updateServiceRequestStatus.rejected.type,
        error: { message: 'error' },
        meta: {
          ...META,
          requestStatus: 'rejected' as const,
          arg: { id: 'sr-1', status: ServiceRequestStatus.InProgress, deviceId: 'device-1' },
          rejectedWithValue: false,
          aborted: false,
          condition: false,
        },
      });

      expect(next.items['sr-1'].status).toBe(ServiceRequestStatus.Open);
    });
  });

  describe('addNoteToServiceRequest optimistic update', () => {
    const sr = makeSR({ id: 'sr-1' });

    it('pending appends optimistic note to activity log', () => {
      const next = reducer(stateWith([sr]), {
        type: addNoteToServiceRequest.pending.type,
        meta: {
          ...META,
          arg: { id: 'sr-1', content: 'Checked the filters' },
        },
      });

      expect(next.items['sr-1'].activityLog).toHaveLength(2);
      const note = next.items['sr-1'].activityLog[1];
      expect(note.type).toBe('note');
      expect(note.content).toBe('Checked the filters');
      expect(note.id).toBe('mock-uuid');
    });

    it('pending saves original to _rollback', () => {
      const next = reducer(stateWith([sr]), {
        type: addNoteToServiceRequest.pending.type,
        meta: {
          ...META,
          arg: { id: 'sr-1', content: 'note' },
        },
      });

      expect(next._rollback['sr-1']).toBeDefined();
      expect(next._rollback['sr-1'].activityLog).toHaveLength(1);
    });

    it('pending does not mutate the original activity log array in rollback', () => {
      const next = reducer(stateWith([sr]), {
        type: addNoteToServiceRequest.pending.type,
        meta: {
          ...META,
          arg: { id: 'sr-1', content: 'note' },
        },
      });

      expect(next._rollback['sr-1'].activityLog).not.toBe(next.items['sr-1'].activityLog);
      expect(next._rollback['sr-1'].activityLog).toHaveLength(1);
      expect(next.items['sr-1'].activityLog).toHaveLength(2);
    });

    it('pending is a no-op for non-existent id', () => {
      const prev = stateWith([sr]);
      const next = reducer(prev, {
        type: addNoteToServiceRequest.pending.type,
        meta: {
          ...META,
          arg: { id: 'sr-missing', content: 'note' },
        },
      });

      expect(next._rollback).toEqual({});
    });

    it('pending updates the updatedAt timestamp', () => {
      const next = reducer(stateWith([sr]), {
        type: addNoteToServiceRequest.pending.type,
        meta: {
          ...META,
          arg: { id: 'sr-1', content: 'note' },
        },
      });

      expect(next.items['sr-1'].updatedAt).not.toBe(sr.updatedAt);
    });

    it('fulfilled replaces with server data and clears rollback', () => {
      const serverSR = makeSR({
        id: 'sr-1',
        updatedAt: '2026-03-05T10:00:00.000Z',
        activityLog: [
          ...sr.activityLog,
          {
            id: 'act-server',
            timestamp: '2026-03-05T10:00:00.000Z',
            type: 'note' as const,
            content: 'Checked the filters',
          },
        ],
      });

      const withRollback: ServiceRequestsState = {
        ...stateWith([sr]),
        _rollback: { 'sr-1': sr },
      };

      const next = reducer(withRollback, {
        type: addNoteToServiceRequest.fulfilled.type,
        payload: serverSR,
        meta: {
          ...META,
          requestStatus: 'fulfilled' as const,
          arg: { id: 'sr-1', content: 'Checked the filters' },
        },
      });

      expect(next.items['sr-1'].updatedAt).toBe('2026-03-05T10:00:00.000Z');
      expect(next._rollback['sr-1']).toBeUndefined();
    });

    it('rejected restores from rollback', () => {
      const optimistic = makeSR({
        id: 'sr-1',
        activityLog: [
          ...sr.activityLog,
          { id: 'opt-note', timestamp: 'now', type: 'note' as const, content: 'Will fail' },
        ],
      });

      const withRollback: ServiceRequestsState = {
        items: { 'sr-1': optimistic },
        status: 'succeeded',
        error: null,
        _rollback: { 'sr-1': sr },
      };

      const next = reducer(withRollback, {
        type: addNoteToServiceRequest.rejected.type,
        error: { message: 'Server error' },
        meta: {
          ...META,
          requestStatus: 'rejected' as const,
          arg: { id: 'sr-1', content: 'Will fail' },
          rejectedWithValue: false,
          aborted: false,
          condition: false,
        },
      });

      expect(next.items['sr-1'].activityLog).toHaveLength(1);
      expect(next._rollback['sr-1']).toBeUndefined();
    });

    it('rejected is safe when no rollback data exists', () => {
      const prev = stateWith([sr]);
      const next = reducer(prev, {
        type: addNoteToServiceRequest.rejected.type,
        error: { message: 'err' },
        meta: {
          ...META,
          requestStatus: 'rejected' as const,
          arg: { id: 'sr-1', content: 'x' },
          rejectedWithValue: false,
          aborted: false,
          condition: false,
        },
      });

      expect(next.items['sr-1'].activityLog).toHaveLength(1);
    });
  });
});
