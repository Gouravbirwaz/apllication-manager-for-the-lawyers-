'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockUsers } from '@/lib/mock-data';

interface ScheduleHearingProps {
  children: React.ReactNode;
  caseData?: Case;
  cases?: Case[];
  client?: User;
  onHearingScheduled: (hearing: Hearing) => void;
}

export function ScheduleHearing({ children, caseData: initialCaseData, cases, onHearingScheduled }: ScheduleHearingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(initialCaseData?.case_id);
  const [caseData, setCaseData] = useState<Case | undefined>(initialCaseData);
  const [client, setClient] = useState<User | undefined>();

  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('10:00');
  const [courtRoom, setCourtRoom] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (selectedCaseId && cases) {
      const newSelectedCase = cases.find(c => c.case_id === selectedCaseId);
      setCaseData(newSelectedCase);
    }
  }, [selectedCaseId, cases]);

  useEffect(() => {
    if(caseData) {
      const caseClient = mockUsers.find(u => u.uid === caseData.client_id);
      setClient(caseClient);
    }
  }, [caseData])


  const handleSchedule = () => {
    if (!date || !caseData) {
      alert('Please select a date and case.');
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
      if (!initialCaseData) {
        setSelectedCaseId(undefined);
        setCaseData(undefined);
        setClient(undefined);
      }
  }

  const generateCalendarLink = () => {
    if (!date || !caseData) return '#';
    
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
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule New Hearing</DialogTitle>
          {caseData ? <DialogDescription>
            Set the details for the next hearing for &quot;{caseData.title}&quot;.
          </DialogDescription> : <DialogDescription>Select a case and set the hearing details.</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {cases && cases.length > 0 && (
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="case" className="text-right">Case</Label>
                 <Select onValueChange={setSelectedCaseId} value={selectedCaseId}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a case" />
                    </SelectTrigger>
                    <SelectContent>
                        {cases.map(c => (
                            <SelectItem key={c.case_id} value={c.case_id}>{c.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
          )}
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
                  disabled={!caseData}
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
              className="col-span-3" 
              disabled={!caseData}
            />
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
              disabled={!caseData}
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
              disabled={!caseData}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between gap-2">
            <Button asChild variant="outline" disabled={!caseData || !date}>
                <a href={generateCalendarLink()} target="_blank" rel="noopener noreferrer">
                    Add to Google Calendar <ExternalLink className="ml-2 h-4 w-4" />
                </a>
            </Button>
          <Button onClick={handleSchedule} disabled={!caseData || !date}>Add to Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
