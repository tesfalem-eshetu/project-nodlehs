import { useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectServiceRequestById } from '@/store/selectors/serviceRequestSelectors';
import { selectDeviceById } from '@/store/selectors/deviceSelectors';
import {
  updateServiceRequestStatus,
  addNoteToServiceRequest,
} from '@/store/thunks/serviceRequestThunks';
import type { ServiceRequestStatus } from '@/types';

export default function useServiceRequestDetail(id: string) {
  const dispatch = useAppDispatch();
  const sr = useAppSelector((state) => selectServiceRequestById(state, id));
  const device = useAppSelector((state) =>
    sr ? selectDeviceById(state, sr.deviceId) : null,
  );

  const [noteText, setNoteText] = useState('');
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusUpdate = useCallback(
    async (newStatus: ServiceRequestStatus) => {
      if (!sr) return;
      setUpdating(true);
      setActionError(null);
      try {
        await dispatch(
          updateServiceRequestStatus({
            id: sr.id,
            status: newStatus,
            deviceId: sr.deviceId,
          }),
        ).unwrap();
      } catch (e) {
        setActionError(e instanceof Error ? e.message : 'Failed to update status');
      } finally {
        setUpdating(false);
      }
    },
    [dispatch, sr],
  );

  const handleAddNote = useCallback(async () => {
    if (!sr || !noteText.trim()) return;
    setActionError(null);
    try {
      await dispatch(
        addNoteToServiceRequest({ id: sr.id, content: noteText.trim() }),
      ).unwrap();
      setNoteText('');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to add note');
    }
  }, [dispatch, sr, noteText]);

  return {
    sr,
    device,
    noteText,
    setNoteText,
    updating,
    actionError,
    handleStatusUpdate,
    handleAddNote,
  };
}
