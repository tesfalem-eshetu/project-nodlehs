import { useAppSelector } from '@/store';
import {
  selectCountsByStatus,
  selectCountsByPriority,
  selectServiceRequestsStatus,
} from '@/store/selectors/serviceRequestSelectors';
import useOverdueRequests from './useOverdueRequests';

export default function useDashboardData() {
  const statusCounts = useAppSelector(selectCountsByStatus);
  const priorityCounts = useAppSelector(selectCountsByPriority);
  const overdueRequests = useOverdueRequests();
  const status = useAppSelector(selectServiceRequestsStatus);

  return { statusCounts, priorityCounts, overdueRequests, status };
}
