import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';

const selectDevicesState = (state: RootState) => state.devices;

export const selectAllDevices = createSelector(
  [selectDevicesState],
  (devicesState) => Object.values(devicesState.items),
);

export const selectDeviceById = (state: RootState, id: string) =>
  state.devices.items[id] ?? null;

export const selectDevicesStatus = (state: RootState) => state.devices.status;

export const selectDevicesError = (state: RootState) => state.devices.error;
