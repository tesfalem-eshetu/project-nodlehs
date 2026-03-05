import { createAsyncThunk } from '@reduxjs/toolkit';
import type { CreateServiceRequestPayload, Device, ServiceRequest } from '@/types';
import { ServiceRequestStatus } from '@/types';
import * as serviceRequestService from '@/api/serviceRequestService';
import * as deviceService from '@/api/deviceService';

export const fetchServiceRequests = createAsyncThunk(
  'serviceRequests/fetchAll',
  async () => {
    return serviceRequestService.fetchServiceRequests();
  },
);

export const createServiceRequest = createAsyncThunk(
  'serviceRequests/create',
  async (payload: CreateServiceRequestPayload) => {
    return serviceRequestService.createServiceRequest(payload);
  },
);

export const updateServiceRequestStatus = createAsyncThunk(
  'serviceRequests/updateStatus',
  async (args: {
    id: string;
    status: ServiceRequestStatus;
    deviceId: string;
  }): Promise<{ serviceRequest: ServiceRequest; device: Device | null }> => {
    const serviceRequest = await serviceRequestService.updateServiceRequestStatus(
      args.id,
      args.status,
    );

    let device: Device | null = null;
    if (args.status === ServiceRequestStatus.Completed) {
      device = await deviceService.updateDeviceLastMaintenance(
        args.deviceId,
        serviceRequest.updatedAt,
      );
    }

    return { serviceRequest, device };
  },
);

export const addNoteToServiceRequest = createAsyncThunk(
  'serviceRequests/addNote',
  async (args: { id: string; content: string }) => {
    return serviceRequestService.addNoteToServiceRequest(
      args.id,
      args.content,
    );
  },
);
