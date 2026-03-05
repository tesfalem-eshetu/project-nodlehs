import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import devicesReducer from './slices/devicesSlice';
import serviceRequestsReducer from './slices/serviceRequestsSlice';

export const store = configureStore({
  reducer: {
    devices: devicesReducer,
    serviceRequests: serviceRequestsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
