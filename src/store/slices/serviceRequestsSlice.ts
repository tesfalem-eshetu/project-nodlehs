import { createSlice } from '@reduxjs/toolkit';
import type { ServiceRequest } from '@/types';
import { v4 as uuid } from 'uuid';
import {
  fetchServiceRequests,
  createServiceRequest,
  updateServiceRequestStatus,
  addNoteToServiceRequest,
} from '../thunks/serviceRequestThunks';

export interface ServiceRequestsState {
  items: Record<string, ServiceRequest>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  _rollback: Record<string, ServiceRequest>;
}

const initialState: ServiceRequestsState = {
  items: {},
  status: 'idle',
  error: null,
  _rollback: {},
};

const serviceRequestsSlice = createSlice({
  name: 'serviceRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceRequests.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchServiceRequests.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const normalized: Record<string, ServiceRequest> = {};
        for (const sr of action.payload) {
          normalized[sr.id] = sr;
        }
        state.items = normalized;
      })
      .addCase(fetchServiceRequests.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.error.message ?? 'Failed to fetch service requests';
      })
      .addCase(createServiceRequest.fulfilled, (state, action) => {
        state.items[action.payload.id] = action.payload;
      })

      .addCase(updateServiceRequestStatus.pending, (state, action) => {
        const { id, status } = action.meta.arg;
        const existing = state.items[id];
        if (!existing) return;
        state._rollback[id] = { ...existing, activityLog: [...existing.activityLog] };
        const now = new Date().toISOString();
        state.items[id] = {
          ...existing,
          status,
          updatedAt: now,
          activityLog: [
            ...existing.activityLog,
            {
              id: uuid(),
              timestamp: now,
              type: 'status_change',
              content: `Status changed from ${existing.status} to ${status}`,
            },
          ],
        };
      })
      .addCase(updateServiceRequestStatus.fulfilled, (state, action) => {
        const { serviceRequest } = action.payload;
        state.items[serviceRequest.id] = serviceRequest;
        delete state._rollback[serviceRequest.id];
      })
      .addCase(updateServiceRequestStatus.rejected, (state, action) => {
        const { id } = action.meta.arg;
        if (state._rollback[id]) {
          state.items[id] = state._rollback[id];
          delete state._rollback[id];
        }
      })

      .addCase(addNoteToServiceRequest.pending, (state, action) => {
        const { id, content } = action.meta.arg;
        const existing = state.items[id];
        if (!existing) return;
        state._rollback[id] = { ...existing, activityLog: [...existing.activityLog] };
        const now = new Date().toISOString();
        state.items[id] = {
          ...existing,
          updatedAt: now,
          activityLog: [
            ...existing.activityLog,
            {
              id: uuid(),
              timestamp: now,
              type: 'note',
              content,
            },
          ],
        };
      })
      .addCase(addNoteToServiceRequest.fulfilled, (state, action) => {
        state.items[action.payload.id] = action.payload;
        delete state._rollback[action.payload.id];
      })
      .addCase(addNoteToServiceRequest.rejected, (state, action) => {
        const { id } = action.meta.arg;
        if (state._rollback[id]) {
          state.items[id] = state._rollback[id];
          delete state._rollback[id];
        }
      });
  },
});

export default serviceRequestsSlice.reducer;
