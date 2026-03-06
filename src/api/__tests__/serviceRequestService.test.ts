import { ServiceRequestStatus, Priority, Category } from '@/types';
import type { CreateServiceRequestPayload } from '@/types';

jest.mock('@/api/utils', () => ({
  SIMULATED_DELAY: 0,
  delay: <T>(value: T) => Promise.resolve(value),
}));

jest.mock('react-native-get-random-values', () => {});

let serviceRequestService: typeof import('../serviceRequestService');

beforeEach(() => {
  jest.resetModules();
  serviceRequestService = require('../serviceRequestService');
});

const createPayload: CreateServiceRequestPayload = {
  deviceId: 'dev-001',
  title: 'Test request',
  description: 'Test description',
  priority: Priority.Medium,
  category: Category.Repair,
  scheduledDate: '2026-04-01T00:00:00.000Z',
};

describe('serviceRequestService', () => {
  describe('fetchServiceRequests', () => {
    it('returns all seed service requests', async () => {
      const results = await serviceRequestService.fetchServiceRequests();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('status');
      expect(results[0]).toHaveProperty('activityLog');
    });

    it('returns deep copies (mutations do not affect source)', async () => {
      const first = await serviceRequestService.fetchServiceRequests();
      first[0].title = 'MUTATED';
      const second = await serviceRequestService.fetchServiceRequests();
      expect(second[0].title).not.toBe('MUTATED');
    });
  });

  describe('createServiceRequest', () => {
    it('returns a new service request with Open status', async () => {
      const result = await serviceRequestService.createServiceRequest(createPayload);
      expect(result.status).toBe(ServiceRequestStatus.Open);
      expect(result.title).toBe('Test request');
      expect(result.deviceId).toBe('dev-001');
    });

    it('generates a unique id starting with "sr-"', async () => {
      const result = await serviceRequestService.createServiceRequest(createPayload);
      expect(result.id).toMatch(/^sr-/);
    });

    it('sets createdAt and updatedAt', async () => {
      const result = await serviceRequestService.createServiceRequest(createPayload);
      expect(result.createdAt).toBeTruthy();
      expect(result.updatedAt).toBe(result.createdAt);
    });

    it('initializes activity log with a creation entry', async () => {
      const result = await serviceRequestService.createServiceRequest(createPayload);
      expect(result.activityLog).toHaveLength(1);
      expect(result.activityLog[0].type).toBe('status_change');
      expect(result.activityLog[0].content).toContain('Open');
    });

    it('persists the new request in subsequent fetches', async () => {
      await serviceRequestService.createServiceRequest(createPayload);
      const all = await serviceRequestService.fetchServiceRequests();
      const found = all.find((sr) => sr.title === 'Test request');
      expect(found).toBeDefined();
    });
  });

  describe('updateServiceRequestStatus', () => {
    describe('valid transitions', () => {
      it('allows Open -> InProgress', async () => {
        const all = await serviceRequestService.fetchServiceRequests();
        const openSR = all.find((sr) => sr.status === ServiceRequestStatus.Open);
        expect(openSR).toBeDefined();

        const result = await serviceRequestService.updateServiceRequestStatus(
          openSR!.id,
          ServiceRequestStatus.InProgress,
        );
        expect(result.status).toBe(ServiceRequestStatus.InProgress);
      });

      it('allows Open -> Cancelled', async () => {
        const all = await serviceRequestService.fetchServiceRequests();
        const openSR = all.find((sr) => sr.status === ServiceRequestStatus.Open);

        const result = await serviceRequestService.updateServiceRequestStatus(
          openSR!.id,
          ServiceRequestStatus.Cancelled,
        );
        expect(result.status).toBe(ServiceRequestStatus.Cancelled);
      });

      it('allows InProgress -> Completed', async () => {
        const all = await serviceRequestService.fetchServiceRequests();
        const ipSR = all.find((sr) => sr.status === ServiceRequestStatus.InProgress);
        expect(ipSR).toBeDefined();

        const result = await serviceRequestService.updateServiceRequestStatus(
          ipSR!.id,
          ServiceRequestStatus.Completed,
        );
        expect(result.status).toBe(ServiceRequestStatus.Completed);
      });

      it('allows InProgress -> Cancelled', async () => {
        const all = await serviceRequestService.fetchServiceRequests();
        const ipSR = all.find((sr) => sr.status === ServiceRequestStatus.InProgress);

        const result = await serviceRequestService.updateServiceRequestStatus(
          ipSR!.id,
          ServiceRequestStatus.Cancelled,
        );
        expect(result.status).toBe(ServiceRequestStatus.Cancelled);
      });
    });

    describe('invalid transitions', () => {
      it('rejects Open -> Completed', async () => {
        const all = await serviceRequestService.fetchServiceRequests();
        const openSR = all.find((sr) => sr.status === ServiceRequestStatus.Open);

        await expect(
          serviceRequestService.updateServiceRequestStatus(
            openSR!.id,
            ServiceRequestStatus.Completed,
          ),
        ).rejects.toThrow('Invalid status transition');
      });

      it('rejects Completed -> any status', async () => {
        const all = await serviceRequestService.fetchServiceRequests();
        const completedSR = all.find((sr) => sr.status === ServiceRequestStatus.Completed);
        expect(completedSR).toBeDefined();

        await expect(
          serviceRequestService.updateServiceRequestStatus(
            completedSR!.id,
            ServiceRequestStatus.Open,
          ),
        ).rejects.toThrow('Invalid status transition');

        await expect(
          serviceRequestService.updateServiceRequestStatus(
            completedSR!.id,
            ServiceRequestStatus.InProgress,
          ),
        ).rejects.toThrow('Invalid status transition');
      });

      it('rejects Cancelled -> any status', async () => {
        const all = await serviceRequestService.fetchServiceRequests();
        const cancelledSR = all.find((sr) => sr.status === ServiceRequestStatus.Cancelled);
        expect(cancelledSR).toBeDefined();

        await expect(
          serviceRequestService.updateServiceRequestStatus(
            cancelledSR!.id,
            ServiceRequestStatus.Open,
          ),
        ).rejects.toThrow('Invalid status transition');

        await expect(
          serviceRequestService.updateServiceRequestStatus(
            cancelledSR!.id,
            ServiceRequestStatus.InProgress,
          ),
        ).rejects.toThrow('Invalid status transition');
      });
    });

    it('rejects with error for non-existent id', async () => {
      await expect(
        serviceRequestService.updateServiceRequestStatus(
          'sr-does-not-exist',
          ServiceRequestStatus.InProgress,
        ),
      ).rejects.toThrow('not found');
    });

    it('appends a status_change entry to the activity log', async () => {
      const all = await serviceRequestService.fetchServiceRequests();
      const openSR = all.find((sr) => sr.status === ServiceRequestStatus.Open);
      const originalLogLength = openSR!.activityLog.length;

      const result = await serviceRequestService.updateServiceRequestStatus(
        openSR!.id,
        ServiceRequestStatus.InProgress,
      );

      expect(result.activityLog.length).toBe(originalLogLength + 1);
      const newEntry = result.activityLog[result.activityLog.length - 1];
      expect(newEntry.type).toBe('status_change');
      expect(newEntry.content).toContain('In Progress');
    });

    it('updates the updatedAt timestamp', async () => {
      const all = await serviceRequestService.fetchServiceRequests();
      const openSR = all.find((sr) => sr.status === ServiceRequestStatus.Open);
      const originalUpdatedAt = openSR!.updatedAt;

      const result = await serviceRequestService.updateServiceRequestStatus(
        openSR!.id,
        ServiceRequestStatus.InProgress,
      );

      expect(result.updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  describe('addNoteToServiceRequest', () => {
    it('appends a note entry to the activity log', async () => {
      const all = await serviceRequestService.fetchServiceRequests();
      const sr = all[0];
      const originalLogLength = sr.activityLog.length;

      const result = await serviceRequestService.addNoteToServiceRequest(
        sr.id,
        'Checked the filters',
      );

      expect(result.activityLog.length).toBe(originalLogLength + 1);
      const newEntry = result.activityLog[result.activityLog.length - 1];
      expect(newEntry.type).toBe('note');
      expect(newEntry.content).toBe('Checked the filters');
    });

    it('updates the updatedAt timestamp', async () => {
      const all = await serviceRequestService.fetchServiceRequests();
      const sr = all[0];
      const originalUpdatedAt = sr.updatedAt;

      const result = await serviceRequestService.addNoteToServiceRequest(
        sr.id,
        'note content',
      );

      expect(result.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('rejects with error for non-existent id', async () => {
      await expect(
        serviceRequestService.addNoteToServiceRequest(
          'sr-does-not-exist',
          'note',
        ),
      ).rejects.toThrow('not found');
    });
  });
});
