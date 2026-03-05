import { createSlice } from '@reduxjs/toolkit';
import type { ServiceRequest } from '@/types';
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
}

const initialState: ServiceRequestsState = {
  items: {},
  status: 'idle',
  error: null,
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
      .addCase(updateServiceRequestStatus.fulfilled, (state, action) => {
        const { serviceRequest } = action.payload;
        state.items[serviceRequest.id] = serviceRequest;
      })
      .addCase(addNoteToServiceRequest.fulfilled, (state, action) => {
        state.items[action.payload.id] = action.payload;
      });
  },
});

export default serviceRequestsSlice.reducer;
