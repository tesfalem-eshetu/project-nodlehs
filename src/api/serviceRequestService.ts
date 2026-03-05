import { v4 as uuidv4 } from 'uuid';
import type { CreateServiceRequestPayload, ServiceRequest } from '@/types';
import { ServiceRequestStatus } from '@/types';
import { seedServiceRequests } from '@/constants/seed';
import { delay } from './utils';

const serviceRequests: ServiceRequest[] = [...seedServiceRequests.map((sr) => ({
  ...sr,
  activityLog: [...sr.activityLog],
}))];

const VALID_TRANSITIONS: Record<ServiceRequestStatus, ServiceRequestStatus[]> = {
  [ServiceRequestStatus.Open]: [ServiceRequestStatus.InProgress, ServiceRequestStatus.Cancelled],
  [ServiceRequestStatus.InProgress]: [ServiceRequestStatus.Completed, ServiceRequestStatus.Cancelled],
  [ServiceRequestStatus.Completed]: [],
  [ServiceRequestStatus.Cancelled]: [],
};

function deepCopy(sr: ServiceRequest): ServiceRequest {
  return { ...sr, activityLog: [...sr.activityLog] };
}

export function fetchServiceRequests(): Promise<ServiceRequest[]> {
  return delay(serviceRequests.map(deepCopy));
}

export function createServiceRequest(
  payload: CreateServiceRequestPayload,
): Promise<ServiceRequest> {
  const now = new Date().toISOString();
  const newSR: ServiceRequest = {
    id: `sr-${uuidv4()}`,
    ...payload,
    status: ServiceRequestStatus.Open,
    createdAt: now,
    updatedAt: now,
    activityLog: [
      {
        id: `act-${uuidv4()}`,
        timestamp: now,
        type: 'status_change',
        content: 'Service request created with status: Open',
      },
    ],
  };
  serviceRequests.push(newSR);
  return delay(deepCopy(newSR));
}

export function updateServiceRequestStatus(
  id: string,
  status: ServiceRequestStatus,
): Promise<ServiceRequest> {
  const index = serviceRequests.findIndex((sr) => sr.id === id);
  if (index === -1) {
    return Promise.reject(
      new Error(`Service request with id "${id}" not found`),
    );
  }

  const currentStatus = serviceRequests[index].status;
  const allowedTransitions = VALID_TRANSITIONS[currentStatus];
  if (!allowedTransitions.includes(status)) {
    return Promise.reject(
      new Error(
        `Invalid status transition from "${currentStatus}" to "${status}"`,
      ),
    );
  }

  const now = new Date().toISOString();
  const statusLabels: Record<ServiceRequestStatus, string> = {
    [ServiceRequestStatus.Open]: 'Open',
    [ServiceRequestStatus.InProgress]: 'In Progress',
    [ServiceRequestStatus.Completed]: 'Completed',
    [ServiceRequestStatus.Cancelled]: 'Cancelled',
  };

  serviceRequests[index] = {
    ...serviceRequests[index],
    status,
    updatedAt: now,
    activityLog: [
      ...serviceRequests[index].activityLog,
      {
        id: `act-${uuidv4()}`,
        timestamp: now,
        type: 'status_change',
        content: `Status changed to: ${statusLabels[status]}`,
      },
    ],
  };

  return delay(deepCopy(serviceRequests[index]));
}

export function addNoteToServiceRequest(
  id: string,
  content: string,
): Promise<ServiceRequest> {
  const index = serviceRequests.findIndex((sr) => sr.id === id);
  if (index === -1) {
    return Promise.reject(
      new Error(`Service request with id "${id}" not found`),
    );
  }

  const now = new Date().toISOString();
  serviceRequests[index] = {
    ...serviceRequests[index],
    updatedAt: now,
    activityLog: [
      ...serviceRequests[index].activityLog,
      {
        id: `act-${uuidv4()}`,
        timestamp: now,
        type: 'note',
        content,
      },
    ],
  };

  return delay(deepCopy(serviceRequests[index]));
}
