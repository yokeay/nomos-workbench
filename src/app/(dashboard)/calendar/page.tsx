'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react';

export default function CalendarPage() {
  const { t, i18n } = useTranslation();
  const [viewDate, setViewDate] = useState(new Date());
  const [events] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const locale = i18n.language === 'zh' ? 'zh-CN' : 'en-US';

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthLabel = viewDate.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
  const today = new Date().getDate();
  const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const weekdays = t('calendar.weekdays').split(',');

  const prevMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() - 1);
    setViewDate(d);
  };
  const nextMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + 1);
    setViewDate(d);
  };

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-6 h-6 text-foreground/60" />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{monthLabel}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all duration-fast"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all duration-fast"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card className="bg-card/60 border-border/60 shadow-sm-soft rounded-2xl overflow-hidden">
          <CardContent className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {weekdays.map((d) => (
                <div
                  key={d}
                  className="text-center text-[11px] text-muted-foreground/70 font-semibold py-2 tracking-wide uppercase"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {blanks.map((_, i) => (
                <div key={`b-${i}`} className="h-20 rounded-xl" />
              ))}
              {days.map((day) => {
                const isToday = isCurrentMonth && day === today;
                const isSelected = selectedDate === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`h-20 p-2 text-left rounded-xl border transition-all duration-fast ${
                      isSelected
                        ? 'border-foreground/30 bg-accent/60 shadow-sm-soft'
                        : 'border-transparent hover:border-border hover:bg-accent/30'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                        isToday
                          ? 'bg-foreground text-background'
                          : 'text-foreground/80'
                      }`}
                    >
                      {day}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Events for selected date */}
        {selectedDate && (
          <div className="mt-6 animate-slide-up">
            <h2 className="text-lg font-semibold text-foreground mb-3 tracking-tight">
              {new Date(year, month, selectedDate).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h2>
            <div className="space-y-2">
              {events.length === 0 && (
                <Card className="bg-card/40 border-border/40 rounded-2xl p-6 text-center">
                  <p className="text-muted-foreground/60 text-sm font-medium">
                    {t('calendar.noEvents')}
                  </p>
                </Card>
              )}
              {events.map((ev: any, i: number) => (
                <Card
                  key={i}
                  className="bg-card/60 border-border/50 hover:border-border hover:shadow-sm-soft rounded-2xl p-4 transition-all duration-fast"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-1 ring-offset-background"
                      style={{ backgroundColor: ev.color }}
                    />
                    <span className="text-sm text-foreground font-medium">{ev.title}</span>
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
