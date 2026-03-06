import { createSlice } from '@reduxjs/toolkit';
import type { Device } from '@/types';
import { ServiceRequestStatus } from '@/types';
import { fetchDevices, fetchDeviceById } from '../thunks/deviceThunks';
import { updateServiceRequestStatus } from '../thunks/serviceRequestThunks';

export interface DevicesState {
  items: Record<string, Device>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  _rollback: Record<string, Device>;
}

const initialState: DevicesState = {
  items: {},
  status: 'idle',
  error: null,
  _rollback: {},
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
      .addCase(updateServiceRequestStatus.pending, (state, action) => {
        const { deviceId, status } = action.meta.arg;
        if (status !== ServiceRequestStatus.Completed) return;
        const device = state.items[deviceId];
        if (!device) return;
        state._rollback[deviceId] = { ...device };
        state.items[deviceId] = {
          ...device,
          lastMaintenanceDate: new Date().toISOString(),
        };
      })
      .addCase(updateServiceRequestStatus.fulfilled, (state, action) => {
        const { device } = action.payload;
        const { deviceId } = action.meta.arg;
        if (device) {
          state.items[device.id] = device;
        }
        delete state._rollback[deviceId];
      })
      .addCase(updateServiceRequestStatus.rejected, (state, action) => {
        const { deviceId } = action.meta.arg;
        if (state._rollback[deviceId]) {
          state.items[deviceId] = state._rollback[deviceId];
          delete state._rollback[deviceId];
        }
      });
  },
});

export default devicesSlice.reducer;
