import { createSlice } from '@reduxjs/toolkit';
import type { ServiceRequest } from '@/types';

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
});

export default serviceRequestsSlice.reducer;
