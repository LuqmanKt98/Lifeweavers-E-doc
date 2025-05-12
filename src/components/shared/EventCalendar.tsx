// src/components/shared/EventCalendar.tsx
"use client";

import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { SessionNote } from '@/lib/types';
import { format, isSameDay } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon } from 'lucide-react';

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
      .sort((a, b) => new Date(a.dateOfSession).getTime() - new Date(b.dateOfSession).getTime()); // Sort by time if available, otherwise date
  }, [selectedDate, sessions]);

  const modifiers = {
    hasSession: sessionDates,
  };

  const modifiersClassNames = {
    hasSession: 'day-with-session', // Custom class for days with sessions, styled in globals.css
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      // Optional: if you want the calendar to jump to the month of the selected date
      // if (date.getMonth() !== currentMonth.getMonth() || date.getFullYear() !== currentMonth.getFullYear()) {
      //   setCurrentMonth(date);
      // }
    } else {
      setSelectedDate(undefined);
    }
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-primary">
            <CalendarIcon className="h-6 w-6" /> Session Calendar
        </CardTitle>
        <CardDescription>
            View past and upcoming sessions. Click on a day to see details.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[calc(50%-0.75rem)] xl:w-[calc(40%-0.75rem)]"> {/* Calendar container */}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className="rounded-md border bg-card p-0 sm:p-1" // Adjusted padding for smaller screens
            numberOfMonths={1}
            pagedNavigation
            showOutsideDays
            fixedWeeks
          />
        </div>
        <div className="lg:w-[calc(50%-0.75rem)] xl:w-[calc(60%-0.75rem)]"> {/* Session list container */}
          <h3 className="text-lg font-semibold mb-3 text-foreground">
            Sessions on {selectedDate ? format(selectedDate, 'PPP') : 'selected date'}
          </h3>
          <ScrollArea className="h-72 border rounded-md p-3 bg-secondary/30">
            {sessionsOnSelectedDate.length > 0 ? (
              <ul className="space-y-3">
                {sessionsOnSelectedDate.map(session => (
                  <li key={session.id} className="p-3 bg-card rounded-md shadow-sm hover:shadow-md transition-shadow">
                    <p className="font-medium text-sm text-primary">
                      {session.attendingClinicianName}
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">
                      Session {session.sessionNumber} with {session.clientId.startsWith('client-') ? `Client ${session.clientId.split('-')[1]}` : session.clientId} 
                      {/* Using a simpler client name for now. In a real app, fetch client name. */}
                    </p>
                    <p className="text-xs italic text-foreground/80 line-clamp-2">
                      {session.content.replace(/<[^>]*>/g, '') || 'No specific content details.'}
                    </p>
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
