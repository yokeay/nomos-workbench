'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function CalendarPage() {
  const { t } = useTranslation();
  const [currentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthLabel = currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">{monthLabel}</h1>

        <Card className="bg-background border-border p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((_, i) => <div key={`b-${i}`} className="h-20" />)}
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDate(day)}
                className="h-20 p-1 text-left rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <span className="text-sm text-foreground">{day}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Event list for selected date */}
        {selectedDate && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              {currentDate.getFullYear()}/{currentDate.getMonth() + 1}/{selectedDate}
            </h2>
            <div className="space-y-2">
              {events.length === 0 && (
                <p className="text-muted-foreground text-sm">No events</p>
              )}
              {events.map((ev, i) => (
                <Card key={i} className="bg-background border-border p-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                    <span className="text-sm text-foreground">{ev.title}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
