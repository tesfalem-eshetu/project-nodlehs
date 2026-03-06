import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/store';
import { fetchDevices } from '@/store/thunks/deviceThunks';
import { fetchServiceRequests } from '@/store/thunks/serviceRequestThunks';

export default function useRefreshData() {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchDevices()),
        dispatch(fetchServiceRequests()),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  return { refreshing, onRefresh };
}
