export enum Priority {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

export enum Category {
  Repair = 'repair',
  PreventiveMaintenance = 'preventive_maintenance',
  Inspection = 'inspection',
  Replacement = 'replacement',
}

export enum ServiceRequestStatus {
  Open = 'open',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export interface ActivityEntry {
  id: string;
  timestamp: string;
  type: 'status_change' | 'note';
  content: string;
}

export interface CreateServiceRequestPayload {
  deviceId: string;
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  scheduledDate: string;
}

export interface ServiceRequest {
  id: string;
  deviceId: string;
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  status: ServiceRequestStatus;
  scheduledDate: string;
  createdAt: string;
  updatedAt: string;
  activityLog: ActivityEntry[];
}
