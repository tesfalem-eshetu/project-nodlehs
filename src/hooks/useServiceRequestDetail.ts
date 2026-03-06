import { useState, useCallback } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectServiceRequestById } from '@/store/selectors/serviceRequestSelectors';
import { selectDeviceById } from '@/store/selectors/deviceSelectors';
import {
  updateServiceRequestStatus,
  addNoteToServiceRequest,
} from '@/store/thunks/serviceRequestThunks';
import type { ServiceRequestStatus } from '@/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LAYOUT_ANIM = {
  duration: 250,
  create: { type: 'easeInEaseOut' as const, property: 'opacity' as const },
  update: { type: 'easeInEaseOut' as const },
  delete: { type: 'easeInEaseOut' as const, property: 'opacity' as const },
};

export default function useServiceRequestDetail(id: string) {
  const dispatch = useAppDispatch();
  const sr = useAppSelector((state) => selectServiceRequestById(state, id));
  const device = useAppSelector((state) =>
    sr ? selectDeviceById(state, sr.deviceId) : null,
  );

  const [noteText, setNoteText] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<ServiceRequestStatus | null>(null);
  const [addingNote, setAddingNote] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusUpdate = useCallback(
    async (newStatus: ServiceRequestStatus) => {
      if (!sr) return;
      LayoutAnimation.configureNext(LAYOUT_ANIM);
      setUpdatingStatus(newStatus);
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
        LayoutAnimation.configureNext(LAYOUT_ANIM);
        setActionError(e instanceof Error ? e.message : 'Failed to update status');
      } finally {
        setUpdatingStatus(null);
      }
    },
    [dispatch, sr],
  );

  const handleAddNote = useCallback(async () => {
    if (!sr || !noteText.trim()) return;
    const content = noteText.trim();
    setNoteText('');
    LayoutAnimation.configureNext(LAYOUT_ANIM);
    setAddingNote(true);
    setActionError(null);
    try {
      await dispatch(
        addNoteToServiceRequest({ id: sr.id, content }),
      ).unwrap();
    } catch (e) {
      LayoutAnimation.configureNext(LAYOUT_ANIM);
      setActionError(e instanceof Error ? e.message : 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  }, [dispatch, sr, noteText]);

  return {
    sr,
    device,
    noteText,
    setNoteText,
    updatingStatus,
    addingNote,
    actionError,
    handleStatusUpdate,
    handleAddNote,
  };
}
