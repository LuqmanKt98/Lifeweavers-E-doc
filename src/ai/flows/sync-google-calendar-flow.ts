
// src/ai/flows/sync-google-calendar-flow.ts
'use server';
/**
 * @fileOverview Simulates fetching calendar events from Google Calendar.
 *
 * - syncGoogleCalendar - A function that simulates fetching events.
 * - SyncGoogleCalendarInput - The input type for the syncGoogleCalendar function.
 * - SyncGoogleCalendarOutput - The return type for the syncGoogleCalendar function, returning events in SessionNote-like format.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { SessionNote } from '@/lib/types';
import { MOCK_ALL_USERS_DATABASE, MOCK_CLIENTS_DB } from '@/lib/mockDatabase';
import { addHours, formatISO } from 'date-fns';

const SyncGoogleCalendarInputSchema = z.object({
  userId: z.string().describe('The ID of the user for whom to sync the calendar. (Currently unused in mock).'),
});
export type SyncGoogleCalendarInput = z.infer<typeof SyncGoogleCalendarInputSchema>;

// Re-using SessionNote structure for simplicity in this mock,
// as EventCalendar.tsx expects SessionNote[]
const CalendarEventSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  sessionNumber: z.number(),
  dateOfSession: z.string().describe('ISO date string for the event start time.'),
  attendingClinicianId: z.string(),
  attendingClinicianName: z.string(),
  attendingClinicianVocation: z.string().optional(),
  content: z.string().describe('Event description or notes.'),
  attachments: z.array(z.any()).optional(), // Keeping attachments simple for mock
  createdAt: z.string(),
  updatedAt: z.string(),
});

const SyncGoogleCalendarOutputSchema = z.object({
  events: z.array(CalendarEventSchema).describe('A list of calendar events, formatted like SessionNotes.'),
});
export type SyncGoogleCalendarOutput = z.infer<typeof SyncGoogleCalendarOutputSchema>;

export async function syncGoogleCalendar(input: SyncGoogleCalendarInput): Promise<SyncGoogleCalendarOutput> {
  return syncGoogleCalendarFlow(input);
}

// No prompt needed for this mock, as we are just returning hardcoded data.
// In a real scenario, you might use an AI to summarize or categorize events, but fetching is usually a direct API call.

const syncGoogleCalendarFlow = ai.defineFlow(
  {
    name: 'syncGoogleCalendarFlow',
    inputSchema: SyncGoogleCalendarInputSchema,
    outputSchema: SyncGoogleCalendarOutputSchema,
  },
  async (input) => {
    // Simulate fetching data and transforming it into SessionNote-like objects
    // For demonstration, let's create a couple of mock calendar events
    const now = new Date();
    const clinician1 = MOCK_ALL_USERS_DATABASE.find(u => u.role === 'Clinician') || MOCK_ALL_USERS_DATABASE[0];
    const client1 = MOCK_CLIENTS_DB[Object.keys(MOCK_CLIENTS_DB)[0]] || {id: 'client-mock-1', name: 'Mock Client 1'};

    const mockEvents: SessionNote[] = [
      {
        id: `gcal-event-${Date.now()}-1`,
        clientId: client1.id,
        sessionNumber: 991, // Using high numbers to differentiate from existing mock sessions
        dateOfSession: formatISO(addHours(now, 2)), // Event in 2 hours
        attendingClinicianId: clinician1.id,
        attendingClinicianName: clinician1.name,
        attendingClinicianVocation: clinician1.vocation,
        content: `<p>Google Calendar Event: Meeting with ${client1.name}. Discuss project updates.</p>`,
        attachments: [],
        createdAt: formatISO(now),
        updatedAt: formatISO(now),
      },
      {
        id: `gcal-event-${Date.now()}-2`,
        clientId: client1.id, 
        sessionNumber: 992,
        dateOfSession: formatISO(addHours(now, 26)), // Event tomorrow + 2 hours
        attendingClinicianId: clinician1.id,
        attendingClinicianName: clinician1.name,
        attendingClinicianVocation: clinician1.vocation,
        content: `<p>Google Calendar Event: Follow-up call - Project Alpha with ${client1.name}.</p>`,
        attachments: [],
        createdAt: formatISO(now),
        updatedAt: formatISO(now),
      },
    ];

    // In a real scenario, you would call the Google Calendar API here.
    // For now, we return the mock events.
    // This flow does not use an AI model, it's purely for simulating an external data fetch.

    return { events: mockEvents };
  }
);
