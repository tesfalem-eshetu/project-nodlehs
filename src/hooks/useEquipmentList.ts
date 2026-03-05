import { useAppSelector } from '@/store';
import { selectAllDevices, selectDevicesStatus } from '@/store/selectors/deviceSelectors';
import { selectOpenRequestCountsMap } from '@/store/selectors/serviceRequestSelectors';

export default function useEquipmentList() {
  const devices = useAppSelector(selectAllDevices);
  const status = useAppSelector(selectDevicesStatus);
  const openCounts = useAppSelector(selectOpenRequestCountsMap);

  return { devices, status, openCounts };
}
