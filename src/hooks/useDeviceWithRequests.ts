import { useAppSelector } from '@/store';
import { selectDeviceById } from '@/store/selectors/deviceSelectors';
import { selectRequestsByDeviceId } from '@/store/selectors/serviceRequestSelectors';

export default function useDeviceWithRequests(deviceId: string) {
  const device = useAppSelector((state) => selectDeviceById(state, deviceId));
  const serviceRequests = useAppSelector((state) =>
    selectRequestsByDeviceId(state, deviceId),
  );

  return { device, serviceRequests };
}
