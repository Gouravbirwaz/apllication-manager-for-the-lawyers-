
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, setHours, setMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Case, Hearing, User } from '@/lib/types';

interface ScheduleHearingProps {
  children: React.ReactNode;
  caseData: Case;
  client?: User;
  onHearingScheduled: (hearing: Hearing) => void;
}

export function ScheduleHearing({ children, caseData, client, onHearingScheduled }: ScheduleHearingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('10:00');
  const [courtRoom, setCourtRoom] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleSchedule = () => {
    if (!date) {
      alert('Please select a date.');
      return;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const hearingDateTime = setMinutes(setHours(date, hours), minutes);

    const newHearing: Hearing = {
      hearing_id: `hear-${Date.now()}`,
      case_id: caseData.case_id,
      date: hearingDateTime,
      court_room: courtRoom,
      remarks: remarks,
      notified: true,
      case_title: caseData.title,
    };
    
    onHearingScheduled(newHearing);
    setIsOpen(false);
    resetForm();
  };
  
  const resetForm = () => {
      setDate(undefined);
      setTime('10:00');
      setCourtRoom('');
      setRemarks('');
  }

  const generateCalendarLink = () => {
    if (!date) return '#';
    
    const [hours, minutes] = time.split(':').map(Number);
    const startDateTime = setMinutes(setHours(date, hours), minutes);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Assume 1 hour duration

    const formatForGoogle = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const eventTitle = `Hearing: ${caseData.title}`;
    const eventDetails = `Case: ${caseData.title}\nCourt: ${caseData.court_name}\nCourtroom: ${courtRoom}\n\nRemarks: ${remarks}`;
    
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', eventTitle);
    url.searchParams.set('details', eventDetails);
    url.searchParams.set('location', `${caseData.court_name}, Courtroom ${courtRoom}`);
    url.searchParams.set('dates', `${formatForGoogle(startDateTime)}/${formatForGoogle(endDateTime)}`);
    if(client?.email) {
      url.searchParams.set('add', client.email);
    }

    return url.toString();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule New Hearing</DialogTitle>
          <DialogDescription>
            Set the details for the next hearing for &quot;{caseData.title}&quot;.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal col-span-3',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Time
            </Label>
            <Input 
              id="time" 
              type="time" 
              value={time} 
              onChange={e => setTime(e.target.value)}
              className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="court-room" className="text-right">
              Courtroom
            </Label>
            <Input 
              id="court-room" 
              value={courtRoom}
              onChange={e => setCourtRoom(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 5B"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="remarks" className="text-right">
              Remarks
            </Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Preliminary hearing"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between gap-2">
            <Button asChild variant="outline">
                <a href={generateCalendarLink()} target="_blank" rel="noopener noreferrer">
                    Add to Google Calendar <ExternalLink className="ml-2 h-4 w-4" />
                </a>
            </Button>
          <Button onClick={handleSchedule}>Add to Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
