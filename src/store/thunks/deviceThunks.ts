import { createAsyncThunk } from '@reduxjs/toolkit';
import * as deviceService from '@/api/deviceService';

export const fetchDevices = createAsyncThunk(
  'devices/fetchDevices',
  async () => {
    return deviceService.fetchDevices();
  },
);

export const fetchDeviceById = createAsyncThunk(
  'devices/fetchDeviceById',
  async (id: string) => {
    return deviceService.fetchDeviceById(id);
  },
);
