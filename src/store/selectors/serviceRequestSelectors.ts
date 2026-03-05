import { createSelector } from '@reduxjs/toolkit';
import { ServiceRequestStatus } from '@/types';
import type { RootState } from '../index';

const selectServiceRequestsState = (state: RootState) => state.serviceRequests;

export const selectAllServiceRequests = createSelector(
  [selectServiceRequestsState],
  (srState) => Object.values(srState.items),
);

export const selectServiceRequestById = (state: RootState, id: string) =>
  state.serviceRequests.items[id] ?? null;

export const selectRequestsByDeviceId = createSelector(
  [selectAllServiceRequests, (_state: RootState, deviceId: string) => deviceId],
  (allRequests, deviceId) =>
    allRequests
      .filter((sr) => sr.deviceId === deviceId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
);

export const selectOpenRequestCountByDeviceId = createSelector(
  [selectAllServiceRequests, (_state: RootState, deviceId: string) => deviceId],
  (allRequests, deviceId) =>
    allRequests.filter(
      (sr) =>
        sr.deviceId === deviceId &&
        sr.status === ServiceRequestStatus.Open,
    ).length,
);

export const selectOpenRequestCountsMap = createSelector(
  [selectAllServiceRequests],
  (allRequests) => {
    const counts: Record<string, number> = {};
    for (const sr of allRequests) {
      if (sr.status === ServiceRequestStatus.Open) {
        counts[sr.deviceId] = (counts[sr.deviceId] ?? 0) + 1;
      }
    }
    return counts;
  },
);

export const selectOverdueRequests = createSelector(
  [selectAllServiceRequests],
  (allRequests) => {
    const now = new Date().getTime();
    return allRequests.filter(
      (sr) =>
        sr.status !== ServiceRequestStatus.Completed &&
        sr.status !== ServiceRequestStatus.Cancelled &&
        new Date(sr.scheduledDate).getTime() < now,
    );
  },
);

export const selectCountsByStatus = createSelector(
  [selectAllServiceRequests],
  (allRequests) => {
    const counts = { open: 0, inProgress: 0, completed: 0, cancelled: 0 };
    for (const sr of allRequests) {
      switch (sr.status) {
        case ServiceRequestStatus.Open:
          counts.open++;
          break;
        case ServiceRequestStatus.InProgress:
          counts.inProgress++;
          break;
        case ServiceRequestStatus.Completed:
          counts.completed++;
          break;
        case ServiceRequestStatus.Cancelled:
          counts.cancelled++;
          break;
      }
    }
    return counts;
  },
);

export const selectCountsByPriority = createSelector(
  [selectAllServiceRequests],
  (allRequests) => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const sr of allRequests) {
      counts[sr.priority]++;
    }
    return counts;
  },
);

export const selectServiceRequestsStatus = (state: RootState) =>
  state.serviceRequests.status;

export const selectServiceRequestsError = (state: RootState) =>
  state.serviceRequests.error;
