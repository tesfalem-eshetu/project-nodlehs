import { useAppSelector } from '@/store';
import { selectOverdueRequests } from '@/store/selectors/serviceRequestSelectors';

export default function useOverdueRequests() {
  return useAppSelector(selectOverdueRequests);
}
