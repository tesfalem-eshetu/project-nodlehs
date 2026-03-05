import { createSlice } from '@reduxjs/toolkit';
import type { Device } from '@/types';

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
});

export default devicesSlice.reducer;
