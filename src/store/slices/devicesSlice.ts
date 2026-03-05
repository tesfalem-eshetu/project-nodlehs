import { createSlice } from '@reduxjs/toolkit';
import type { Device } from '@/types';
import { fetchDevices, fetchDeviceById } from '../thunks/deviceThunks';
import { updateServiceRequestStatus } from '../thunks/serviceRequestThunks';

export interface DevicesState {
  items: Record<string, Device>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DevicesState = {
  items: {},
  status: 'idle',
  error: null,
};

const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const normalized: Record<string, Device> = {};
        for (const device of action.payload) {
          normalized[device.id] = device;
        }
        state.items = normalized;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to fetch devices';
      })
      .addCase(fetchDeviceById.fulfilled, (state, action) => {
        state.items[action.payload.id] = action.payload;
      })
      .addCase(updateServiceRequestStatus.fulfilled, (state, action) => {
        const { device } = action.payload;
        if (device) {
          state.items[device.id] = device;
        }
      });
  },
});

export default devicesSlice.reducer;
