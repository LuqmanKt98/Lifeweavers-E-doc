export type UserRole = 'Super Admin' | 'Admin' | 'Clinician';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  vocation?: string; // e.g., Physiotherapist, Occupational Therapist
}

export interface Client {
  id: string;
  name: string;
  dateAdded: string; // ISO string
  // Other client-specific info can be added here
}

export interface SessionNote {
  id: string;
  clientId: string;
  sessionNumber: number;
  dateOfSession: string; // ISO string
  attendingClinicianId: string;
  attendingClinicianName: string;
  attendingClinicianVocation?: string;
  content: string; // Rich text content / HTML
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  // For version history, more fields would be needed
}
