// src/components/shared/EventCalendar.tsx
"use client";

import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { SessionNote } from '@/lib/types';
import { format, isSameDay, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, Clock } from 'lucide-react';
import { MOCK_CLIENTS_DB } from '@/lib/mockDatabase'; // Import MOCK_CLIENTS_DB

interface EventCalendarProps {
  sessions: SessionNote[];
}

export default function EventCalendar({ sessions }: EventCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const sessionDates = useMemo(() => {
    return sessions.map(s => new Date(s.dateOfSession));
  }, [sessions]);

  const sessionsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return sessions
      .filter(session => isSameDay(new Date(session.dateOfSession), selectedDate))
      .sort((a, b) => new Date(a.dateOfSession).getTime() - new Date(b.dateOfSession).getTime());
  }, [selectedDate, sessions]);

  const modifiers = {
    hasSession: sessionDates,
  };

  const modifiersClassNames = {
    hasSession: 'day-with-session',
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    } else {
      setSelectedDate(undefined);
    }
  };

  const getClientName = (clientId: string): string => {
    return MOCK_CLIENTS_DB[clientId]?.name || clientId;
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        {/* Title and Description remain unchanged as per previous requests */}
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-primary">
            <CalendarIcon className="h-6 w-6" /> Appointments
        </CardTitle>
        <CardDescription>
            View past and upcoming sessions. Click on a day to see details.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[calc(50%-0.75rem)] xl:w-[calc(40%-0.75rem)]">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className="rounded-md border bg-card p-0 sm:p-1"
            numberOfMonths={1}
            pagedNavigation
            showOutsideDays
            fixedWeeks
          />
        </div>
        <div className="lg:w-[calc(50%-0.75rem)] xl:w-[calc(60%-0.75rem)]">
          <h3 className="text-lg font-semibold mb-3 text-foreground">
            Sessions on {selectedDate ? format(selectedDate, 'PPP') : 'selected date'}
          </h3>
          <ScrollArea className="h-72 border rounded-md p-3 bg-secondary/30">
            {sessionsOnSelectedDate.length > 0 ? (
              <ul className="space-y-3">
                {sessionsOnSelectedDate.map(session => (
                  <li key={session.id} className="p-3 bg-card rounded-md shadow-sm hover:shadow-md transition-shadow">
                    <p className="font-medium text-sm text-primary">
                      {getClientName(session.clientId)} / {session.attendingClinicianName}
                    </p>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center">
                      <Clock className="mr-1.5 h-3.5 w-3.5" />
                      <span>{format(parseISO(session.dateOfSession), 'HH:mm')}</span>
                      {/* If you want to assume a 1-hour duration for display:
                      <span>{format(parseISO(session.dateOfSession), 'HH:mm')} - {format(addHours(parseISO(session.dateOfSession), 1), 'HH:mm')}</span>
                      */}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground pt-2">
                {selectedDate ? 'No sessions scheduled for this day.' : 'Select a day from the calendar to view sessions.'}
              </p>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
